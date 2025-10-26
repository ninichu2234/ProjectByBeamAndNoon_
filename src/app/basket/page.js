// src/app/basket/page.js

"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image'; // Make sure Image is imported
import Link from 'next/link';

// Empty Cart Component (เหมือนเดิม)
const EmptyCart = () => (
    <div className="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
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

    // Effect to load cart from localStorage and listen for changes
    useEffect(() => {
        console.log("BasketPage: useEffect [Mount] - Loading cart...");
        try {
            const savedCartJSON = localStorage.getItem('myCafeCart');
            const savedItems = savedCartJSON ? JSON.parse(savedCartJSON) : [];
            setCartItems(savedItems);
            console.log("BasketPage: Cart loaded:", savedItems);
        } catch (error) {
            console.error("BasketPage: Failed to load cart", error);
            setCartItems([]);
        } finally {
            isInitialMount.current = false;
        }
        const handleStorageChange = () => {
            console.log("BasketPage: Reloading cart via event...");
            try {
                const updatedCartJSON = localStorage.getItem('myCafeCart');
                const updatedItems = updatedCartJSON ? JSON.parse(updatedCartJSON) : [];
                setCartItems(updatedItems);
            } catch (error) {
                console.error("BasketPage: Failed to reload cart via event", error);
            }
        };
        window.addEventListener('local-storage', handleStorageChange);
        return () => {
            window.removeEventListener('local-storage', handleStorageChange);
        };
    }, []); 

    // Function to update cart state and localStorage
    const updateCartAndStorage = (newCartItems) => {
        const validCartItems = newCartItems.filter(item => item && (item.cartItemId || item.menuId) && item.quantity > 0);
        
        // Ensure no duplicates based on cartItemId if available
        const uniqueItems = [];
        const seenIds = new Set();
        for (const item of validCartItems) {
            const id = item.cartItemId || `menu-${item.menuId}`; // Use menuId as fallback key if needed
            if (!seenIds.has(id)) {
                uniqueItems.push(item);
                seenIds.add(id);
            } else {
                 console.warn("BasketPage: Duplicate cartItemId/menuId found during update, keeping first instance:", id);
            }
        }

        setCartItems(uniqueItems);
        console.log("BasketPage: Updating cart state and storage:", uniqueItems);
        try {
            if (uniqueItems.length > 0) {
                localStorage.setItem('myCafeCart', JSON.stringify(uniqueItems));
            } else {
                localStorage.removeItem('myCafeCart');
            }
            window.dispatchEvent(new Event('local-storage'));
        } catch (error) {
            console.error("BasketPage: Failed to save updated cart", error);
        }
    };

    // Handlers using cartItemId
    const handleQuantityChange = (cartItemId, change) => {
        console.log(`BasketPage: QuantityChange for cartItemId ${cartItemId}, change ${change}`);
        const newCart = cartItems.map(item =>
            item.cartItemId === cartItemId 
                ? { ...item, quantity: Math.max(0, (item.quantity ?? 0) + change) } // Ensure quantity doesn't go below 0
                : item
        ).filter(item => item.quantity > 0); // Remove item if quantity becomes 0
        updateCartAndStorage(newCart);
    };

    const removeItem = (cartItemId) => {
        console.log(`BasketPage: RemoveItem for cartItemId ${cartItemId}`);
        const newCart = cartItems.filter(item => item.cartItemId !== cartItemId);
        updateCartAndStorage(newCart);
    };

    const clearCart = () => {
        console.log("BasketPage: Clearing cart.");
        updateCartAndStorage([]);
    };

    // Calculate summary using finalPrice
    const summary = useMemo(() => {
        const currentCart = Array.isArray(cartItems) ? cartItems : [];
        console.log("BasketPage: Calculating summary for items:", currentCart); 

        const subtotal = currentCart.reduce((sum, item) => {
            // *** Use finalPrice if available, otherwise fallback to menuPrice ***
            const priceToUse = item.finalPrice ?? item.menuPrice ?? 0; 
            const quantity = item.quantity ?? 0;
            console.log(` -> Item: ${item.menuName}, PriceToUse: ${priceToUse}, Qty: ${quantity}`);
            return sum + (priceToUse * quantity);
        }, 0);
        
        const vat = subtotal * 0.07;
        const total = subtotal + vat;
        const totalItems = currentCart.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
        console.log("BasketPage: Summary calculated:", { subtotal, vat, total, totalItems });
        return { subtotal, vat, total, totalItems };
    }, [cartItems]);

    // --- UI ---
    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="text-center md:text-left mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#4A3728]">ตะกร้าสินค้าของคุณ</h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border">
                        <div className="flex justify-between items-center border-b pb-4 mb-6">
                            <h2 className="text-xl font-semibold text-gray-700">รายการเมนู ({summary.totalItems})</h2>
                            {Array.isArray(cartItems) && cartItems.length > 0 && (
                                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">ล้างตะกร้า</button>
                            )}
                        </div>
                        {isInitialMount.current ? (
                            <p className="text-center py-16 text-gray-500">กำลังโหลดรายการ...</p>
                        ) : !Array.isArray(cartItems) || cartItems.length === 0 ? (
                            <EmptyCart />
                        ) : (
                            <div className="space-y-6">
                                {cartItems.map(item => {
                                    // Use cartItemId as the primary key
                                    const itemKey = item.cartItemId || `menu-${item.menuId}`; 
                                    if (!itemKey) return null; 

                                    // Determine price and total for the item
                                    const priceToUse = item.finalPrice ?? item.menuPrice ?? 0;
                                    const itemTotal = priceToUse * (item.quantity ?? 0);

                                    return (
                                        <div key={itemKey} className="flex items-start flex-wrap gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">

                                            {/* Image */}
                                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                                <Image
                                                    src={item.publicImageUrl || 'https://placehold.co/100x100/DDD/333?text=N/A'}
                                                    alt={item.menuName || 'Menu Item'}
                                                    width={64} height={64}
                                                    className="w-full h-full object-cover"
                                                    // Add this if you haven't configured next.config.js for Supabase domain
                                                    // unoptimized={true} 
                                                />
                                            </div>

                                            {/* Name, Options, Unit Price */}
                                            <div className="flex-grow min-w-[150px]">
                                                <h3 className="font-semibold text-gray-800">{item.menuName ?? 'Unknown Item'}</h3>
                                                
                                                {/* Display Customizations */}
                                                {item.customizations?.selectedOptions && item.customizations.selectedOptions.length > 0 && (
                                                    <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                                                        {item.customizations.selectedOptions.map(opt => (
                                                            <p key={opt.optionId}>
                                                                - {opt.groupName}: {opt.optionName} {opt.priceAdjustment > 0 ? `(+${opt.priceAdjustment.toFixed(2)}฿)` : ''}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {/* Unit Price (using the priceToUse) */}
                                                 <p className="text-green-700 text-sm font-medium mt-1">
                                                     ฿{priceToUse.toFixed(2)} / unit
                                                 </p>
                                            </div>
                                            
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleQuantityChange(itemKey, -1)}
                                                    className="w-7 h-7 rounded-full border text-gray-500 hover:bg-gray-100 transition disabled:opacity-50"
                                                    // Disable (-) if quantity is 1
                                                    disabled={item.quantity <= 1} 
                                                > - </button>
                                                <span className="w-8 text-center font-medium text-gray-800">{item.quantity ?? 0}</span>
                                                <button 
                                                    onClick={() => handleQuantityChange(itemKey, 1)} 
                                                    className="w-7 h-7 rounded-full border text-gray-500 hover:bg-gray-100 transition"
                                                > + </button>
                                            </div>
                                            
                                            {/* Item Total Price */}
                                            <div className="text-right w-24 flex-shrink-0">
                                                <p className="font-bold text-lg text-gray-800">฿{itemTotal.toFixed(2)}</p>
                                            </div>
                                            
                                            {/* Remove Button */}
                                            <button 
                                                onClick={() => removeItem(itemKey)} 
                                                className="text-gray-400 hover:text-red-500 transition ml-auto sm:ml-4 flex-shrink-0"
                                                title="Remove item"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    {/* Summary Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 border">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6">สรุปรายการ</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm text-gray-600"><span>ราคารวม (Subtotal)</span><span>฿{summary.subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm text-gray-500"><span>ภาษี (7%)</span><span>฿{summary.vat.toFixed(2)}</span></div>
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between font-bold text-lg text-[#4A3728]"><span>ยอดรวมสุทธิ (Total)</span><span>฿{summary.total.toFixed(2)}</span></div>
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