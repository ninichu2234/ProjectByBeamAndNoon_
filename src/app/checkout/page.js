"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
// ‼️ 1. Import useUser และ supabase ‼️
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabaseClient';

// --- (ไอคอนต่างๆ เหมือนเดิม) ---
const CheckCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-green-500 mx-auto"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> );
const EmptyCartIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> );
const QrCodeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V7.5a3 3 0 0 0-3-3H3.75Zm.75 4.5V15h3V9H4.5Zm5.25 0V15h3V9h-3ZM15 9h.008v.008H15V9Zm.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm2.25-3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm2.25-3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm2.25-3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg> );
const CreditCardIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg> );
const CounterIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0 1 14.25 12h4.5a.75.75 0 0 1 .75.75v7.5m-15-7.5h15m-15 0a.75.75 0 0 1-.75-.75V12a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v.75a.75.75 0 0 1-.75.75M3 13.5v7.5a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-7.5" /></svg> );
const MobilePaymentIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg> );


export default function CheckoutPage() {
    const [cartItems, setCartItems] = useState([]);
    const [formData, setFormData] = useState({
        paymentMethod: 'counter',
        // ‼️ เพิ่ม: state สำหรับ Table Number ‼️
        tableNumber: '',
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const isInitialMount = useRef(true);
    const [createdOrderId, setCreatedOrderId] = useState(null);
    // ‼️ 2. เรียกใช้ useUser() ‼️
    const { userId, guestId, loading: userLoading } = useUser(); // เพิ่ม loading จาก context

    // [1] Effect "โหลด" และ "สร้าง Listener"
    useEffect(() => {
        const loadInitialCart = () => {
            try {
                const savedCartJSON = localStorage.getItem('myCafeCart');
                const savedItems = savedCartJSON ? JSON.parse(savedCartJSON) : [];
                setCartItems(savedItems);
                console.log("CheckoutPage: Initial cart loaded:", savedItems);
            } catch (error) {
                console.error("CheckoutPage: Failed to parse cart from localStorage", error);
                setCartItems([]);
            } finally {
                 // ย้ายการตั้งค่า isInitialMount.current มาไว้ที่นี่
                isInitialMount.current = false;
                console.log("CheckoutPage: Initial mount flag set to false.");
            }
        };

        loadInitialCart();

        const handleStorageChange = () => {
            console.log("CheckoutPage: Received 'local-storage' event. Reloading cart...");
            try {
                const updatedCartJSON = localStorage.getItem('myCafeCart');
                const updatedItems = updatedCartJSON ? JSON.parse(updatedCartJSON) : [];
                setCartItems(updatedItems);
                console.log("CheckoutPage: Cart updated via event listener:", updatedItems);
            } catch (error) {
                 console.error("CheckoutPage: Failed to parse updated cart from localStorage via event", error);
            }
        };

        window.addEventListener('local-storage', handleStorageChange);
        console.log("CheckoutPage: Added 'local-storage' event listener.");

       return () => {
           window.removeEventListener('local-storage', handleStorageChange);
           console.log("CheckoutPage: Removed 'local-storage' event listener.");
       };

    }, []);

    // คำนวณยอดรวม (เหมือนเดิม)
    const summary = useMemo(() => {
        const currentCart = Array.isArray(cartItems) ? cartItems : [];
        const subtotal = currentCart.reduce((sum, item) => sum + ((item.menuPrice ?? 0) * (item.quantity ?? 0)), 0);
        const vat = subtotal * 0.07;
        const total = subtotal + vat;
        console.log("CheckoutPage: Summary calculated:", { subtotal, vat, total });
        return { subtotal, vat, total };
    }, [cartItems]);

    // handleInputChange (เหมือนเดิม)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        console.log("CheckoutPage: formData updated:", { ...formData, [name]: value });
    };

    // handleMobilePaymentLabelClick (เหมือนเดิม)
    const handleMobilePaymentLabelClick = () => {
        if (formData.paymentMethod !== 'qr' && formData.paymentMethod !== 'card') {
            setFormData(prev => ({ ...prev, paymentMethod: 'qr' }));
            console.log("CheckoutPage: Defaulted mobile payment to QR");
        }
    };

    // ‼️ 5. อัปเดต handleSubmitOrder ให้บันทึกลง Supabase ‼️
    const handleSubmitOrder = async (e) => { // เปลี่ยนเป็น async
        e.preventDefault();
        const currentCart = Array.isArray(cartItems) ? cartItems : [];
        if (currentCart.length === 0) {
            alert("ตะกร้าของคุณว่างเปล่า ไม่สามารถดำเนินการต่อได้");
            return;
        }
        // ‼️ 3. เช็ค userLoading ก่อน ‼️
        if (userLoading) {
            alert("กำลังโหลดข้อมูลผู้ใช้ กรุณารอสักครู่...");
            return;
        }
        if (!userId && !guestId) {
             alert("เกิดข้อผิดพลาด: ไม่สามารถระบุตัวตนผู้ใช้ได้ (ไม่มี userId หรือ guestId)");
             console.error("CheckoutPage: Missing userId and guestId");
             return;
        }
        // ‼️ ตรวจสอบ Table Number (ถ้าจำเป็น) ‼️
        // if (!formData.tableNumber || isNaN(parseInt(formData.tableNumber))) {
        //     alert("กรุณากรอกหมายเลขโต๊ะให้ถูกต้อง");
        //     return;
        // }

        setIsProcessing(true); // เริ่ม Loading

        try {
            // --- 1. สร้าง Order Record ---
            const orderData = {
                 // ‼️ อ่าน tableNumber จาก State ‼️
                tableNumber: formData.tableNumber ? parseInt(formData.tableNumber) : null,
                totalPrice: summary.total,
                // userId ถ้ามี (ล็อกอิน), guestId ถ้าไม่มี userId (เป็น Guest)
                userId: userId || null,
                guestId: userId ? null : guestId,
                // กำหนดสถานะเริ่มต้น (ตรวจสอบกับ Schema ของคุณ)
                orderStatus: 'รับออเดอร์แล้ว', // หรือ 'Pending'
                paymentStatus: formData.paymentMethod === 'counter' ? 'Pay At Counter' : 'รอชำระเงิน', // หรือ 'Pending'
                specialInstructions: null // อาจจะเพิ่มช่องให้กรอกได้
            };

            console.log("CheckoutPage: Inserting into 'order' table:", orderData);

            const { data: newOrder, error: orderError } = await supabase
                .from('order') // ‼️ ตรวจสอบชื่อตาราง ‼️
                .insert(orderData)
                .select() // ขอข้อมูลที่เพิ่ง insert กลับมา
                .single(); // คาดหวังว่าจะได้แค่ record เดียว

            if (orderError) {
                console.error("CheckoutPage: Error inserting order:", orderError);
                throw new Error(`ไม่สามารถสร้างคำสั่งซื้อได้: ${orderError.message}. ตรวจสอบชื่อตาราง คอลัมน์ และ Policy`);
            }

            if (!newOrder || !newOrder.orderId) {
                 console.error("CheckoutPage: Insert order successful but no orderId returned:", newOrder);
                 throw new Error("ไม่สามารถสร้างคำสั่งซื้อได้: ไม่ได้รับ orderId กลับมา");
            }

            const createdOrderId = newOrder.orderId;
            setCreatedOrderId(createdOrderId);
            console.log("CheckoutPage: Order created successfully with ID:", createdOrderId);

            // --- 2. สร้าง Order Details Records ---
            const orderDetailsData = currentCart.map(item => ({
                orderId: createdOrderId,
                menuId: item.menuId,
                quantity: item.quantity,
                pricePerItem: item.menuPrice,
                customizations: null // ยังไม่มีการปรับแต่ง
            }));

            console.log("CheckoutPage: Inserting into 'orderDetails' table:", orderDetailsData);

            const { error: detailsError } = await supabase
                .from('orderDetails') // ‼️ ตรวจสอบชื่อตาราง ‼️
                .insert(orderDetailsData);

            if (detailsError) {
                console.error("CheckoutPage: Error inserting order details:", detailsError);
                // ควรจะ Rollback Order ที่สร้างไปก่อนหน้าหรือไม่? (ซับซ้อนขึ้น)
                throw new Error(`ไม่สามารถบันทึกรายละเอียดคำสั่งซื้อได้: ${detailsError.message}. ตรวจสอบชื่อตาราง คอลัมน์ และ Policy`);
            }

            console.log("CheckoutPage: Order details inserted successfully.");

            // --- 3. ถ้าสำเร็จทั้งหมด: ล้างตะกร้า, บันทึกสถานะ, แสดง Success ---
             const orderStatusData = {
                id: createdOrderId,
                status: 'กำลังเตรียม', // สถานะเริ่มต้นหลังบันทึก (สำหรับแสดงที่หน้า Home)
                timestamp: Date.now()
            };
            localStorage.setItem('currentOrderStatus', JSON.stringify(orderStatusData));
            console.log("CheckoutPage: Order status saved to localStorage:", orderStatusData);

            localStorage.removeItem('myCafeCart');
            console.log("CheckoutPage: Cart removed from localStorage after success.");

            window.dispatchEvent(new Event('local-storage'));
            console.log("CheckoutPage: 'local-storage' event dispatched after success.");

            setIsSuccess(true); // แสดงหน้า Success

        } catch (error) {
            console.error("CheckoutPage: Overall error during handleSubmitOrder:", error);
            alert(`เกิดข้อผิดพลาดในการยืนยันคำสั่งซื้อ: ${error.message}`);
        } finally {
            setIsProcessing(false); // หยุด Loading เสมอ
        }
    };

    // --- ส่วนแสดงผลตอนสั่งซื้อสำเร็จ ---
    if (isSuccess) {
        return ( /* ... โค้ดหน้า Success ... */
            <div className="bg-white min-h-screen">
                <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
                    <CheckCircleIcon />
                    <h1 className="text-3xl font-bold text-green-600 mt-4">สั่งซื้อสำเร็จ!</h1>
                    <p className="text-gray-600 mt-2">ขอบคุณที่ใช้บริการ AI Barista ครับ</p>
                    <p className="text-gray-600">คำสั่งซื้อของคุณ ({createdOrderId}) กำลังถูกจัดเตรียม</p>
                    <Link href={`/?orderId=${createdOrderId}`} className="mt-8 inline-block bg-[#4A3728] text-white px-8 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors shadow">
                        กลับสู่หน้าหลัก
                    </Link>
                </div>
            </div>
        );
    }

    // --- ส่วนแสดงผลตอนตะกร้าว่าง ---
    if (!isInitialMount.current && (!Array.isArray(cartItems) || cartItems.length === 0) && !isProcessing) {
         return ( /* ... โค้ดหน้า Empty Cart ... */
             <div className="bg-white min-h-screen">
                 <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
                     <EmptyCartIcon />
                     <h3 className="mt-4 text-xl font-semibold text-gray-700">ไม่มีสินค้าสำหรับชำระเงิน</h3>
                     <p className="text-gray-500 mt-2">ตะกร้าของคุณว่างเปล่าในขณะนี้</p>
                     <Link href="/chat" className="mt-6 inline-block bg-[#4A3728] text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors shadow">
                         กลับไปเลือกเมนู
                     </Link>
                 </div>
             </div>
         );
    }

    // --- ส่วนแสดงผล Loading (เพิ่ม: รอ UserContext โหลดด้วย) ---
     // ‼️ 4. แก้ไขเงื่อนไข Loading ‼️
    if (isInitialMount.current || userLoading) { // รอทั้งตะกร้าและ User โหลดเสร็จ
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }


    // --- ส่วนแสดงผลหลัก (ฟอร์มชำระเงิน) ---
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[#4A3728] text-center mb-8">ข้อมูลการชำระเงิน</h1>

                <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                    {/* คอลัมน์ซ้าย: ตัวเลือกการชำระเงิน */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border">
                         {/* ‼️ เพิ่ม: Input สำหรับ Table Number ‼️ */}
                         <div className="mb-8">
                             <label htmlFor="tableNumber" className="block text-xl font-semibold text-gray-700 mb-2">หมายเลขโต๊ะของคุณ</label>
                             <input
                                type="number"
                                name="tableNumber"
                                id="tableNumber"
                                value={formData.tableNumber}
                                onChange={handleInputChange}
                                // required // กำหนดให้จำเป็นต้องกรอกหรือไม่?
                                className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-lg p-2"
                                placeholder="ใส่หมายเลขโต๊ะ..."
                             />
                             <p className="text-xs text-gray-500 mt-1">กรุณากรอกหมายเลขโต๊ะเพื่อรับออเดอร์</p>
                         </div>

                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6">เลือกช่องทางการชำระเงิน</h2>
                        <div className="space-y-4">
                            {/* --- ตัวเลือกที่ 1: จ่ายที่เคาน์เตอร์ --- */}
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${formData.paymentMethod === 'counter' ? 'bg-green-50 border-green-600 ring-2 ring-green-500' : 'border-gray-300 hover:border-gray-400'}`}>
                                <input type="radio" name="paymentMethod" value="counter" checked={formData.paymentMethod === 'counter'} onChange={handleInputChange} className="sr-only" />
                                <CounterIcon />
                                <span className="ml-3 font-medium text-gray-700">ชำระเงินที่เคาน์เตอร์</span>
                            </label>
                            {/* --- ตัวเลือกที่ 2: จ่ายผ่านมือถือ --- */}
                            <div onClick={handleMobilePaymentLabelClick} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${formData.paymentMethod === 'qr' || formData.paymentMethod === 'card' ? 'bg-green-50 border-green-600 ring-2 ring-green-500' : 'border-gray-300 hover:border-gray-400'}`}>
                                <MobilePaymentIcon />
                                <span className="ml-3 font-medium text-gray-700">ชำระผ่านมือถือ</span>
                            </div>
                            {/* --- ตัวเลือกย่อย --- */}
                            {(formData.paymentMethod === 'qr' || formData.paymentMethod === 'card') && (
                                <div className="pl-12 space-y-3 mt-3 border-l-2 border-gray-200 ml-5">
                                    <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${formData.paymentMethod === 'qr' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}>
                                        <input type="radio" name="paymentMethod" value="qr" checked={formData.paymentMethod === 'qr'} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-3" />
                                        <QrCodeIcon />
                                        <span className="font-medium text-gray-700">QR Code</span>
                                    </label>
                                    <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${formData.paymentMethod === 'card' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}>
                                        <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-3" />
                                        <CreditCardIcon />
                                        <span className="font-medium text-gray-700">บัตรเครดิต / เดบิต</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* คอลัมน์ขวา: สรุปรายการ */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 border">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6">สรุปคำสั่งซื้อ</h2>
                            <div className="space-y-3 max-h-60 overflow-y-auto mb-4 border-b pb-4">
                                {Array.isArray(cartItems) && cartItems.map(item => (
                                    <div key={item.menuId} className="flex justify-between items-center text-sm">
                                        <div className="text-gray-600">
                                            <p>{item.menuName ?? 'Unknown Item'}</p>
                                            <p className="text-xs text-gray-400">x {item.quantity ?? 0}</p>
                                        </div>
                                        <p className="font-medium text-gray-800">฿{((item.menuPrice ?? 0) * (item.quantity ?? 0)).toFixed(2)}</p>
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
                                <button
                                    type="submit"
                                    // ‼️ 5. แก้ไขเงื่อนไข disabled ‼️
                                    disabled={isProcessing || !Array.isArray(cartItems) || cartItems.length === 0 || isInitialMount.current || userLoading}
                                    className="w-full text-center py-3 rounded-lg font-bold text-lg text-white bg-green-800 hover:bg-green-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? 'กำลังดำเนินการ...' : `ยืนยันคำสั่งซื้อ (฿${summary.total.toFixed(2)})`}
                                </button>
                                <Link href="/basket" className="block w-full text-center py-3 rounded-lg font-bold text-lg text-[#4A3728] bg-gray-100 hover:bg-gray-200 transition-colors">
                                    กลับไปแก้ไขตะกร้า
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

