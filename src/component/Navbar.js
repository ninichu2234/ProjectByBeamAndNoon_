"use client";
// ‼️ เพิ่ม: Import useState และ useEffect จาก React ‼️
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ไอคอนสำหรับเมนู
const Bars3Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
const XMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// ไอคอนแก้วน้ำ (ตะกร้าสินค้า) - แก้ไข SVG props
const IconBuskt = () => (
     <span className="inline-flex items-center justify-center p-1 bg-white/20 rounded-full">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             // แก้ไข: stroke-width -> strokeWidth
             strokeWidth="2"
             // แก้ไข: stroke-linecap -> strokeLinecap
             strokeLinecap="round"
             // แก้ไข: stroke-linejoin -> strokeLinejoin
             strokeLinejoin="round"
             // แก้ไข: class -> className (ถ้าใช้ React)
             className="lucide lucide-cup-soda-icon lucide-cup-soda"><path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"/><path d="M5 8h14"/><path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/><path d="m12 8 1-6h2"/></svg>
     </span>
);


export default function Header() {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    // ฟังก์ชันสำหรับอัปเดตจำนวนสินค้าในตะกร้าจาก localStorage
    const updateCartCount = () => {
        // ‼️ เพิ่ม: ตรวจสอบว่าโค้ดรันฝั่ง Client หรือไม่ ก่อนเรียก localStorage ‼️
        if (typeof window !== 'undefined') {
            try {
                const savedCartJSON = localStorage.getItem('myCafeCart');
                const cartItems = savedCartJSON ? JSON.parse(savedCartJSON) : [];
                // ‼️ เพิ่ม: ตรวจสอบ cartItems ก่อน reduce ‼️
                const totalItems = Array.isArray(cartItems)
                    ? cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
                    : 0;
                setCartCount(totalItems);
            } catch (error) {
                console.error("Failed to update cart count from localStorage", error);
                setCartCount(0); // Set to 0 if error occurs
            }
        }
    };


    // useEffect for handling event listeners
    useEffect(() => {
        // ‼️ เพิ่ม: ตรวจสอบว่าโค้ดรันฝั่ง Client หรือไม่ ก่อนเรียก window ‼️
        if (typeof window !== 'undefined') {
            // --- 1. Update cart count on initial load and storage change ---
            updateCartCount(); // Update on initial load
            window.addEventListener('local-storage', updateCartCount); // Listen for changes from other tabs/pages

            // --- 2. Cleanup function: remove listener when component unmounts ---
            return () => {
                window.removeEventListener('local-storage', updateCartCount);
            };
        }
    }, []); // Empty dependency array ensures this runs only once on mount and unmount


    return (
        // Navbar is always brown, text is always white
        <header className="bg-[#4A3728] shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16 relative">
                    {/* Part 1: Logo (Left) */}
                    <div className="flex items-center">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold">
                            <span className="text-xl font-bold text-white">MyCafe</span>
                        </Link>
                    </div>

                    {/* Part 2: Menu and Buttons (Right) - For Desktop */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="/menu-page" className="text-white hover:text-green-700 transition-colors duration-300">
                            Menu
                        </Link>
                        <Link href="/member" className="text-white hover:text-green-700 transition-colors duration-300">
                            Member
                        </Link>

                        <Link href="/basket" className="relative text-white hover:text-green-700 transition-colors duration-300">
                            <IconBuskt /> {/* Use the corrected icon */}
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-3 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <Link href="/chat">
                            <button className="bg-green-800 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition-colors shadow">
                                สั่งกับ AI เลย!
                            </button>
                        </Link>
                    </nav>


                    <div className="md:hidden flex items-center space-x-4">
                        <Link href="/basket" className="relative text-white">
                            <IconBuskt /> {/* Use the corrected icon */}
                             {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                            {isMobileMenuOpen ? <XMarkIcon /> : <Bars3Icon />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu (Toggles) */}
                {isMobileMenuOpen && (
                    // This part is white, which is correct as it's a dropdown menu
                    <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg">
                        <div className="flex flex-col space-y-4 p-5">
                            <Link  href="/chat" onClick={() => setMobileMenuOpen(false)} className="w-full bg-green-800 text-white text-center py-3 rounded-lg font-bold hover:bg-green-700 transition-colors">
                                สั่งกับ AI เลย!
                            </Link>
                            <Link href="/menu-page" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-green-700 font-medium text-lg text-center py-2">
                                Menu
                            </Link>
                            <Link href="/member" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-green-700 font-medium text-lg text-center py-2">
                                Member
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

