// 1. ✨ เปลี่ยนเป็น Client Component ✨
"use client";

import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
// 1. ✨ Import Hooks ที่จำเป็น ✨
import { useState, useEffect } from 'react';

// --- ฟังก์ชัน getMenuItems (เหมือนเดิม) ---
async function getMenuItems() {
  const { data: menuItems, error } = await supabase
    .from('menuItems')
    .select('*')
    .order('menuId', { ascending: true });

  if (error) {
    console.error('Error fetching menu items:', error.message);
    return [];
  }

  const getFolderName = (category) => {
    switch (category) {
      case 'Coffee': return 'Drink';
      case 'Tea': return 'Drink';
      case 'Milk': return 'Drink';
      case 'Refreshers': return 'Drink';
      case 'Bakery': return 'Bakery';
      case 'Cake': return 'Bakery';
      case 'Dessert': return 'Bakery';
      case 'Other': return 'orther';
      default: return category;
    }
  };

  const itemsWithImages = menuItems.map(item => {
    if (item.menuImage && item.menuCategory) {
      const folderName = getFolderName(item.menuCategory);
      const imagePath = `${folderName}/${item.menuImage}`;
      const { data: imageData } = supabase
        .storage
        .from('menu-images') 
        .getPublicUrl(imagePath);
      return { ...item, publicImageUrl: imageData.publicUrl };
    }
    return item;
  });

  return itemsWithImages;
}

// --- ฟังก์ชัน getCategories (เหมือนเดิม) ---
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


// --- ✨ แก้ไข Component หลัก ✨ ---
export default function MenuPage() {
  // 1. ✨ สร้าง State เพื่อเก็บข้อมูล (แทน async/await ที่ component) ✨
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  // 1. ✨ ดึงข้อมูลใน useEffect เมื่อหน้าเว็บโหลด (แบบ Client Component) ✨
  useEffect(() => {
    async function fetchData() {
      const items = await getMenuItems();
      const cats = await getCategories();
      setMenuItems(items);
      setCategories(cats);
    }
    fetchData();
  }, []); // [] หมายถึงให้ทำงานแค่ครั้งเดียวตอนโหลดหน้า

  // 2. ✨ ฟังก์ชันสำหรับเพิ่มสินค้าลงตะกร้า (localStorage) ✨
  const handleAddToCart = (itemToAdd) => {
    try {
      const savedCartJSON = localStorage.getItem('myCafeCart');
      const currentCart = savedCartJSON ? JSON.parse(savedCartJSON) : [];

      const existingItemIndex = currentCart.findIndex(item => item.menuId === itemToAdd.menuId);

      if (existingItemIndex > -1) {
        // ถ้ามีของอยู่แล้ว ให้บวก 1
        currentCart[existingItemIndex].quantity += 1;
      } else {
        // ถ้ายังไม่มี ให้เพิ่มเข้าไปใหม่
        // ✨ นี่คือส่วนที่สำคัญที่สุด: เราส่ง itemToAdd ทั้งหมด (ที่มี publicImageUrl) เข้าไป
        currentCart.push({ ...itemToAdd, quantity: 1 });
      }

      // บันทึกตะกร้าที่อัปเดตแล้วกลับลง localStorage
      localStorage.setItem('myCafeCart', JSON.stringify(currentCart));
      alert(`${itemToAdd.menuName} ถูกเพิ่มลงในตะกร้าแล้ว!`);
    } catch (error) {
      console.error("Failed to update cart in localStorage", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า");
    }
  };


  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* ... ส่วน Sidebar เหมือนเดิม ... */}
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
            {/* ... ส่วนโปรโมชั่น เหมือนเดิม ... */}
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
                        // 3. ✨ แก้ไขส่วนแสดงผลเมนูให้มีปุ่ม Add ✨
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
                          {/* 3. ✨ ปุ่ม Add to Cart ที่เพิ่มเข้ามา ✨ */}
                          <div className="flex-shrink-0">
                              <button
                                  onClick={() => handleAddToCart(item)}
                                  className="bg-amber-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-amber-600 transition-colors shadow"
                                  aria-label={`Add ${item.menuName} to cart`}
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                              </button>
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