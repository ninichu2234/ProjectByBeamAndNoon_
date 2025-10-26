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
      // Ensure data and publicUrl exist before accessing
      const publicImageUrl = data?.publicUrl || ''; 
      return { ...item, publicImageUrl };
    }
    return { ...item, publicImageUrl: '' }; // Ensure publicImageUrl always exists
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
 
  useEffect(() => {
    async function fetchData() {
      const items = await getMenuItems();
      const cats = await getCategories();
      setMenuItems(items);
      setCategories(cats);
    }
    fetchData();
  }, []);
 
  // No handleAddToCart needed here anymore
 
  return (
    <div className="bg-gray-50 min-h-screen"> {/* Light background */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-1/4 lg:w-1/5">
            <div className="sticky top-24 bg-white p-4 rounded-lg shadow-sm border border-gray-200"> {/* Styled sidebar */}
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">หมวดหมู่</h2>
              <nav className="flex flex-col space-y-2"> {/* Reduced spacing */}
                {categories.map(category => (
                  <Link
                    key={category}
                    href={`#${category.replace(/\s+/g, '-')}`}
                    className="text-gray-700 hover:text-amber-600 font-medium transition-colors text-base" // Adjusted size
                  >
                    {category}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
 
          {/* Main Content */}
          <main className="flex-1">
            {/* Promotions Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">โปรโมชั่นพิเศษ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Promo cards */}
                <div className="bg-amber-100 rounded-lg p-6 flex items-center shadow-sm border border-amber-200"> {/* Added border */}
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-amber-800">จับคู่สุดคุ้ม</h3>
                        <p className="text-amber-700 text-sm">เครื่องดื่ม + เบเกอรี่ ลด 15%</p>
                    </div>
                    {/* Optional Icon */}
                     <span className="text-3xl text-amber-500 ml-4">🎉</span>
                </div>
                <div className="bg-green-100 rounded-lg p-6 flex items-center shadow-sm border border-green-200"> {/* Added border */}
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-green-800">เมนูใหม่ต้องลอง!</h3>
                        <p className="text-green-700 text-sm">Yuzu Cold Brew สดชื่นรับวันใหม่</p>
                    </div>
                     <span className="text-3xl text-green-500 ml-4">✨</span>
                </div>
              </div>
            </section>
 
            {/* Menu Sections */}
            <div className="space-y-12">
              {categories.map(category => (
                <section key={category} id={category.replace(/\s+/g, '-')} className="scroll-mt-24">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-amber-500"> {/* Highlighted border */}
                    {category}
                  </h2>
                  {/* Changed grid layout slightly */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8"> 
                    {menuItems
                      .filter(item => item.menuCategory === category)
                      .map(item => (
                        // ‼️‼️ Wrap the entire item presentation in a Link ‼️‼️
                        <Link 
                            key={item.menuId} 
                            href={`/menuDetail/${item.menuId}`} 
                            className="group block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-amber-400 transition-all duration-300 cursor-pointer" // Added styling to the Link
                        >
                            <div className="flex items-center space-x-4">
                                <Image
                                    src={item.publicImageUrl || 'https://placehold.co/100x100/DDD/333?text=N/A'} // Fallback image
                                    alt={item.menuName || 'Menu Item'} // Added fallback alt text
                                    width={80} // Slightly smaller image
                                    height={80}
                                    className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-md transform group-hover:scale-105 transition-transform duration-300" // Adjusted image style
                                />
                                <div className="flex-1 min-w-0"> {/* Added min-w-0 for text truncation */}
                                    <h3 className="text-lg font-semibold text-gray-800 truncate">{item.menuName || 'Unnamed Item'}</h3> {/* Added truncate */}
                                    {/* Optional: Limit description length or hide on smaller screens */}
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.menuDescription}</p> 
                                    <p className="text-md font-bold text-amber-600 mt-2">{item.menuPrice} ฿</p>
                                </div>
                                {/* The "+" button is now just a visual indicator inside the Link */}
                                <div className="flex-shrink-0 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                            </div>
                        </Link> 
                        // ‼️‼️ End of Link wrapper ‼️‼️
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