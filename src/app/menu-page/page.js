import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

// --- ✨ แก้ไขฟังก์ชัน getMenuItems ที่นี่ ✨ ---
async function getMenuItems() {
  const { data: menuItems, error } = await supabase
    .from('menuItems')
    .select('*')
    .order('menuId', { ascending: true });

  if (error) {
    console.error('Error fetching menu items:', error.message);
    return [];
  }

  // ✨ (ส่วนที่เพิ่มเข้ามา) ฟังก์ชันสำหรับ "แปล" ชื่อหมวดหมู่เป็นชื่อ Folder ✨
  const getFolderName = (category) => {
    // คุณสามารถเพิ่ม/แก้ไข "คำแปล" ได้ตรงนี้
    switch (category) {
      case 'Coffee':
        return 'Drink'; // ถ้าหมวดหมู่คือ Coffee ให้ไปหาใน Folder ชื่อ Drink
      case 'Tea':
        return 'Drink'; // ถ้าหมวดหมู่คือ Tea ก็ให้ไปหาใน Folder ชื่อ Drink เช่นกัน
      case 'Milk':
        return 'Drink'; // ถ้าหมวดหมู่คือ Tea ก็ให้ไปหาใน Folder ชื่อ Drink เช่นกัน
      case 'Refreshers':
        return 'Drink'; // ถ้าหมวดหมู่คือ Tea ก็ให้ไปหาใน Folder ชื่อ Drink เช่นกัน
      case 'Bakery':
        return 'Bakery'; // ถ้าหมวดหมู่คือ Tea ก็ให้ไปหาใน Folder ชื่อ Drink เช่นกัน
      case 'Cake':
        return 'Bakery'; // ถ้าหมวดหมู่คือ Tea ก็ให้ไปหาใน Folder ชื่อ Drink เช่นกัน
      case 'Dessert':
        return 'Bakery'; // ถ้าหมวดหมู่คือ Tea ก็ให้ไปหาใน Folder ชื่อ Drink เช่นกัน
      case 'Other':
        return 'orther'; // ถ้าหมวดหมู่คือ Other ให้ไปหาใน Folder ชื่อ orther
      // สำหรับหมวดหมู่อื่นๆ ที่ชื่อตรงกันอยู่แล้ว เช่น Bakery
      default:
        return category; // คืนค่าชื่อหมวดหมู่เดิมไปเลย
    }
  };

  const itemsWithImages = menuItems.map(item => {
    if (item.menuImage && item.menuCategory) {
      
      const folderName = getFolderName(item.menuCategory); // เรียกใช้ฟังก์ชันแปลภาษา
      const imagePath = `${folderName}/${item.menuImage}`; // สร้าง Path ที่ถูกต้อง
        console.log('Generated Image Path:', imagePath);
      const { data: imageData } = supabase
        .storage
        .from('menu-images') // ‼️ ชื่อ Bucket ของคุณ
        .getPublicUrl(imagePath);

      return { ...item, publicImageUrl: imageData.publicUrl };
    }
    return item;
  });

  return itemsWithImages;
}

// (ฟังก์ชัน getCategories เหมือนเดิม ไม่ต้องแก้ไข)
async function getCategories() {
    const desiredOrder = ['Coffee', 'Tea', 'Milk', 'Refreshers', 'Bakery', 'Cake', 'Dessert', 'Other'];
    const { data, error } = await supabase.from('menuItems').select('menuCategory');
    if (error) { console.error('Error fetching categories:', error.message); return []; }
    const uniqueCategories = [...new Set(data.map(item => item.menuCategory))];
    uniqueCategories.sort((a, b) => {
        const indexA = desiredOrder.indexOf(a) === -1 ? Infinity : desiredOrder.indexOf(a);
        const indexB = desiredOrder.indexOf(b) === -1 ? Infinity : desiredOrder.indexOf(b);
        return indexA - indexB;
    });
    return uniqueCategories;
}

export default async function MenuPage() {
  const menuItems = await getMenuItems();
  const categories = await getCategories();

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-1/4 lg:w-1/5">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">หมวดหมู่</h2>
              <nav className="flex flex-col space-y-3">
                {categories.map(category => (
                  <a key={category} href={`#${category.replace(/\s+/g, '-')}`} className="text-gray-600 hover:text-amber-600 font-medium transition-colors text-lg">
                    {category}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
          <main className="flex-1">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">โปรโมชั่นพิเศษ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-amber-100 rounded-lg p-6 flex items-center shadow-sm"><div className="flex-1"><h3 className="font-bold text-lg text-amber-800">จับคู่สุดคุ้ม</h3><p className="text-amber-700">เครื่องดื่ม + เบเกอรี่ ลด 15%</p></div></div>
                <div className="bg-green-100 rounded-lg p-6 flex items-center shadow-sm"><div className="flex-1"><h3 className="font-bold text-lg text-green-800">เมนูใหม่ต้องลอง!</h3><p className="text-green-700">Yuzu Cold Brew สดชื่นรับวันใหม่</p></div></div>
              </div>
            </section>
            <div className="space-y-12">
              {categories.map(category => (
                <section key={category} id={category.replace(/\s+/g, '-')} className="scroll-mt-24">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-gray-200">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {menuItems
                      .filter(item => item.menuCategory === category)
                      .map(item => (
                        <div key={item.menuId} className="flex items-center space-x-4 group">
                          <img 
                            src={item.publicImageUrl || 'https://placehold.co/100x100/FFF/333?text=No+Image'} 
                            alt={item.menuName} 
                            className="w-24 h-24 rounded-full object-cover shadow-md transform group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">{item.menuName}</h3>
                            <p className="text-sm text-gray-500">{item.menuDescription}</p>
                            <p className="text-md font-bold text-amber-600 mt-1">{item.menuPrice} ฿</p>
                          </div>
                        </div>
                      ))}
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