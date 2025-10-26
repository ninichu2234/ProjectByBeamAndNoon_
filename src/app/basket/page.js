// src/app/basket/page.js

"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image'; 
import Link from 'next/link';

// Empty Cart Component
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

    // --- Effects ---
    useEffect(() => {
        // Load cart from localStorage on mount
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

        // Listen for storage changes from other tabs/windows
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

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('local-storage', handleStorageChange);
        };
    }, []); 

    // --- Cart Update Logic ---
    const updateCartAndStorage = (newCartItems) => {
        // Filter out invalid items and items with quantity <= 0
        const validCartItems = newCartItems.filter(item => item && (item.cartItemId || item.menuId) && item.quantity > 0);
        
        // Ensure uniqueness using cartItemId (important for customized items)
        const uniqueItems = [];
        const seenIds = new Set();
        for (const item of validCartItems) {
            const id = item.cartItemId || `menu-${item.menuId}`; // Fallback key
            if (!seenIds.has(id)) {
                uniqueItems.push(item);
                seenIds.add(id);
            } else {
                 console.warn("BasketPage: Duplicate cartItemId found during update:", id);
            }
        }

        setCartItems(uniqueItems); // Update state
        console.log("BasketPage: Updating cart state and storage:", uniqueItems);
        
        // Save to localStorage
        try {
            if (uniqueItems.length > 0) {
                localStorage.setItem('myCafeCart', JSON.stringify(uniqueItems));
            } else {
                localStorage.removeItem('myCafeCart');
            }
            // Notify other components (like ChatPage summary)
            window.dispatchEvent(new Event('local-storage')); 
        } catch (error) {
            console.error("BasketPage: Failed to save updated cart", error);
        }
    };

    // --- Event Handlers ---
    const handleQuantityChange = (cartItemId, change) => {
        console.log(`BasketPage: QuantityChange for cartItemId ${cartItemId}, change ${change}`);
        const newCart = cartItems.map(item =>
            item.cartItemId === cartItemId 
                ? { ...item, quantity: Math.max(1, (item.quantity ?? 0) + change) } // Ensure quantity doesn't go below 1 here, remove handles 0
                : item
        );
        // We don't filter quantity 0 here, remove button handles that
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

    // --- Memoized Summary Calculation ---
    const summary = useMemo(() => {
        const currentCart = Array.isArray(cartItems) ? cartItems : [];
        console.log("BasketPage: Calculating summary for items:", currentCart); 

        const subtotal = currentCart.reduce((sum, item) => {
            // *** Use finalPrice (includes options), fallback to menuPrice ***
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
    }, [cartItems]); // Recalculate only when cartItems changes

    // --- Render ---
    return (
        <div className="bg-gray-50 min-h-screen"> {/* Changed background */}
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl"> {/* Added max-width */}
                {/* Header */}
                <div className="text-center md:text-left mb-8"> 
                    <h1 className="text-3xl md:text-4xl font-bold text-[#4A3728]">ตะกร้าสินค้าของคุณ</h1> 
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-200"> 
                        {/* Section Header */}
                         <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6"> 
                            <h2 className="text-xl font-semibold text-gray-800">รายการเมนู ({summary.totalItems})</h2> 
                            {Array.isArray(cartItems) && cartItems.length > 0 && (
                                <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors">ล้างตะกร้า</button>
                            )} 
                         </div>
                        
                        {/* Cart Items List or Empty State */}
                        {isInitialMount.current ? ( 
                            <p className="text-center py-16 text-gray-500">กำลังโหลดรายการ...</p> 
                        ) : !Array.isArray(cartItems) || cartItems.length === 0 ? ( 
                            <EmptyCart /> 
                        ) : (
                            <div className="space-y-6">
                                {cartItems.map(item => {
                                    const itemKey = item.cartItemId || `menu-${item.menuId}`; 
                                    if (!itemKey) return null; // Skip rendering if no key
                                    
                                    const priceToUse = item.finalPrice ?? item.menuPrice ?? 0;
                                    const itemTotal = priceToUse * (item.quantity ?? 0);

                                    return (
                                        <div key={itemKey} className="flex flex-col sm:flex-row sm:items-start gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                            {/* Image */}
                                             <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200"> 
                                                <Image 
                                                    src={item.publicImageUrl || 'https://placehold.co/100x100/DDD/333?text=N/A'} 
                                                    alt={item.menuName || 'Menu Item'} 
                                                    width={64} height={64} 
                                                    className="w-full h-full object-cover"
                                                    // Add unoptimized={true} if needed
                                                /> 
                                             </div>

                                            {/* Details Column */}
                                            <div className="flex-grow min-w-[150px]">
                                                <h3 className="font-semibold text-gray-800">{item.menuName ?? 'Unknown Item'}</h3>
                                                
                                                {/* Display Customizations */}
                                                {item.customizations?.selectedOptions && item.customizations.selectedOptions.length > 0 && (
                                                    <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                                                        {item.customizations.selectedOptions.map(opt => ( 
                                                            <p key={opt.optionId}> - {opt.groupName}: {opt.optionName} {opt.priceAdjustment > 0 ? `(+${opt.priceAdjustment.toFixed(2)}฿)` : ''} </p> 
                                                        ))}
                                                    </div>
                                                )}

                                                {/* *** Display Special Instructions *** */}
                                                {item.specialInstructions && (
                                                    <div className="mt-1 text-xs text-blue-600 space-y-0.5">
                                                         <p>
                                                             <span className="font-semibold">Notes:</span> <span className="italic">{item.specialInstructions}</span>
                                                         </p>
                                                    </div>
                                                )}
                                                
                                                {/* Unit Price */}
                                                 <p className="text-gray-600 text-sm font-medium mt-1"> ฿{priceToUse.toFixed(2)} / unit </p>
                                            </div>
                                            
                                            {/* Controls Column (Quantity, Total, Remove) */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:ml-auto gap-4 sm:gap-6 w-full sm:w-auto">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 justify-center sm:justify-start"> 
                                                    <button onClick={() => handleQuantityChange(itemKey, -1)} className="w-7 h-7 rounded-full border text-gray-500 hover:bg-gray-100 transition disabled:opacity-50" disabled={item.quantity <= 1}> - </button> 
                                                    <span className="w-8 text-center font-medium text-gray-800">{item.quantity ?? 0}</span> 
                                                    <button onClick={() => handleQuantityChange(itemKey, 1)} className="w-7 h-7 rounded-full border text-gray-500 hover:bg-gray-100 transition"> + </button> 
                                                </div>
                                                
                                                {/* Item Total Price */}
                                                <div className="text-center sm:text-right w-24 flex-shrink-0"> 
                                                    <p className="font-bold text-lg text-gray-800">฿{itemTotal.toFixed(2)}</p> 
                                                </div>
                                                
                                                {/* Remove Button */}
                                                <div className="text-center sm:text-right">
                                                    <button onClick={() => removeItem(itemKey)} className="text-gray-400 hover:text-red-500 transition" title="Remove"> 
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    {/* Summary Section */}
                     <div className="lg:col-span-1"> 
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 border border-gray-200"> 
                            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">สรุปรายการ</h2> 
                            <div className="space-y-3"> {/* Adjusted spacing */}
                                <div className="flex justify-between text-sm text-gray-600"><span>ราคารวม (Subtotal)</span><span>฿{summary.subtotal.toFixed(2)}</span></div> 
                                <div className="flex justify-between text-sm text-gray-500"><span>ภาษี (7%)</span><span>฿{summary.vat.toFixed(2)}</span></div> 
                                <div className="border-t border-gray-200 pt-3 mt-3"> {/* Adjusted spacing */}
                                    <div className="flex justify-between font-bold text-lg text-[#4A3728]"><span>ยอดรวมสุทธิ (Total)</span><span>฿{summary.total.toFixed(2)}</span></div> 
                                </div> 
                            </div> 
                            <div className="mt-8 space-y-3"> 
                                <Link href="/checkout" 
                                    className={`block w-full text-center py-3 rounded-lg font-bold text-lg text-white transition-colors ${!cartItems || cartItems.length === 0 || isInitialMount.current ? 'bg-gray-400 cursor-not-allowed pointer-events-none' : 'bg-green-800 hover:bg-green-900 shadow-md'}`} // Added shadow
                                    aria-disabled={!cartItems || cartItems.length === 0 || isInitialMount.current} 
                                    onClick={(e) => { if (!cartItems || cartItems.length === 0 || isInitialMount.current) e.preventDefault(); }}> 
                                    ดำเนินการชำระเงิน 
                                </Link> 
                                <Link href="/chat" className="block w-full text-center py-3 rounded-lg font-medium text-sm text-[#4A3728] bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"> {/* Adjusted style */}
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