// src/app/basket/page.js

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function BasketPage() {
    const [cart, setCart] = useState([]);
    const [summary, setSummary] = useState({ subtotal: 0, tax: 0, total: 0 });
    const router = useRouter();

    // --- 1. โหลดข้อมูลตะกร้าจาก Local Storage ---
    useEffect(() => {
        function loadCart() {
            try {
                const savedCartJSON = localStorage.getItem('myCafeCart');
                const loadedCart = savedCartJSON ? JSON.parse(savedCartJSON) : [];
                setCart(loadedCart);
            } catch (error) {
                console.error("Failed to load cart from local storage:", error);
                setCart([]);
            }
        }
        
        loadCart();
        
        // เพิ่ม Event Listener เพื่อให้ตะกร้าอัปเดต ถ้ามีการเปลี่ยนแปลงจากหน้าอื่น
        window.addEventListener('local-storage', loadCart);

        // Cleanup listener
        return () => {
            window.removeEventListener('local-storage', loadCart);
        };
    }, []);

    // --- 2. คำนวณราคาสรุปใหม่ ทุกครั้งที่ cart เปลี่ยน ---
    useEffect(() => {
        let currentSubtotal = 0;
        cart.forEach(item => {
            // ใช้ finalPrice (ที่รวม options แล้ว) และคูณด้วย quantity
            currentSubtotal += (item.finalPrice || 0) * (item.quantity || 1);
        });

        const currentTax = currentSubtotal * 0.07; // ภาษี 7%
        const currentTotal = currentSubtotal + currentTax;

        setSummary({
            subtotal: currentSubtotal,
            tax: currentTax,
            total: currentTotal
        });
    }, [cart]); // ทำงานใหม่ทุกครั้งที่ 'cart' state เปลี่ยน

    // --- 3. ฟังก์ชันอัปเดตตะกร้า (ใน Local Storage) ---
    const updateLocalStorage = (newCart) => {
        try {
            localStorage.setItem('myCafeCart', JSON.stringify(newCart));
            // ส่งสัญญาณบอก components อื่น (เช่น Navbar) ให้อัปเดต
            window.dispatchEvent(new Event('local-storage'));
        } catch (error) {
            console.error("Failed to save cart to local storage:", error);
        }
    };

    // --- 4. Handlers สำหรับปุ่มต่างๆ ---

    // (ก) อัปเดตจำนวน
    const handleUpdateQuantity = (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
            // ถ้าจำนวนน้อยกว่า 1, ให้ลบออกแทน
            handleRemoveItem(cartItemId);
            return;
        }

        const newCart = cart.map(item => 
            item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
        );
        
        setCart(newCart); // อัปเดต State
        updateLocalStorage(newCart); // อัปเดต Storage
    };

    // (ข) ลบสินค้า
    const handleRemoveItem = (cartItemId) => {
        if (!confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) return;
        
        const newCart = cart.filter(item => item.cartItemId !== cartItemId);
        setCart(newCart);
        updateLocalStorage(newCart);
    };

    // (ค) ลบสินค้าทั้งหมด
    const handleClearCart = () => {
        if (cart.length === 0) return;
        if (!confirm("คุณต้องการล้างตะกร้าสินค้าทั้งหมดใช่หรือไม่?")) return;

        setCart([]);
        updateLocalStorage([]);
    };
    
    // (ง) ไปหน้าชำระเงิน (Placeholder)
    const handleCheckout = () => {
        // ในอนาคต: อาจจะต้องบันทึก order ลง database ก่อน
        alert("ระบบชำระเงินยังไม่เปิดให้บริการ");
        // router.push('/checkout'); 
    };

    // --- 5. Render UI ---
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">ตะกร้าสินค้าของคุณ</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* --- 5.1 ฝั่งซ้าย: รายการสินค้า --- */}
                    <main className="lg:flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b">
                            <h2 className="text-xl font-semibold text-gray-700">รายการเมนู ({cart.length})</h2>
                            <button
                                onClick={handleClearCart}
                                className="text-sm text-red-500 hover:text-red-700 disabled:text-gray-400"
                                disabled={cart.length === 0}
                            >
                                ล้างตะกร้า
                            </button>
                        </div>

                        {/* --- รายการสินค้าในตะกร้า --- */}
                        <div className="space-y-6">
                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">ตะกร้าของคุณว่างเปล่า</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.cartItemId} className="flex items-center gap-4">
                                        <Image
                                            src={item.publicImageUrl || 'https://placehold.co/100x100/DDD/333?text=N/A'}
                                            alt={item.menuName}
                                            width={80}
                                            height={80}
                                            className="w-20 h-20 rounded-lg object-cover border"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 truncate">{item.menuName}</h3>
                                            <p className="text-sm text-gray-500">
                                                ฿{item.finalPrice.toFixed(2)} 
                                            </p>
                                            
                                            {/* แสดงตัวเลือกที่เลือก */}
                                            {item.customizations?.selectedOptions?.length > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {item.customizations.selectedOptions.map(opt => opt.optionName).join(', ')}
                                                </div>
                                            )}
                                            {/* แสดงโน้ต */}
                                            {item.specialInstructions && (
                                                <p className="text-xs text-amber-700 mt-1 truncate">
                                                    Note: "{item.specialInstructions}"
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* ปุ่ม +/- */}
                                        <div className="flex items-center border rounded-lg">
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                                                className="w-8 h-8 text-gray-600 hover:bg-gray-100"
                                            >
                                                -
                                            </button>
                                            <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                                                className="w-8 h-8 text-gray-600 hover:bg-gray-100"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <p className="font-semibold text-gray-800 w-20 text-right">
                                            ฿{(item.finalPrice * item.quantity).toFixed(2)}
                                        </p>
                                        
                                        {/* ปุ่มลบ */}
                                        <button 
                                            onClick={() => handleRemoveItem(item.cartItemId)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </main>

                    {/* --- 5.2 ฝั่งขวา: สรุปรายการ --- */}
                    <aside className="lg:w-1/3">
                        <div className="sticky top-24 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-4 border-b">สรุปรายการ</h2>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>ราคารวม (Subtotal)</span>
                                    <span>฿{summary.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>ภาษี (7%)</span>
                                    <span>฿{summary.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-900 font-bold text-lg">
                                    <span>ยอดรวมสุทธิ (Total)</span>
                                    <span>฿{summary.total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="w-full bg-green-900 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                ดำเนินการชำระเงิน
                            </button>

                            {/* ‼️‼️ นี่คือส่วนที่แก้ไขตามคำขอ ‼️‼️ */}
                            {/* เปลี่ยนจาก "เลือกซื้อต่อ" ปุ่มเดียว เป็นสองปุ่มที่ลิงก์ไป /menu และ /chat */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-3">
                                <Link
                                    href="/menu-page"
                                    className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm"
                                >
                                    เลือกเมนูเพิ่ม
                                </Link>
                                <Link
                                    href="/chat"
                                    className="flex-1 text-center bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm"
                                >
                                    สั่งด้วย AI
                                </Link>
                            </div>
                            {/* ‼️‼️ จบส่วนที่แก้ไข ‼️‼️ */}

                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}