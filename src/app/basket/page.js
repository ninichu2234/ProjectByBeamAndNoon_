"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// [FIX] 1. Import 'supabase' จากไฟล์ส่วนกลาง (ถ้ามี)
// ถ้าคุณยังไม่มี supabaseClient.js คุณต้องสร้างก่อน
// import { supabase } from '../../lib/supabaseClient'; 
// *** แต่เนื่องจากไฟล์ Basket เดิมไม่มีการใช้ supabase เลย ผมจะคอมเมนต์ไว้ก่อน ***

// คอมโพเนนต์เล็กๆ สำหรับแสดงผลเมื่อตะกร้าว่าง
const EmptyCart = () => (
    <div className="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-gray-700">ตะกร้าของคุณว่างเปล่า</h3>
        <p className="text-gray-500 mt-2">ดูเหมือนว่าคุณยังไม่ได้เพิ่มเมนูใดๆ</p>
        <Link href="/chat" className="mt-6 inline-block bg-[#4A3728] text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors shadow">
            กลับไปเลือกเมนู
        </Link>
    </div>
);

export default function BasketPage() {
    const [cartItems, setCartItems] = useState([]);
    // [FIX] สร้าง "ธง"
    const isInitialMount = useRef(true);

    // [1] Effect "โหลด" (ทำงานครั้งเดียว)
    useEffect(() => {
        try {
            // [FIX] อ่านจาก localStorage ก่อนเสมอ
            const savedCartJSON = localStorage.getItem('myCafeCart');
            const savedItems = savedCartJSON ? JSON.parse(savedCartJSON) : [];
            setCartItems(savedItems);
            console.log("BasketPage: Initial cart loaded:", savedItems); // Log เพิ่มเติม
        } catch (error) {
            console.error("BasketPage: Failed to parse cart from localStorage", error);
            setCartItems([]);
        }
        
        // [FIX] ตั้งค่าธงหลังโหลดเสร็จ
        // ใช้ setTimeout เล็กน้อยเพื่อให้แน่ใจว่า state update เสร็จก่อน
        const timer = setTimeout(() => {
             isInitialMount.current = false;
             console.log("BasketPage: Initial mount flag set to false."); // Log เพิ่มเติม
        }, 0); 
       
       return () => clearTimeout(timer); // Cleanup timer

    }, []); // [] ทำให้ทำงานครั้งเดียว

    // [2] Effect "บันทึก" (ทำงานทุกครั้งที่ cartItems เปลี่ยน)
    useEffect(() => {
        // [FIX] ตรวจสอบ "ธง" - จะไม่ทำงานตอนโหลดครั้งแรก
        if (!isInitialMount.current) {
            try {
                if (cartItems.length > 0) {
                    localStorage.setItem('myCafeCart', JSON.stringify(cartItems));
                     console.log("BasketPage: Cart saved to localStorage:", cartItems); // Log เพิ่มเติม
                } else {
                    localStorage.removeItem('myCafeCart');
                    console.log("BasketPage: Cart removed from localStorage."); // Log เพิ่มเติม
                }
                // [FIX] ส่งสัญญาณบอก Navbar
                window.dispatchEvent(new Event('local-storage'));
                console.log("BasketPage: 'local-storage' event dispatched."); // Log เพิ่มเติม
            } catch (error) {
                console.error("BasketPage: Failed to save cart to localStorage", error);
            }
        } else {
             console.log("BasketPage: Initial mount, skipping save to localStorage."); // Log เพิ่มเติม
        }
    }, [cartItems]); 


    // ฟังก์ชันจัดการตะกร้า (เพิ่ม/ลด/ลบ)
    const handleQuantityChange = (menuId, change) => {
         console.log(`BasketPage: handleQuantityChange called for menuId ${menuId}, change ${change}`); // Log เพิ่มเติม
        setCartItems(currentItems =>
            currentItems.map(item =>
                item.menuId === menuId
                    ? { ...item, quantity: Math.max(0, item.quantity + change) } // ป้องกันจำนวนติดลบ
                    : item
            ).filter(item => item.quantity > 0) // กรองเอาอันที่จำนวนเป็น 0 ออก
        );
    };

    const removeItem = (menuId) => {
         console.log(`BasketPage: removeItem called for menuId ${menuId}`); // Log เพิ่มเติม
        setCartItems(currentItems => currentItems.filter(item => item.menuId !== menuId));
    };

    const clearCart = () => {
        // [FIX] เพิ่มการตรวจสอบ window object
        if (typeof window !== 'undefined' && window.confirm('คุณต้องการล้างตะกร้าสินค้าทั้งหมดใช่หรือไม่?')) {
             console.log("BasketPage: Clearing cart."); // Log เพิ่มเติม
            setCartItems([]);
        }
    };

    // คำนวณยอดรวม
    const summary = useMemo(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.menuPrice * item.quantity), 0);
        const vat = subtotal * 0.07;
        const total = subtotal + vat;
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
         console.log("BasketPage: Summary calculated:", { subtotal, vat, total, totalItems }); // Log เพิ่มเติม
        return { subtotal, vat, total, totalItems };
    }, [cartItems]);


    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="text-center md:text-left mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#4A3728]">ตะกร้าสินค้าของคุณ</h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border">
                        <div className="flex justify-between items-center border-b pb-4 mb-6">
                            <h2 className="text-xl font-semibold text-gray-700">รายการเมนู ({summary.totalItems})</h2>
                            {cartItems.length > 0 && (
                                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">ล้างตะกร้า</button>
                            )}
                        </div>
                        {/* [FIX] รอให้โหลดเสร็จก่อนค่อยเช็กว่าว่าง */}
                        {isInitialMount.current ? (
                            <div className="text-center py-16 text-gray-500">กำลังโหลดรายการในตะกร้า...</div>
                        ) : cartItems.length === 0 ? (
                            <EmptyCart /> 
                        ) : (
                            <div className="space-y-6">
                                {/* [FIX] ตรวจสอบ cartItems ก่อน map อีกชั้น */}
                                {Array.isArray(cartItems) && cartItems.map(item => (
                                    <div key={item.menuId} className="flex items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
                                       {/* [FIX] Vercel Warning: <img> -> <Image> */}
                                       <Image
                                            // [FIX] ใช้ ?? เพื่อให้มี fallback ที่แน่นอน และ URL ที่ถูกต้อง
                                            src={item.menuImageUrl || `https://placehold.co/96x96/E2D6C8/4A3F35?text=${encodeURIComponent(item.menuName ?? 'Menu')}`} 
                                            alt={item.menuName ?? 'Menu item'} 
                                            width={96}
                                            height={96}
                                            className="object-cover rounded-lg shadow-sm" 
                                            // [FIX] เพิ่ม onError fallback เผื่อรูปโหลดไม่ได้
                                            onError={(e) => { e.target.src = `https://placehold.co/96x96/CCCCCC/FFFFFF?text=Error`; }}
                                        />
                                        <div className="flex-grow min-w-[150px]">
                                            <h3 className="font-semibold text-gray-800">{item.menuName ?? 'Unknown Item'}</h3>
                                            <p className="text-green-800 font-bold mt-1">฿{(item.menuPrice ?? 0).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleQuantityChange(item.menuId, -1)} 
                                                className="w-8 h-8 rounded-full border hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                // [FIX] Disable ปุ่มลบถ้าจำนวน = 1 (หรือน้อยกว่า)
                                                disabled={item.quantity <= 1} 
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button onClick={() => handleQuantityChange(item.menuId, 1)} className="w-8 h-8 rounded-full border hover:bg-gray-100 transition">+</button>
                                        </div>
                                        <div className="text-right w-24">
                                            <p className="font-semibold text-lg text-gray-800">฿{((item.menuPrice ?? 0) * (item.quantity ?? 0)).toFixed(2)}</p>
                                        </div>
                                        <button onClick={() => removeItem(item.menuId)} className="text-gray-400 hover:text-red-500 transition ml-auto sm:ml-0"> {/* จัดตำแหน่งปุ่มลบ */}
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 border">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6">สรุปรายการ</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between"><span>ราคารวม</span><span>฿{summary.subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm text-gray-500"><span>ภาษี (7%)</span><span>฿{summary.vat.toFixed(2)}</span></div>
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between font-bold text-lg text-[#4A3728]"><span>ยอดรวมสุทธิ</span><span>฿{summary.total.toFixed(2)}</span></div>
                                </div>
                            </div>
                             <div className="mt-8 space-y-3">
                                {/* [FIX] Vercel Error: <a> -> <Link> */}
                                <Link href="/checkout" className={`block w-full text-center py-3 rounded-lg font-bold text-lg text-white transition-colors ${cartItems.length === 0 || isInitialMount.current ? 'bg-gray-400 cursor-not-allowed pointer-events-none' : 'bg-green-800 hover:bg-green-900'}`} aria-disabled={cartItems.length === 0 || isInitialMount.current}>
                                    ดำเนินการชำระเงิน
                                </Link>
                                {/* [FIX] Vercel Error: <a> -> <Link> */}
                                <Link href="/chat" className="block w-full text-center py-3 rounded-lg font-bold text-lg text-[#4A3728] bg-gray-100 hover:bg-gray-200 transition-colors">
                                    เลือกซื้อต่อ
                                </Link>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

