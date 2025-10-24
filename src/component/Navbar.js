"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- (ส่วนของไอคอนต่างๆ เหมือนเดิม) ---
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
const WaterGlassIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.2 3.2a.5.5 0 0 0-.6.4L13 10h6l-1.6-6.4a.5.5 0 0 0-.6-.4Z" />
        <path d="m6 10 1.5-6.4a.5.5 0 0 1 .6-.4h8.8a.5.5 0 0 1 .6.4L18 10" />
        <path d="M6 10h12" />
        <path d="M6 10v10c0 .6.4 1 1 1h10c.6 0 1-.4 1-1V10" />
    </svg>
);
// --- (จบส่วนไอคอน) ---


export default function Header() {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    // [!! ลบออก !!] ไม่ต้องใช้ isScrolled แล้ว
    // const [isScrolled, setIsScrolled] = useState(false); 
    const [cartCount, setCartCount] = useState(0);

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

    useEffect(() => {
        // [!! ลบออก !!] ลบส่วนของ handleScroll ออกไป
        // --- 1. จัดการการ scroll ของ header ---
        
        // --- 2. จัดการการอัปเดตจำนวนสินค้าในตะกร้า ---
        updateCartCount(); 
        window.addEventListener('local-storage', updateCartCount); 

        return () => {
            // [!! ลบออก !!]
            // window.removeEventListener('scroll', handleScroll); 
            window.removeEventListener('local-storage', updateCartCount);
        };
    }, []); 

    return (
        // ลบ logic การเปลี่ยนสีออก ใส่สีน้ำตาล 'bg-[#4A3728]' ไปตรงๆ เลย
        <header className="bg-[#4A3728] shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16 relative">
                    {/* ส่วนที่ 1: โลโก้ (ซ้าย) */}
                    <div className="flex items-center">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold">
                            {/* [!! แก้ไข !!] เปลี่ยนเป็น 'text-white' ถาวร */}
                            <span className="text-xl font-bold text-white">MyCafe</span>
                        </Link>
                    </div>

                    {/* ส่วนที่ 2: เมนูและปุ่ม (ขวา) - สำหรับ Desktop */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {/* [!! แก้ไข !!] เปลี่ยนเป็น 'text-white' ถาวร */}
                        <Link href="/menu-page" className="text-white hover:text-green-700 transition-colors duration-300">
                            Menu
                        </Link>
                        <Link href="/member" className="text-white hover:text-green-700 transition-colors duration-300">
                            Member
                        </Link>
                        
                        <Link href="/basket" className="relative text-white hover:text-green-700 transition-colors duration-300">
                            <WaterGlassIcon />
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
                        {/* [!! แก้ไข !!] เปลี่ยนเป็น 'text-white' ถาวร */}
                        <Link href="/basket" className="relative text-white">
                            <WaterGlassIcon />
                             {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        {/* [!! แก้ไข !!] เปลี่ยนเป็น 'text-white' ถาวร */}
                        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                            {isMobileMenuOpen ? <XMarkIcon /> : <Bars3Icon />}
                        </button>
                    </div>
                </div>

                {/* เมนูสำหรับ Mobile (เปิด/ปิด) */}
                {isMobileMenuOpen && (
                    // [!! แก้ไขจุดนี้ !!]
                    // ส่วนนี้เป็นสีขาว ถูกต้องแล้ว เพราะเป็นเมนูที่เด้งลงมา
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