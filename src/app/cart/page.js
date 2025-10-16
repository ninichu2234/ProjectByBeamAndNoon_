"use client";
import React, { useState, useEffect, useMemo } from 'react';

// --- Helper Component for Empty Cart ---
// คอมโพเนนต์เล็กๆ สำหรับแสดงผลเมื่อตะกร้าว่าง
const EmptyCart = () => (
    <div className="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-gray-700">ตะกร้าของคุณว่างเปล่า</h3>
        <p className="text-gray-500 mt-2">ดูเหมือนว่าคุณยังไม่ได้เพิ่มเมนูใดๆ</p>
        <a href="#" className="mt-6 inline-block bg-amber-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors shadow">
            เลือกดูเมนู
        </a>
    </div>
);


export default function BasketPage() {
    const [cartItems, setCartItems] = useState([]);

    // 1. ดึงข้อมูลจาก localStorage เมื่อคอมโพเนนต์เริ่มทำงานครั้งแรก
    useEffect(() => {
        try {
            const savedCartJSON = localStorage.getItem('myCafeCart');
            const savedItems = savedCartJSON ? JSON.parse(savedCartJSON) : [];
            setCartItems(savedItems);
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
            setCartItems([]);
        }
    }, []); // dependency array ว่างเปล่า หมายถึงให้ทำงานแค่ครั้งเดียว

    // 2. บันทึกข้อมูลลง localStorage ทุกครั้งที่ state ของตะกร้ามีการเปลี่ยนแปลง
    useEffect(() => {
        try {
            if (cartItems.length > 0) {
                localStorage.setItem('myCafeCart', JSON.stringify(cartItems));
            } else {
                // ถ้าตะกร้าว่าง ก็ลบ key ออกจาก localStorage
                localStorage.removeItem('myCafeCart');
            }
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }, [cartItems]);

    // --- ฟังก์ชันจัดการตะกร้า ---
    const handleQuantityChange = (menuId, change) => {
        setCartItems(currentItems =>
            currentItems.map(item =>
                item.menuId === menuId
                    ? { ...item, quantity: Math.max(0, item.quantity + change) } // ป้องกันจำนวนติดลบ
                    : item
            ).filter(item => item.quantity > 0) // ลบสินค้าถ้าจำนวนเป็น 0
        );
    };

    const removeItem = (menuId) => {
        setCartItems(currentItems => currentItems.filter(item => item.menuId !== menuId));
    };

    const clearCart = () => {
        if (window.confirm('คุณต้องการล้างตะกร้าสินค้าทั้งหมดใช่หรือไม่?')) {
            setCartItems([]);
        }
    };

    // --- คำนวณยอดรวม (ใช้ useMemo เพื่อประสิทธิภาพ) ---
    const summary = useMemo(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.menuPrice * item.quantity), 0);
        const discount = 0;
        const vat = subtotal * 0.07;
        const total = subtotal - discount + vat;
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        return { subtotal, discount, vat, total, totalItems };
    }, [cartItems]);


    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="text-center md:text-left mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">ตะกร้าสินค้าของคุณ</h1>
                    <p className="text-gray-500 mt-2">ตรวจสอบรายการและดำเนินการชำระเงิน</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ส่วนแสดงรายการสินค้า */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-center border-b pb-4 mb-6">
                            <h2 className="text-xl font-semibold text-gray-700">รายการเมนู ({summary.totalItems})</h2>
                            {cartItems.length > 0 && (
                                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">
                                    ล้างตะกร้า
                                </button>
                            )}
                        </div>

                        {cartItems.length === 0 ? (
                            <EmptyCart />
                        ) : (
                            <div className="space-y-6">
                                {cartItems.map(item => (
                                    <div key={item.menuId} className="flex flex-col sm:flex-row items-center gap-4 border-b border-gray-100 pb-4">
                                        <img src={item.menuImageUrl || 'https://placehold.co/100x100/E2D6C8/4A3F35?text=Item'} alt={item.menuName} className="w-24 h-24 object-cover rounded-lg shadow-sm flex-shrink-0" />
                                        <div className="flex-grow text-center sm:text-left">
                                            <h3 className="font-semibold text-gray-800">{item.menuName}</h3>
                                            <p className="text-blue-600 font-bold mt-1">฿{item.menuPrice.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleQuantityChange(item.menuId, -1)} className="quantity-btn w-8 h-8 rounded-full border text-gray-600 hover:bg-gray-100">-</button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button onClick={() => handleQuantityChange(item.menuId, 1)} className="quantity-btn w-8 h-8 rounded-full border text-gray-600 hover:bg-gray-100">+</button>
                                        </div>
                                        <div className="text-right w-24 flex-shrink-0">
                                            <p className="font-semibold text-lg text-gray-800">฿{(item.menuPrice * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <button onClick={() => removeItem(item.menuId)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ส่วนสรุปรายการสั่งซื้อ */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6">สรุปรายการสั่งซื้อ</h2>
                            <div className="space-y-4 text-gray-600">
                                <div className="flex justify-between">
                                    <span>ราคารวม</span>
                                    <span className="font-medium text-gray-800">฿{summary.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ส่วนลด</span>
                                    <span className="font-medium text-green-500">- ฿{summary.discount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span>ภาษี (7%)</span>
                                    <span className="font-medium text-gray-800">฿{summary.vat.toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between font-bold text-lg text-gray-800">
                                        <span>ยอดรวมสุทธิ</span>
                                        <span>฿{summary.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                             <a href="/checkout.html" className={`block w-full text-center mt-8 py-3 rounded-lg font-bold text-lg text-white transition-colors shadow-lg ${cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                ดำเนินการชำระเงิน
                            </a>
                            <a href="#" className="block text-center mt-4 text-sm text-blue-600 hover:underline">
                                เลือกซื้อสินค้าต่อ
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

