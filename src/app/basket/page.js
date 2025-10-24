"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
// ‼️ 1. Import Image ‼️
import Image from 'next/image';
import Link from 'next/link';

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
    const isInitialMount = useRef(true);

    // [1] Effect "โหลด" (ทำงานครั้งเดียวเมื่อ Component Mount)
    useEffect(() => {
        console.log("BasketPage: useEffect [Mount] - Starting to load cart...");
        try {
            const savedCartJSON = localStorage.getItem('myCafeCart');
            const savedItems = savedCartJSON ? JSON.parse(savedCartJSON) : [];
            setCartItems(savedItems);
            console.log("BasketPage: useEffect [Mount] - Cart loaded from localStorage:", savedItems);
        } catch (error) {
            console.error("BasketPage: useEffect [Mount] - Failed to parse cart from localStorage", error);
            setCartItems([]);
        } finally {
            isInitialMount.current = false;
            console.log("BasketPage: useEffect [Mount] - Initial mount flag set to false.");
        }

        const handleStorageChange = () => {
            console.log("BasketPage: Received 'local-storage' event. Reloading cart...");
            try {
                const updatedCartJSON = localStorage.getItem('myCafeCart');
                const updatedItems = updatedCartJSON ? JSON.parse(updatedCartJSON) : [];
                setCartItems(updatedItems);
                console.log("BasketPage: Cart updated via event listener:", updatedItems);
            } catch (error) {
                console.error("BasketPage: Failed to parse updated cart from localStorage via event", error);
            }
        };

        window.addEventListener('local-storage', handleStorageChange);
        console.log("BasketPage: useEffect [Mount] - Added 'local-storage' event listener.");

        return () => {
            window.removeEventListener('local-storage', handleStorageChange);
            console.log("BasketPage: useEffect [Cleanup] - Removed 'local-storage' event listener.");
        };

    }, []); // [] ทำให้ Effect นี้ทำงานครั้งเดียวตอน Mount

    // ฟังก์ชันจัดการตะกร้า (เพิ่ม/ลด/ลบ) - ย้ายการบันทึกมาไว้ที่นี่
    const updateCartAndStorage = (newCartItems) => {
        const validCartItems = newCartItems.filter(item => item.quantity > 0);
        setCartItems(validCartItems);
        console.log("BasketPage: Updating cart state and storage:", validCartItems);

        try {
            if (validCartItems.length > 0) {
                localStorage.setItem('myCafeCart', JSON.stringify(validCartItems));
                console.log("BasketPage: Cart saved to localStorage.");
            } else {
                localStorage.removeItem('myCafeCart');
                console.log("BasketPage: Cart removed from localStorage.");
            }
            window.dispatchEvent(new Event('local-storage'));
            console.log("BasketPage: Dispatched 'local-storage' event after update.");
        } catch (error) {
            console.error("BasketPage: Failed to save updated cart to localStorage", error);
        }
    };

    const handleQuantityChange = (menuId, change) => {
        console.log(`BasketPage: handleQuantityChange called for menuId ${menuId}, change ${change}`);
        const newCart = cartItems.map(item =>
            item.menuId === menuId
                ? { ...item, quantity: Math.max(0, (item.quantity ?? 0) + change) }
                : item
        );
        updateCartAndStorage(newCart);
    };

    const removeItem = (menuId) => {
        console.log(`BasketPage: removeItem called for menuId ${menuId}`);
        const newCart = cartItems.filter(item => item.menuId !== menuId);
        updateCartAndStorage(newCart);
    };

    const clearCart = () => {
        console.log("BasketPage: Clearing cart.");
        updateCartAndStorage([]);
    };

    // คำนวณยอดรวม (ใช้ useMemo เพื่อประสิทธิภาพ)
    const summary = useMemo(() => {
        const currentCart = Array.isArray(cartItems) ? cartItems : [];
        const subtotal = currentCart.reduce((sum, item) => sum + ((item.menuPrice ?? 0) * (item.quantity ?? 0)), 0);
        const vat = subtotal * 0.07;
        const total = subtotal + vat;
        const totalItems = currentCart.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
        console.log("BasketPage: Summary calculated:", { subtotal, vat, total, totalItems });
        return { subtotal, vat, total, totalItems };
    }, [cartItems]);

    console.log("BasketPage: Rendering with state:", { isInitialMount: isInitialMount.current, cartItems });

    // --- ส่วน Return (UI) ---
    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="text-center md:text-left mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#4A3728]">ตะกร้าสินค้าของคุณ</h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ส่วนแสดงรายการสินค้า */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border">
                        <div className="flex justify-between items-center border-b pb-4 mb-6">
                            <h2 className="text-xl font-semibold text-gray-700">รายการเมนู ({summary.totalItems})</h2>
                            {Array.isArray(cartItems) && cartItems.length > 0 && (
                                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">ล้างตะกร้า</button>
                            )}
                        </div>
                        {isInitialMount.current ? (
                            <div className="text-center py-16 text-gray-500">กำลังโหลดรายการในตะกร้า...</div>
                        ) : !Array.isArray(cartItems) || cartItems.length === 0 ? (
                            <EmptyCart />
                        ) : (
                            <div className="space-y-6">
                                {cartItems.map(item => {
                                    console.log("BasketPage: Rendering item:", item);
                                    if (!item || !item.menuId) {
                                        console.warn("BasketPage: Skipping invalid item in map:", item);
                                        return null;
                                    }
                                    return (
                                        <div key={item.menuId} className="flex items-center flex-wrap gap-4 border-b border-gray-100 pb-4">

                                            {/* ‼️ 2. เพิ่มส่วนแสดงรูปภาพ ‼️ */}
                                            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                                                <Image
                                                    // ใช้ publicImageUrl จาก item (ที่ควรจะมี)
                                                    src={item.publicImageUrl || 'https://placehold.co/100x100/FFF/333?text=N/A'}
                                                    alt={item.menuName || 'Menu Item'}
                                                    width={64} // ขนาดเท่า container
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                    unoptimized={true} // สำหรับ SVG fallback
                                                />
                                            </div>

                                            {/* ชื่อและราคาต่อหน่วย */}
                                            <div className="flex-grow min-w-[150px]">
                                                <h3 className="font-semibold text-gray-800">{item.menuName ?? 'Unknown Item'}</h3>
                                                <p className="text-green-800 font-bold mt-1">฿{(item.menuPrice ?? 0).toFixed(2)}</p>
                                            </div>
                                            {/* ปุ่มปรับจำนวน */}
                                            <div className="flex items-center gap-3 font-bold text-lg text-gray-300">
                                                <button
                                                    onClick={() => handleQuantityChange(item.menuId, -1)}
                                                    className="w-8 h-8 rounded-full border hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-medium font-bold text-lg text-gray-800">{item.quantity ?? 0}</span>
                                                <button onClick={() => handleQuantityChange(item.menuId, 1)} className="w-8 h-8 rounded-full border hover:bg-gray-100 transition">+</button>
                                            </div>
                                            {/* ราคา รวม */}
                                            <div className="text-right w-24 flex-shrink-0">
                                                <p className="font-bold text-lg text-gray-800">฿{((item.menuPrice ?? 0) * (item.quantity ?? 0)).toFixed(2)}</p>
                                            </div>
                                            {/* ปุ่มลบ Item */}
                                            <button onClick={() => removeItem(item.menuId)} className="text-gray-400 hover:text-red-500 transition ml-auto sm:ml-4 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    {/* ส่วนสรุปรายการ */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 border">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6">สรุปรายการ</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm text-gray-500"><span>ราคารวม</span><span>฿{summary.subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm text-gray-500"><span>ภาษี (7%)</span><span>฿{summary.vat.toFixed(2)}</span></div>
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between font-bold text-lg text-[#4A3728]"><span>ยอดรวมสุทธิ</span><span>฿{summary.total.toFixed(2)}</span></div>
                                </div>
                            </div>
                            <div className="mt-8 space-y-3">
                                <Link
                                    href="/checkout"
                                    className={`block w-full text-center py-3 rounded-lg font-bold text-lg text-white transition-colors ${!Array.isArray(cartItems) || cartItems.length === 0 || isInitialMount.current ? 'bg-gray-400 cursor-not-allowed pointer-events-none' : 'bg-green-800 hover:bg-green-900'}`}
                                    aria-disabled={!Array.isArray(cartItems) || cartItems.length === 0 || isInitialMount.current}
                                    onClick={(e) => { if (!Array.isArray(cartItems) || cartItems.length === 0 || isInitialMount.current) e.preventDefault(); }}
                                >
                                    ดำเนินการชำระเงิน
                                </Link>
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

