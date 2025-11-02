"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// ‼️ (บีม) Import 2 ตัวนี้จากโค้ดใหม่ของคุณ
import { useUser } from '@/app/context/UserContext'; 
import { supabase } from '@/app/lib/supabaseClient';

// --- (บีม) ไอคอนจากโค้ดใหม่ของคุณ ---
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

const SmallXIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// (บีม) ไอคอนตะกร้าแบบใหม่ (จากโค้ดของคุณ)
const IconBuskt = () => (
     <span className="inline-flex items-center justify-center p-1 bg-white/20 rounded-full">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2"
             strokeLinecap="round"
             strokeLinejoin="round"
             className="lucide lucide-cup-soda-icon lucide-cup-soda"><path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"/><path d="M5 8h14"/><path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/><path d="m12 8 1-6h2"/></svg>
     </span>
);

// (บีม) ใช้ชื่อ Component ว่า Header หรือ Navbar ก็ได้ครับ (ตามโค้ดใหม่ของคุณคือ Header)
export default function Header() { 
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [showHint, setShowHint] = useState(true);
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    // (บีม) ดึง user/profile จากโค้ดใหม่ของคุณ
    const { session, profile, loading } = useUser();

    // (บีม) ฟังก์ชัน updateCartCount จากโค้ดใหม่ของคุณ
    const updateCartCount = () => {
        if (typeof window !== 'undefined') {
            try {
                const savedCartJSON = localStorage.getItem('myCafeCart');
                const cartItems = savedCartJSON ? JSON.parse(savedCartJSON) : [];
                // (บีม) แก้ไข Logic การนับจำนวนเล็กน้อย (จากโค้ดเก่า) ให้ชัวร์
                const totalItems = Array.isArray(cartItems)
                    ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0) // ใช้ 1 ถ้า quantity ไม่มี
                    : 0;
                setCartCount(totalItems);
            } catch (error) {
                console.error("Failed to update cart count from localStorage", error);
                setCartCount(0); // Set to 0 if error occurs
            }
        }
    };

    // (บีม) useEffect จากโค้ดใหม่ของคุณ
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // --- 1. Update cart count on initial load and storage change ---
            updateCartCount(); 
            window.addEventListener('local-storage', updateCartCount); // Listen for changes

            // --- 2. Cleanup function: remove listener when component unmounts 
            return () => {
                window.removeEventListener('local-storage', updateCartCount);
            };
        }
    }, []); 

    return (
        <header className="bg-[#4A3728] shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16 relative">
                    <div className="flex items-center">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold">
                            <span className="text-xl font-bold text-white">MyCafe</span>
                        </Link>
                    </div>
                    {/* (บีม) NAV (Desktop) จากโค้ดใหม่ของคุณ */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="/menu-page" 
                        className={`text-white hover:text-green-700 transition-colors duration-300 px-3 py-1 rounded-md ${pathname === '/menu-page' ? 'bg-white/10' : ''}`}
                        >Menu
                        </Link>
                        {loading ? (
                            <div className="h-6 w-24 bg-white/20 rounded-md animate-pulse"></div>
                        ) : session ? (
                            // (ถ้าล็อกอินแล้ว)
                            <>
                                <Link 
                                    href="/member" 
                                    className={`text-white hover:text-green-700 transition-colors duration-300 px-3 py-1 rounded-md ${pathname === '/member' ? 'bg-white/10' : ''}`}
                                >
                                    {/* ถ้ามีชื่อใน profile ให้โชว์ชื่อ, ไม่มีโชว์ 'My Account' */}
                                    {profile?.fullName || 'My Account'}
                                </Link>
                            </>
                        ) : (
                            // (ถ้ายังไม่ล็อกอิน)
                        <div className="relative">
                            <Link 
                                href="/member" 
                                className={`text-white hover:text-green-700 transition-colors duration-300 px-3 py-1 rounded-md ${pathname === '/member' ? 'bg-white/10' : ''}`}
                                > Member
                            </Link>

                            {isHomePage && showHint && (
                                <>
                                    <div className="absolute top-full right-1/2 mr-[-10px] w-0 h-0 
                                                    border-l-[10px] border-l-transparent
                                                    border-r-[10px] border-r-transparent
                                                    border-b-[10px] border-b-white
                                                    z-50">
                                    </div>
                                    <div 
                                        className="absolute top-full right-0 mt-2.5 w-64 z-50"
                                        onClick={(e) => e.stopPropagation()} 
                                    >
                                        <div className="bg-white rounded-lg shadow-xl relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault(); 
                                                    e.stopPropagation(); 
                                                    setShowHint(false);
                                                }}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded-full"
                                                aria-label="Dismiss hint"
                                            >
                                                <SmallXIcon />
                                            </button>
                                            <div className="p-4 pt-5 text-gray-800">
                                                <p className="text-sm font-semibold">Are you a member?</p>
                                                <p className="text-sm mt-1">Click here to log in and collect points before ordering!</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                        <Link 
                            href="/about-us" 
                            className={`text-white hover:text-green-700 transition-colors duration-300 px-3 py-1 rounded-md ${pathname === '/about-us' ? 'bg-white/10' : ''}`}> 
                            About us
                        </Link>
                        <Link 
                            href="/basket" 
                            className={`relative text-white hover:text-green-700 transition-colors duration-300 px-3 py-1 rounded-md ${pathname === '/basket' ? 'bg-white/10' : ''}`}>
                            <IconBuskt />
                            {cartCount > 0 && (
                                // ‼️ (บีม) แก้ไขสไตล์ไอคอนตะกร้า (Desktop) ให้เป็นวงกลมสีแดง ‼️
                                <span className="absolute -top-2 -right-3 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                                    {cartCount}
                                </span>
                             )}
                        </Link>
                        
                        <Link href="/chat">
                            <button 
                                className={`bg-green-800 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition-colors shadow ${pathname === '/chat' ? 'ring-2 ring-white ring-offset-2 ring-offset-[#4A3728]' : ''}`}> 
                                Talk with AI!
                            </button>
                        </Link>
                    </nav>

                    {/* (บีม) NAV (Mobile) จากโค้ดใหม่ของคุณ */}
                    <div className="md:hidden flex items-center space-x-4">
                        <Link href="/basket" className="relative text-white">
                            <IconBuskt /> 
                             {cartCount > 0 && (
                                // ‼️ (บีม) ไอคอนตะกร้า (Mobile) (อันนี้ดีอยู่แล้ว) ‼️
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
                    <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg">
                        <div className="flex flex-col space-y-4 p-5">
                            <Link  
                                href="/chat" 
                                onClick={() => setMobileMenuOpen(false)} 
                                className={`w-full bg-green-800 text-white text-center py-3 rounded-lg font-bold hover:bg-green-700 transition-colors ${pathname === '/chat' ? 'ring-2 ring-green-900' : ''}`}>
                                Talk with AI!
                            </Link>
                            <Link 
                                href="/menu-page" 
                                onClick={() => setMobileMenuOpen(false)} 
                                className={`font-medium text-lg text-center py-2 rounded-lg ${pathname === '/menu-page' ? 'bg-gray-100 text-green-700' : 'text-gray-700 hover:text-green-700'}`}> 
                            Menu
                            </Link>
                            {loading ? (
                                <div className="text-gray-400 text-center py-2">Loading...</div>
                            ) : session ? (
                                <>
                                    <Link 
                                        href="/member" 
                                        onClick={() => setMobileMenuOpen(false)} 
                                        className={`font-medium text-lg text-center py-2 rounded-lg ${pathname === '/member' ? 'bg-gray-100 text-green-700' : 'text-gray-700 hover:text-green-700'}`}> 
                                        {profile?.fullName || 'My Account'}
                                    </Link>
                                </>
                            ) : (
                                <Link 
                                    href="/member" 
                                    onClick={() => setMobileMenuOpen(false)} 
                                    className={`font-medium text-lg text-center py-2 rounded-lg ${pathname === '/member' ? 'bg-gray-100 text-green-700' : 'text-gray-700 hover:text-green-700'}`}>
                                    Member
                                </Link>
                            )}
                            <Link 
                                href="/about-us" 
                                onClick={() => setMobileMenuOpen(false)} 
                                className={`font-medium text-lg text-center py-2 rounded-lg ${pathname === '/about-us' ? 'bg-gray-100 text-green-700' : 'text-gray-700 hover:text-green-700'}`}>
                                About us
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

