"use client";
import React, { useState, useEffect, useMemo } from 'react';

// ไอคอนสำหรับสถานะต่างๆ
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-green-500 mx-auto">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const EmptyCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export default function CheckoutPage() {
    const [cartItems, setCartItems] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        paymentMethod: 'promptpay',
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // ดึงข้อมูลตะกร้าจาก localStorage เมื่อโหลดหน้า
    useEffect(() => {
        try {
            const savedCartJSON = localStorage.getItem('myCafeCart');
            const savedItems = savedCartJSON ? JSON.parse(savedCartJSON) : [];
            setCartItems(savedItems);
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
            setCartItems([]);
        }
    }, []);

    // คำนวณยอดรวม (เหมือนในหน้าตะกร้า)
    const summary = useMemo(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.menuPrice * item.quantity), 0);
        const vat = subtotal * 0.07;
        const total = subtotal + vat;
        return { subtotal, vat, total };
    }, [cartItems]);

    // จัดการการเปลี่ยนแปลงในฟอร์ม
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // จัดการการยืนยันคำสั่งซื้อ
    const handleSubmitOrder = (e) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            alert("ตะกร้าของคุณว่างเปล่า");
            return;
        }

        console.log("Submitting order with data:", formData, cartItems);
        setIsProcessing(true);

        // จำลองการทำงานของ Backend (เช่น การยิง API)
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            
            // ล้างตะกร้าสินค้า
            localStorage.removeItem('myCafeCart');
            // ส่งสัญญาณบอก Header ให้อัปเดตตัวเลข
            window.dispatchEvent(new Event('local-storage'));

        }, 2000); // จำลองการทำงาน 2 วินาที
    };

    // --- ส่วนแสดงผลตอนสั่งซื้อสำเร็จ ---
    if (isSuccess) {
        return (
            <div className="bg-white min-h-screen">
                <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
                    <CheckCircleIcon />
                    <h1 className="text-3xl font-bold text-green-600 mt-4">สั่งซื้อสำเร็จ!</h1>
                    <p className="text-gray-600 mt-2">ขอบคุณที่ใช้บริการ AI Barista ครับ</p>
                    <p className="text-gray-600">คำสั่งซื้อของคุณกำลังถูกจัดเตรียม</p>
                    <a href="/" className="mt-8 inline-block bg-[#4A3728] text-white px-8 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors shadow">
                        กลับสู่หน้าหลัก
                    </a>
                </div>
            </div>
        );
    }

    // --- ส่วนแสดงผลตอนตะกร้าว่าง ---
    if (cartItems.length === 0 && !isProcessing) {
        return (
            <div className="bg-white min-h-screen">
                 <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
                    <EmptyCartIcon />
                    <h3 className="mt-4 text-xl font-semibold text-gray-700">ไม่มีสินค้าสำหรับชำระเงิน</h3>
                    <p className="text-gray-500 mt-2">ตะกร้าของคุณว่างเปล่าในขณะนี้</p>
                    <a href="/chat" className="mt-6 inline-block bg-[#4A3728] text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors shadow">
                        กลับไปเลือกเมนู
                    </a>
                </div>
            </div>
        );
    }

    // --- ส่วนแสดงผลหลัก (ฟอร์มชำระเงิน) ---
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[#4A3728] text-center mb-8">ข้อมูลการชำระเงิน</h1>
                
                <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    
                    {/* คอลัมน์ซ้าย: ฟอร์มข้อมูลลูกค้า */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border">
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6">ข้อมูลการจัดส่ง</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">ที่อยู่</label>
                                <textarea name="address" id="address" rows="3" value={formData.address} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"></textarea>
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6 mt-8">ช่องทางการชำระเงิน</h2>
                        <div className="space-y-2">
                            <label className="flex items-center p-3 border rounded-lg has-[:checked]:bg-green-50 has-[:checked]:border-green-600">
                                <input type="radio" name="paymentMethod" value="promptpay" checked={formData.paymentMethod === 'promptpay'} onChange={handleInputChange} className="h-4 w-4 text-green-600 focus:ring-green-500" />
                                <span className="ml-3 font-medium text-gray-700">QR PromptPay</span>
                            </label>
                            <label className="flex items-center p-3 border rounded-lg has-[:checked]:bg-green-50 has-[:checked]:border-green-600">
                                <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} className="h-4 w-4 text-green-600 focus:ring-green-500" />
                                <span className="ml-3 font-medium text-gray-700">บัตรเครดิต / เดบิต</span>
                            </label>
                        </div>
                    </div>

                    {/* คอลัมน์ขวา: สรุปรายการ */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 border">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6">สรุปคำสั่งซื้อ</h2>
                            <div className="space-y-3 max-h-60 overflow-y-auto mb-4 border-b pb-4">
                                {cartItems.map(item => (
                                    <div key={item.menuId} className="flex justify-between items-center text-sm">
                                        <div className="text-gray-600">
                                            <p>{item.menuName}</p>
                                            <p className="text-xs text-gray-400">x {item.quantity}</p>
                                        </div>
                                        <p className="font-medium text-gray-800">฿{(item.menuPrice * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-600"><span>ราคารวม</span><span>฿{summary.subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm text-gray-500"><span>ภาษี (7%)</span><span>฿{summary.vat.toFixed(2)}</span></div>
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between font-bold text-lg text-[#4A3728]"><span>ยอดรวมสุทธิ</span><span>฿{summary.total.toFixed(2)}</span></div>
                                </div>
                            </div>
                             <div className="mt-8 space-y-3">
                                <button type="submit" disabled={isProcessing} className="w-full text-center py-3 rounded-lg font-bold text-lg text-white bg-green-800 hover:bg-green-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isProcessing ? 'กำลังดำเนินการ...' : `ยืนยันคำสั่งซื้อ (฿${summary.total.toFixed(2)})`}
                                </button>
                                <a href="/basket" className="block w-full text-center py-3 rounded-lg font-bold text-lg text-[#4A3728] bg-gray-100 hover:bg-gray-200 transition-colors">
                                    กลับไปแก้ไขตะกร้า
                                </a>
                             </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}