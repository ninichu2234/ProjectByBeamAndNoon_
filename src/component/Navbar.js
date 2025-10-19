"use client";
import React, { useState, useEffect } from 'react';

// ไอคอนสำหรับเมนู (Hamburger & Close)
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

// ไอคอนแก้วน้ำ (ตะกร้าสินค้า)
const WaterGlassIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.2 3.2a.5.5 0 0 0-.6.4L13 10h6l-1.6-6.4a.5.5 0 0 0-.6-.4Z" />
        <path d="m6 10 1.5-6.4a.5.5 0 0 1 .6-.4h8.8a.5.5 0 0 1 .6.4L18 10" />
        <path d="M6 10h12" />
        <path d="M6 10v10c0 .6.4 1 1 1h10c.6 0 1-.4 1-1V10" />
    </svg>
);

export default function Header() {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    // ฟังก์ชันสำหรับอัปเดตจำนวนสินค้าในตะกร้าจาก localStorage
    const updateCartCount = () => {
        try {
            const savedCartJSON = localStorage.getItem('myCafeCart');
            const cartItems = savedCartJSON ? JSON.parse(savedCartJSON) : [];
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
        } catch (error) {
            console.error("Failed to update cart count from localStorage", error);
            setCartCount(0);
        }
    };

    // useEffect สำหรับจัดการ event listeners ทั้งหมด
    useEffect(() => {
        // --- 1. จัดการการ scroll ของ header ---
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        // --- 2. จัดการการอัปเดตจำนวนสินค้าในตะกร้า ---
        updateCartCount(); // อัปเดตครั้งแรกตอนโหลด
        window.addEventListener('local-storage', updateCartCount); // "ฟัง" การเปลี่ยนแปลงจากหน้าอื่น

        // Cleanup function: ลบ event listeners ทั้งหมดออกเมื่อ component ถูกปิด
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('local-storage', updateCartCount);
        };
    }, []); // [] ทำให้โค้ดส่วนนี้ทำงานแค่ครั้งเดียว

    return (
        <header className={`${isScrolled ? 'bg-[#4A3728]' : 'bg-white'} shadow-sm sticky top-0 z-50 transition-colors duration-300`}>
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16 relative">
                    {/* ส่วนที่ 1: โลโก้ (ซ้าย) */}
                    <div className="flex items-center">
                        <a href="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold">
                            <span className={`text-xl font-bold ${isScrolled ? 'text-white' : 'text-gray-800'}`}>MyCafe</span>
                        </a>
                    </div>

                    {/* ส่วนที่ 2: เมนูและปุ่ม (ขวา) - สำหรับ Desktop */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="/menu-page" className={`${isScrolled ? 'text-white' : 'text-gray-700'} hover:text-green-700 transition-colors duration-300`}>
                            Menu
                        </a>
                        <a href="/member" className={`${isScrolled ? 'text-white' : 'text-gray-700'} hover:text-green-700 transition-colors duration-300`}>
                            Member
                        </a>
                        
                        <a href="/basket" className={`relative ${isScrolled ? 'text-white' : 'text-gray-700'} hover:text-green-700 transition-colors duration-300`}>
                            <WaterGlassIcon />
                            {/* [แก้ไข] ใช้ cartCount ที่เป็น dynamic state */}
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-3 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </a>
                        
                        <a href="/chat">
                            <button className="bg-green-800 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition-colors shadow">
                                สั่งกับ AI เลย!
                            </button>
                        </a>
                    </nav>

                    
                    <div className="md:hidden flex items-center space-x-4">
                        <a href="/basket" className={`relative ${isScrolled ? 'text-white' : 'text-gray-700'}`}>
                            <WaterGlassIcon />
                             {/* [แก้ไข] ใช้ cartCount ที่เป็น dynamic state สำหรับ Mobile ด้วย */}
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </a>
                        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className={`${isScrolled ? 'text-white' : 'text-gray-700'}`}>
                            {isMobileMenuOpen ? <XMarkIcon /> : <Bars3Icon />}
                        </button>
                    </div>
                </div>

                {/* เมนูสำหรับ Mobile (เปิด/ปิด) */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg">
                        <div className="flex flex-col space-y-4 p-5">
                            <a href="/chat" onClick={() => setMobileMenuOpen(false)} className="w-full bg-green-800 text-white text-center py-3 rounded-lg font-bold hover:bg-green-700 transition-colors">
                                สั่งกับ AI เลย!
                            </a>
                            <a href="/menu-page" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-green-700 font-medium text-lg text-center py-2">
                                Menu
                            </a>
                            <a href="/member" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-green-700 font-medium text-lg text-center py-2">
                                Member
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

