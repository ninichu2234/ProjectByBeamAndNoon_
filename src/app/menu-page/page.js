// src/app/menu/page.js

"use client";
 
import { supabase } from '../lib/supabaseClient'; // Ensure this path is correct
import Link from 'next/link'; 
import Image from 'next/image';
import { useState, useEffect } from 'react';
 
// --- (getMenuItems and getCategories functions remain the same) ---
async function getMenuItems() {
  console.log("Fetching menu items...");
  const { data: menuItems, error } = await supabase
    .from('menuItems')
    .select('*')
    .order('menuId', { ascending: true });
 
  if (error) { console.error('Error fetching menu items:', error.message); return []; }
  console.log(`Fetched ${menuItems.length} items.`);
 
  const getFolderName = (category) => { 
    switch(category){ case 'Coffee': case 'Tea': case 'Milk': case 'Refreshers': return 'Drink'; case 'Bakery': case 'Cake': case 'Dessert': return 'Bakery'; case 'Other': return 'Other'; default: return category;} };
 
  const itemsWithImages = menuItems.map(item => {
    if (item.menuImage && item.menuCategory) {
      const folderName = getFolderName(item.menuCategory);
      const imagePath = `${folderName}/${item.menuImage}`;
      const { data } = supabase.storage.from('menu-images').getPublicUrl(imagePath);
      const publicImageUrl = data?.publicUrl || ''; 
      return { ...item, publicImageUrl };
    }
    return { ...item, publicImageUrl: '' };
  });
  return itemsWithImages;
}
 
async function getCategories() {
  console.log("Fetching categories...");
  const desiredOrder = ['Coffee', 'Tea', 'Milk', 'Refreshers', 'Bakery', 'Cake', 'Dessert', 'Other'];
  const { data, error } = await supabase.from('menuItems').select('menuCategory');
  if (error) { console.error('Error fetching categories:', error.message); return []; }
  const uniqueCategories = [...new Set(data.map(item => item.menuCategory))];
  uniqueCategories.sort((a, b) => {
    const indexA = desiredOrder.indexOf(a) === -1 ? Infinity : desiredOrder.indexOf(a);
    const indexB = desiredOrder.indexOf(b) === -1 ? Infinity : desiredOrder.indexOf(b);
    return indexA - indexB;
  });
   console.log("Fetched categories:", uniqueCategories);
  return uniqueCategories;
}
 
// --- Main Component ---
export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // ‼️ 1. เพิ่ม State สำหรับการค้นหา ‼️
  const [searchQuery, setSearchQuery] = useState('');
 
  useEffect(() => {
    async function fetchData() {
      const items = await getMenuItems();
      const cats = await getCategories();
      setMenuItems(items);
      setCategories(cats);
    }
    fetchData();
  }, []);
 
  // ‼️ 2. สร้างรายการเมนูที่กรองตาม searchQuery ‼️
  // จะค้นหาทั้งใน 'ชื่อเมนู' และ 'คำอธิบาย'
  const filteredMenuItems = menuItems.filter(item => 
    item.menuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.menuDescription && item.menuDescription.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ‼️ 3. สร้างรายการหมวดหมู่ที่จะแสดง ‼️
  // (จะแสดงเฉพาะหมวดหมู่ที่มีสินค้าที่ตรงกับการค้นหา)
  const visibleCategories = categories.filter(category =>
    filteredMenuItems.some(item => item.menuCategory === category)
  );
 
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar (ไม่มีการเปลี่ยนแปลง) */}
          <aside className="md:w-1/4 lg:w-1/5">
            <div className="sticky top-24 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Category</h2>
              <nav className="flex flex-col space-y-2">
                {categories.map(category => ( // Sidebar ยังคงแสดงทุกหมวดหมู่
                  <Link
                    key={category}
                    href={`#${category.replace(/\s+/g, '-')}`}
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors text-base"
                  >
                    {category}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
 
          {/* Main Content */}
          <main className="flex-1">

            {/* ‼️ 4. เพิ่มช่องค้นหา (Search Bar) ‼️ */}
            <section className="mb-8">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search menu"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                </div>
            </section>
 

            {/* Menu Sections */}
            <div className="space-y-12">
              
              {/* ‼️ 5. เพิ่มข้อความ "ไม่พบผลลัพธ์" ‼️ */}
              {filteredMenuItems.length === 0 && searchQuery.length > 0 && (
                <div className="text-center text-gray-500 py-12">
                  <h3 className="text-xl font-semibold">Could not find</h3>
                  <p>Please try again</p>
                </div>
              )}

              {/* ‼️ 6. อัปเดต Map ให้ใช้ 'visibleCategories' และ 'filteredMenuItems' ‼️ */}
              {visibleCategories.map(category => (
                <section key={category} id={category.replace(/\s+/g, '-')} className="scroll-mt-24">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-green-800">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8"> 
                    
                    {/* ใช้ filteredMenuItems และกรองตาม category ที่กำลัง loop */}
                    {filteredMenuItems
                      .filter(item => item.menuCategory === category)
                      .map(item => (
                        <Link 
                            key={item.menuId} 
                            href={`/menuDetail/${item.menuId}`} 
                            className="group block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-green-600 transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-center space-x-4">
                                <Image
                                    src={item.publicImageUrl || 'https://placehold.co/100x100/DDD/333?text=N/A'} 
                                    alt={item.menuName || 'Menu Item'}
                                    width={80} 
                                    height={80}
                                    className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-md transform group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="flex-1 min-w-0"> 
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {item.menuName || 'Unnamed Item'}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {item.menuDescription}
                                    </p> 
                                    <p className="text-md font-bold text-amber-600 mt-2">{item.menuPrice} ฿</p>
                                </div>
                                <div className="flex-shrink-0 bg-[#2c8160] text-white rounded-full h-8 w-8 flex items-center justify-center shadow-lg group-hover:bg-green-700 transition-colors duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                                    </svg>
                                </div>
                            </div>
                        </Link> 
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