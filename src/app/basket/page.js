"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';

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

    const loadCartItems = () => {
        try {
            const savedCartJSON = localStorage.getItem('myCafeCart');
            const savedItems = savedCartJSON ? JSON.parse(savedCartJSON) : [];
            setCartItems(savedItems);
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
            setCartItems([]);
        }
    };

    useEffect(() => {
        loadCartItems();
        window.addEventListener('local-storage', loadCartItems);
        return () => {
            window.removeEventListener('local-storage', loadCartItems);
        };
    }, []);

    useEffect(() => {
        if (cartItems.length > 0) {
            localStorage.setItem('myCafeCart', JSON.stringify(cartItems));
        } else {
            localStorage.removeItem('myCafeCart');
        }
        window.dispatchEvent(new Event('local-storage'));
    }, [cartItems]);

    const handleQuantityChange = (menuId, change) => {
        setCartItems(currentItems =>
            currentItems.map(item =>
                item.menu_id === menuId // <-- ✅ FIX: แก้ชื่อ Key ให้ตรงกับฐานข้อมูล
                    ? { ...item, quantity: Math.max(0, item.quantity + change) }
                    : item
            ).filter(item => item.quantity > 0)
        );
    };

    const removeItem = (menuId) => {
        setCartItems(currentItems => currentItems.filter(item => item.menu_id !== menuId)); // <-- ✅ FIX: แก้ชื่อ Key
    };

    const clearCart = () => {
        if (confirm('คุณต้องการล้างตะกร้าสินค้าทั้งหมดใช่หรือไม่?')) {
            setCartItems([]);
        }
    };

    const summary = useMemo(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.menu_price * item.quantity), 0); // <-- ✅ FIX: แก้ชื่อ Key
        const vat = subtotal * 0.07;
        const total = subtotal + vat;
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
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
                        {cartItems.length === 0 ? <EmptyCart /> : (
                            <div className="space-y-6">
                                {cartItems.map(item => (
                                    <div key={item.menu_id} className="flex items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
                                        <Image
                                            src={item.public_image_url || `https://placehold.co/100x100/E2D6C8/4A3F35?text=${encodeURIComponent(item.menu_name)}`}
                                            alt={item.menu_name}
                                            width={96}
                                            height={96}
                                            className="object-cover rounded-lg shadow-sm"
                                        />
                                        <div className="flex-grow min-w-[150px]">
                                            <h3 className="font-semibold text-gray-800">{item.menu_name}</h3>
                                            <p className="text-green-800 font-bold mt-1">฿{item.menu_price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleQuantityChange(item.menu_id, -1)} className="w-8 h-8 rounded-full border hover:bg-gray-100 transition">-</button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button onClick={() => handleQuantityChange(item.menu_id, 1)} className="w-8 h-8 rounded-full border hover:bg-gray-100 transition">+</button>
                                        </div>
                                        <div className="text-right w-24">
                                            <p className="font-semibold text-lg text-gray-800">฿{(item.menu_price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <button onClick={() => removeItem(item.menu_id)} className="text-gray-400 hover:text-red-500 transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                                <Link href="/checkout" className={`block w-full text-center py-3 rounded-lg font-bold text-lg text-white transition-colors ${cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed pointer-events-none' : 'bg-green-800 hover:bg-green-900'}`}>
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