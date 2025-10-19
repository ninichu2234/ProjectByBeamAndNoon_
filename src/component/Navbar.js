"use client";
import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  // State สำหรับเก็บจำนวนสินค้าในตะกร้า (ตัวอย่าง)
  const [cartItemCount, setCartItemCount] = useState(3);

  // ไอคอนแก้วน้ำ (SVG)
  const WaterGlassIcon = () => (
    
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.2 3.2a.5.5 0 0 0-.6.4L13 10h6l-1.6-6.4a.5.5 0 0 0-.6-.4Z"/>
      <path d="m6 10 1.5-6.4a.5.5 0 0 1 .6-.4h8.8a.5.5 0 0 1 .6.4L18 10"/>
      <path d="M6 10h12"/>
      <path d="M6 10v10c0 .6.4 1 1 1h10c.6 0 1-.4 1-1V10"/>
      
    </svg>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 relative">
          {/* ส่วนที่ 1: โลโก้ (ซ้าย) */}
          <div className="flex items-center">
            <a 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-bold text-gray-900">
              <span className="text-blue-600">My</span>Cafe
            </a>
          </div>

          {/* ส่วนที่ 2: เมนูและปุ่ม (ขวา) - สำหรับ Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/menu-page"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >
              Menu
            </a>
            <a
              href="/member"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >
              Member
            </a>
            
            {/* ------------ ส่วนของไอคอนแก้วน้ำ (ตะกร้า) ที่เพิ่มเข้ามา ------------ */}
            <a href="/cart" className="relative text-gray-700 hover:text-blue-600 transition-colors duration-300">
              <WaterGlassIcon />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-3 flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full">
                  {cartItemCount}
                </span>
              )}
            </a>
            {/* ----------------------------------------------------------------- */}

            <a href="/chat">
              <button className="bg-amber-500 text-white px-6 py-2 rounded-full font-bold hover:bg-amber-600 transition-colors shadow">
                สั่งกับ AI เลย!
              </button>
            </a>
          </nav>

          {/* ส่วนที่ 3: ปุ่ม Hamburger - สำหรับ Mobile */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-gray-700"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-7 w-7" /> // ไอคอนปิด
              ) : (
                <Bars3Icon className="h-7 w-7" /> // ไอคอนเปิด
              )}
            </button>
          </div>
        </div>

        {/* ======================================= */}
        {/* เมนูสำหรับ Mobile (เปิด/ปิด)      */}
        {/* ======================================= */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg animate-fade-in-down">
            <div className="flex flex-col space-y-4 p-5">
              {/* ปุ่มสั่งซื้อจะเด่นที่สุด */}
              <a href="/chat">
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="w-full bg-amber-500 text-white py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors"
                >
                  สั่งกับ AI เลย!
                </button>
              </a>
              
              <a 
                href="/menu-page" 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-gray-700 hover:text-amber-600 font-medium text-lg text-center py-2"
              >
                Menu
              </a>

              {/* ------------ ลิงก์ไปยังหน้าตะกร้าสินค้าสำหรับ Mobile ที่เพิ่มเข้ามา ------------ */}
              <a 
                href="/cart"
                onClick={() => setMobileMenuOpen(false)} 
                className="text-gray-700 hover:text-amber-600 font-medium text-lg text-center py-2 relative flex justify-center items-center"
              >
                Member
                {cartItemCount > 0 && (
                  <span className="ml-2 flex items-center justify-center w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </a>
              {/* ---------------------------------------------------------------------- */}
              
              <hr/>
              
              <a 
                href="/member" 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-gray-700 hover:text-amber-600 font-medium text-lg text-center py-2"
              >
                สมาชิก / เข้าสู่ระบบ
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

