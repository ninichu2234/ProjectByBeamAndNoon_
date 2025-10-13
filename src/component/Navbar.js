"use client"; // <--- เพิ่มบรรทัดนี้เข้าไปเป็นบรรทัดแรกสุดครับ
import Link from "next/link"
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    return(<header className="bg-white shadow-sm sticky top-0 z-50">
    <div className="container mx-auto px-6">
      <div className="flex items-center justify-between h-16">
        {/* ส่วนที่ 1: โลโก้ (ซ้าย) */}
        <div className="flex items-center">
         <Link 
              href="/landing-page" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-bold text-gray-900">
            <span className="text-blue-600">My</span>Cafe
          </Link>
        </div>

      {/* ส่วนที่ 2: เมนูและปุ่ม (ขวา) - สำหรับ Desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="#" //รอใส่ลิ้งกันmenu
            className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >Menu
          </Link>

          <Link
            href="#" //รอใส่ลิ้งกัน member
            className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >Member
            </Link>
          
          {/*<Link
            href="/about-us"
            className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >เกี่ยวกับเรา
          </Link>*/}

          <Link 
          href="/chat">
              <button className="bg-amber-500 text-white px-6 py-2 rounded-full font-bold hover:bg-amber-600 transition-colors shadow">
                สั่งกับ AI เลย!
              </button>
            </Link>
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
  
        {/*<div className="hidden md:block">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            เริ่มต้นใช้งาน
          </button>
        </div>*/}

{/* เมนูสำหรับ Mobile (เปิด/ปิด)      */}
      {/* ======================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="flex flex-col space-y-4 p-5">
            {/* ปุ่มสั่งซื้อจะเด่นที่สุด */}
            <Link href="/chat">
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="w-full bg-amber-500 text-white py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors"
              >
                สั่งกับ AI เลย!
              </button>
            </Link>
            
            <Link 
              href="/menu" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-gray-700 hover:text-amber-600 font-medium text-lg text-center py-2"
            >
              เมนู
            </Link>
            
            <hr/>
            
            <Link 
              href="/member" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-gray-700 hover:text-amber-600 font-medium text-lg text-center py-2"
            >
              สมาชิก / เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      )}
      
        <button className="md:hidden text-gray-700">
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>
    </div>
  </header>
);
}