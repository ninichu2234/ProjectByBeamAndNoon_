import { supabase } from '../lib/supabaseClient';
import Link from 'next/link'; // Import Link for potential future use

// --- 1. สร้างฟังก์ชันสำหรับดึงข้อมูลเมนูทั้งหมด ---
async function getMenuItems() {
  const { data, error } = await supabase
    .from('menuItems') // <-- **สำคัญ:** ตรวจสอบชื่อตารางให้ถูกต้อง
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching menu items:', error.message);
    return [];
  }
  return data;
}

// --- 2. สร้างฟังก์ชันสำหรับดึง "หมวดหมู่" ที่ไม่ซ้ำกัน ---
async function getCategories() {
    // สมมติว่าในตาราง menuItems ของคุณมีคอลัมน์ชื่อ 'category'
    const { data, error } = await supabase
    .from('menuItems')
    .select('menuCategory');

    if (error) {
        console.error('Error fetching categories:', error.message);
        return [];
    }
    
    // ทำให้หมวดหมู่ไม่ซ้ำกัน
    const uniqueCategories = [...new Set(data.map(item => item.category))];
    return uniqueCategories;
}


export default async function MenuPage() {
  // --- 3. ดึงข้อมูลทั้งสองส่วนพร้อมกัน ---
  const menuItems = await getMenuItems();
  const categories = await getCategories();

  console.log('Categories fetched:', categories);

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* ======================================= */}
          {/* ส่วนที่ 1: Sidebar (ซ้าย)             */}
          {/* ======================================= */}
          <aside className="md:w-1/4 lg:w-1/5">
            <div className="sticky top-24"> {/* top-24 เพื่อให้ไม่ชนกับ Navbar */}
              <h2 className="text-xl font-bold text-gray-800 mb-4">หมวดหมู่</h2>
              <nav className="flex flex-col space-y-3">
                {categories.map(category => (
                  <a 
                    key={category}
                    href={`#${category.replace(/\s+/g, '-')}`} // สร้าง anchor link เช่น #ชา-อื่นๆ
                    className="text-gray-600 hover:text-amber-600 font-medium transition-colors text-lg"
                  >
                    {category}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* ======================================= */}
          {/* ส่วนที่ 2: Content (ขวา)              */}
          {/* ======================================= */}
          <main className="flex-1">
            
            {/* --- ส่วนโปรโมชั่น --- */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">โปรโมชั่นพิเศษ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ตัวอย่าง Banner โปรโมชั่น */}
                <div className="bg-amber-100 rounded-lg p-6 flex items-center shadow-sm">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-amber-800">จับคู่สุดคุ้ม</h3>
                    <p className="text-amber-700">เครื่องดื่ม + เบเกอรี่ ลด 15%</p>
                  </div>
                </div>
                <div className="bg-green-100 rounded-lg p-6 flex items-center shadow-sm">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-green-800">เมนูใหม่ต้องลอง!</h3>
                    <p className="text-green-700">Yuzu Cold Brew สดชื่นรับวันใหม่</p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* --- ส่วนแสดงเมนูตามหมวดหมู่ --- */}
            <div className="space-y-12">
              {categories.map(category => (
                <section key={category} id={category.replace(/\s+/g, '-')} className="scroll-mt-24"> {/* scroll-mt-24 กัน Navbar บัง */}
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-gray-200">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {menuItems
                      .filter(item => item.category === category)
                      .map(item => (
                        <div key={item.id} className="flex items-center space-x-4 group">
                          <img 
                            src={item.image_url || 'https://placehold.co/100x100/FFF/333?text=No+Image'} 
                            alt={item.name} 
                            className="w-24 h-24 rounded-full object-cover shadow-md transform group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.description}</p>
                            <p className="text-md font-bold text-amber-600 mt-1">{item.price} ฿</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}