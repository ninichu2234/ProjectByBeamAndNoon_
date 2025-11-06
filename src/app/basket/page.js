"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function BasketPage() {
    const [cart, setCart] = useState([]);
    const [summary, setSummary] = useState({ subtotal: 0, tax: 0, total: 0 });
    const router = useRouter();

    // ‼️ (บีม) State สำหรับ Pop-up "ดูดี" (นำกลับมา)
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        actionType: null, // 'remove' หรือ 'clear'
        targetId: null    // cartItemId ที่จะลบ
    });

    // --- (ส่วน Logic: useEffect, updateLocalStorage, Handlers - เหมือนเดิม) ---

    // 1. โหลดข้อมูลตะกร้า
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
        window.addEventListener('local-storage', loadCart);
        return () => {
            window.removeEventListener('local-storage', loadCart);
        };
    }, []);

    // 2. คำนวณราคา
    useEffect(() => {
        let currentSubtotal = 0;
        cart.forEach(item => {
            currentSubtotal += (item.finalPrice || 0) * (item.quantity || 1);
        });
        const currentTax = currentSubtotal * 0.07; 
        const currentTotal = currentSubtotal + currentTax;
        setSummary({
            subtotal: currentSubtotal,
            tax: currentTax,
            total: currentTotal
        });
    }, [cart]);

    // 3. ฟังก์ชันอัปเดต
    const updateLocalStorage = (newCart) => {
        try {
            localStorage.setItem('myCafeCart', JSON.stringify(newCart));
            window.dispatchEvent(new Event('local-storage'));
        } catch (error) {
            console.error("Failed to save cart to local storage:", error);
        }
    };

    // 4. Handlers
    const handleUpdateQuantity = (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
            // [FIX 5] (บีม) ถ้าจำนวน < 1, ให้เรียก `handleRemoveItem` (ซึ่งจะเปิด Modal)
            handleRemoveItem(cartItemId);
            return;
        }
        const newCart = cart.map(item => 
            item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
        );
        setCart(newCart);
        updateLocalStorage(newCart);
    };

    // ‼️ [FIX 5] (บีม) แก้ไข handleRemoveItem ให้ "เปิด Modal"
    const handleRemoveItem = (cartItemId) => {
        setModal({
            isOpen: true,
            title: 'Delete Item',
            message: 'Are you sure you want to remove this item?',
            actionType: 'remove',
            targetId: cartItemId
        });
    };

    // ‼️ [FIX 8] (บีม) แก้ไข handleClearCart ให้ "เปิด Modal"
    const handleClearCart = () => {
        if (cart.length === 0) return;
        setModal({
            isOpen: true,
            title: 'Clear Cart',
            message: 'Are you sure you want to clear all items from your cart?',
            actionType: 'clear',
            targetId: null
        });
    };
    
    const handleCheckout = () => {
        console.log("Proceeding to checkout");
        router.push('/checkout');
    };

    // ‼️ (บีม) ฟังก์ชันสำหรับ Modal "ดูดี"
    const handleModalCancel = () => {
        setModal({ isOpen: false, title: '', message: '', actionType: null, targetId: null });
    };

    const handleModalConfirm = () => {
        if (modal.actionType === 'remove' && modal.targetId) {
            // Logic ลบรายชิ้น
            const newCart = cart.filter(item => item.cartItemId !== modal.targetId);
            setCart(newCart);
            updateLocalStorage(newCart);
        } else if (modal.actionType === 'clear') {
            // Logic ล้างตะกร้า
            setCart([]);
            updateLocalStorage([]);
        }
        handleModalCancel(); // ปิด Modal หลังทำงาน
    };


    // --- 5. Render UI (มีการแก้ไข) ---
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            
            <div className="container mx-auto px-4 max-w-5xl relative"> {/* ‼️ เพิ่ม relative ‼️ */}
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>

                {/* ‼️ (บีม) นี่คือ Pop-up "ดูดี" ที่อยู่บนหน้าเดิม (ไม่บังจอ) ‼️ */}
                {modal.isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 p-4"> {/* ‼️ เปลี่ยนเป็น absolute, ไม่มี bg-black ‼️ */}
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform scale-100 opacity-100 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">{modal.title}</h3>
                            <p className="mt-2 text-gray-600">{modal.message}</p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button 
                                    onClick={handleModalCancel} 
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleModalConfirm} 
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
                                >
                                    {modal.actionType === 'clear' ? 'Clear' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* ‼️ จบส่วน Pop-up ‼️ */}

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* --- 5.1 ฝั่งซ้าย: รายการสินค้า --- */}
                    <main className="lg:flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b">
                            <h2 className="text-xl font-semibold text-gray-700">List menu </h2>
                            <button
                                onClick={handleClearCart}
                                className="text-sm text-red-500 hover:text-red-700 disabled:text-gray-400"
                                disabled={cart.length === 0}
                            >
                                Clear Cart
                            </button>
                        </div>

                        {/* --- รายการสินค้าในตะกร้า --- */}
                        <div className="divide-y divide-gray-200">
                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.cartItemId} className="flex gap-4 py-6">
                                        
                                        {/* 1. Image */}
                                        <Image
                                            src={item.publicImageUrl || 'https://placehold.co/100x100/DDD/333?text=N/A'}
                                            alt={item.menuName}
                                            width={80}
                                            height={80}
                                            className="w-20 h-20 rounded-lg object-cover border flex-shrink-0"
                                        />
                                        
                                        {/* 2. Info (ส่วนที่เหลือทั้งหมด) */}
                                        <div className="flex-1 flex flex-col min-w-0">
                                            {/* 2a. แถวบน: ชื่อ, custom options, และราคารวม */}
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-800 truncate">{item.menuName}</h3>
                                                    {item.customizations?.selectedOptions?.length > 0 && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {item.customizations.selectedOptions.map(opt => opt.optionName).join(', ')}
                                                        </div>
                                                    )}
                                                    {item.specialInstructions && (
                                                        <p className="text-xs text-amber-700 mt-1 truncate">
                                                            Note: &quot;{item.specialInstructions}&quot;
                                                        </p>
                                                    )}
                                                </div>
                                                {/* ราคารวม (ย้ายมาไว้บนขวา) */}
                                                <p className="font-semibold text-gray-800 flex-shrink-0">
                                                    ฿{(item.finalPrice * item.quantity).toFixed(2)}
                                                </p>
                                            </div>

                                            {/* 2b. แถวล่าง: ราคาต่อหน่วย, ปุ่มปรับจำนวน, ปุ่มลบ */}
                                            <div className="flex justify-between items-center mt-4">
                                                <p className="text-sm text-gray-500">
                                                    ฿{item.finalPrice.toFixed(2)} 
                                                </p>
                                                
                                                <div className="flex items-center gap-3">
                                                    {/* ปุ่ม +/- */}
                                                    <div className="flex items-center border rounded-lg">
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                                                            className="w-8 h-8 text-gray-600 hover:bg-gray-100"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-10 text-center text-sm font-medium text-gray-800">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                                                            className="w-8 h-8 text-gray-600 hover:bg-gray-100"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    
                                                    {/* ปุ่มลบ */}
                                                    <button 
                                                        onClick={() => handleRemoveItem(item.cartItemId)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </main>

                    {/* --- 5.2 ฝั่งขวา: สรุป --- */}
                    <aside className="lg:w-1/3">
                        <div className="sticky top-24 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-4 border-b">Summary</h2>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>฿{summary.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>vat 7%</span>
                                    <span>฿{summary.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-900 font-bold text-lg">
                                    <span>Total</span>
                                    <span>฿{summary.total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="w-full bg-[#2c8160] hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Continue to Checkout
                            </button>

                            <div className="flex flex-col sm:flex-row gap-3 mt-3">
                                <Link
                                    href="/chat"
                                    className="flex-1 text-center bg-white border border-[#2c8160] text-[#2c8160] hover:bg-green-50 font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm"
                                >
                                    Order with AI
                                </Link>
                                <Link
                                    href="/menu-page"
                                    className="flex-1 text-center bg-white border border-[#2c8160] text-[#2c8160] hover:bg-green-50 font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm"
                                >
                                    Menu
                                </Link>
                            </div>

                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

