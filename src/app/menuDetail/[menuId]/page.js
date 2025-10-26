// src/app/menuDetail/menuId/page.js

"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
// ‼️ Make sure this path is correct relative to this file's NEW location ‼️
import { supabase } from '../../lib/supabaseClient'; 
import Image from 'next/image';
import Link from 'next/link'; 
import { v4 as uuidv4 } from 'uuid'; // Import uuid

// Helper function to get image URL 
const getPublicImageUrl = (item) => {
    if (item?.menuImage && item?.menuCategory) {
        const getFolderName = (category) => { /* ... switch case ... */ 
             switch(category){ case 'Coffee': case 'Tea': case 'Milk': case 'Refreshers': return 'Drink'; case 'Bakery': case 'Cake': case 'Dessert': return 'Bakery'; case 'Other': return 'Other'; default: return category;} };
        const folderName = getFolderName(item.menuCategory);
        const imagePath = `${folderName}/${item.menuImage}`;
        const { data } = supabase.storage.from('menu-images').getPublicUrl(imagePath);
        return data?.publicUrl || '';
    }
    return '';
};


export default function MenuDetailPage() {
    const params = useParams(); 
    const router = useRouter(); 
    const menuId = params.menuId; 

    const [menuItem, setMenuItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State for Customizations (Add if needed later) ---
    // const [selections, setSelections] = useState({});
    // const [specialInstructions, setSpecialInstructions] = useState('');
    // const [currentPrice, setCurrentPrice] = useState(0); 

    // Effect to fetch menu item details
    useEffect(() => {
        const fetchMenuItem = async () => {
            if (!menuId) { setError("Menu ID not found."); setIsLoading(false); return; }
            setIsLoading(true); setError(null);
            console.log(`Fetching details for menuId: ${menuId}`);
            try {
                const { data, error: dbError } = await supabase
                    .from('menuItems')
                    .select('*')
                    .eq('menuId', menuId) 
                    .single(); 
                if (dbError) throw dbError;
                if (!data) throw new Error("Menu item not found.");
                const itemWithImage = { ...data, publicImageUrl: getPublicImageUrl(data) };
                setMenuItem(itemWithImage);
                // setCurrentPrice(data.menuPrice || 0); // Initialize price if needed
                console.log("Item fetched:", itemWithImage);
            } catch (err) {
                console.error("Error fetching item:", err.message);
                setError(`ไม่สามารถโหลดข้อมูลเมนูได้: ${err.message}`);
                setMenuItem(null);
            } finally { setIsLoading(false); }
        };
        fetchMenuItem();
    }, [menuId]); 

    // --- Add to Cart Logic ---
    const handleConfirmAddToCart = () => {
        if (!menuItem) return; 
        try {
            const savedCartJSON = localStorage.getItem('myCafeCart');
            let currentCart = savedCartJSON ? JSON.parse(savedCartJSON) : [];

            // *** Create a new item with a unique cartItemId ***
            // This assumes no customization options on this page yet.
            // If you add options, gather them here.
            const newItem = { 
                cartItemId: uuidv4(), // Generate unique ID
                menuId: menuItem.menuId, 
                menuName: menuItem.menuName,
                menuPrice: menuItem.menuPrice, // Base price
                finalPrice: menuItem.menuPrice, // Use base price if no options yet
                publicImageUrl: menuItem.publicImageUrl, 
                quantity: 1,
                // Add default/empty customizations if structure requires it
                customizations: { selectedOptions: [], priceAdjustment: 0 }, 
                specialInstructions: null // Add instructions if you add an input
            };
            
            currentCart.push(newItem);
            console.log(`Added ${newItem.menuName} (cartItemId: ${newItem.cartItemId}) to cart`);

            localStorage.setItem('myCafeCart', JSON.stringify(currentCart));
            // Dispatch event to update cart summaries elsewhere
            window.dispatchEvent(new Event('local-storage')); 
            alert(`${menuItem.menuName} ถูกเพิ่มลงในตะกร้าแล้ว!`);
            router.push('/basket'); // Navigate to basket

        } catch (error) {
            console.error("Failed to update cart:", error);
            alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
        }
    };

    // --- Render Logic ---
    if (isLoading) return <div className="text-center py-20">กำลังโหลด...</div>;
    if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
    if (!menuItem) return <div className="text-center py-20 text-gray-500">ไม่พบเมนู</div>;

    // --- Display Item Details ---
    return (
        <div className="bg-gray-50 min-h-screen"> {/* Light background */}
            <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl"> 
                 {/* Back Button */}
                 <div className="mb-6">
                     <Link href="/menu" className="text-amber-600 hover:text-amber-800 transition-colors inline-flex items-center group">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                         กลับไปที่เมนู
                     </Link>
                 </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                     {/* Image */}
                     <div className="w-full h-64 sm:h-80 bg-gray-100 relative"> {/* Added relative positioning */}
                        <Image
                            src={menuItem.publicImageUrl || 'https://placehold.co/600x400/EFEFEF/AAAAAA?text=Image'}
                            alt={menuItem.menuName}
                            layout="fill" // Fill the container
                            objectFit="cover" // Cover the area
                            priority 
                        />
                    </div>
                    
                    {/* Details */}
                    <div className="p-6 sm:p-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{menuItem.menuName}</h1>
                        <p className="text-gray-700 mb-5 leading-relaxed">{menuItem.menuDescription || "ไม่มีคำอธิบาย"}</p>
                        <p className="text-3xl font-bold text-amber-600 mb-8">{menuItem.menuPrice} ฿</p>

                        {/* --- Placeholder for Future Customizations --- */}
                        {/* <div className="mb-6 space-y-4 border-t pt-6">
                            <h2 className="text-xl font-semibold text-gray-800">ตัวเลือกเพิ่มเติม</h2>
                             // Add Dropdowns, Textarea here later 
                             // Example: 
                             // <div>
                             //   <label>Sweetness:</label>
                             //   <select>...</select>
                             // </div>
                             // <div>
                             //    <label>Notes:</label>
                             //    <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} />
                             // </div> 
                        </div> 
                        */}
                        {/* --- End Placeholder --- */}

                        {/* Confirm Button */}
                        <button
                            onClick={handleConfirmAddToCart}
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg text-lg flex items-center justify-center gap-2" // Added flex gap
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> </svg>
                            ยืนยันเพิ่มลงตะกร้า
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}