// src/app/menuDetail/[menuId]/page.js

"use client";

// 1. Import สิ่งที่ต้องใช้เพิ่ม
import { useState, useEffect, useCallback } from 'react'; 
import { useParams, useRouter } from 'next/navigation';
// [FIX PATH] ตรวจสอบว่า Path นี้ถูกต้อง
import { supabase } from '../../lib/supabaseClient'; 
import Image from 'next/image';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

// (Helper function to get image URL - เหมือนเดิม)
const getPublicImageUrl = (item) => {
    if (item?.menuImage && item?.menuCategory) {
        const getFolderName = (category) => { 
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

    // --- State จาก menuDetail (เดิม) ---
    const [menuItem, setMenuItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // State นี้ใช้สำหรับการโหลด *เมนูหลัก*
    const [error, setError] = useState(null);

    // --- 2. State ที่ยกมาจาก RecommendedMenuCard ---
    const [optionGroups, setOptionGroups] = useState([]);
    const [selections, setSelections] = useState({});
    const [currentPrice, setCurrentPrice] = useState(0); // ราคาที่จะอัปเดตตามตัวเลือก
    const [specialInstructions, setSpecialInstructions] = useState('');
    // State สำหรับการโหลด *ตัวเลือก* (แยกกัน)
    const [isOptionsLoading, setIsOptionsLoading] = useState(false); 

    // --- 3. Logic ที่ยกมาจาก RecommendedMenuCard (fetchOptions) ---
    // ใช้ useCallback เพื่อให้ฟังก์ชันเสถียร
    const fetchOptions = useCallback(async (menuIdToFetch, basePrice) => {
        if (!menuIdToFetch) return;
        
        console.log(`[${menuIdToFetch}] (1) Fetching options...`);
        setIsOptionsLoading(true);
        setOptionGroups([]);
        setSelections({});
        setSpecialInstructions(''); // รีเซ็ตโน้ต
        setCurrentPrice(basePrice || 0); // รีเซ็ตราคาเป็นราคาตั้งต้น

        try {
            const { data, error } = await supabase
                .from('menuItemOptionGroups')
                .select(`groupId, optionGroups (groupId, nameGroup, selectionType, option ( optionId, optionName, priceAdjustment ))`)
                .eq('menuId', menuIdToFetch);

            if (error) throw error;
            
            const groups = data.map(item => item.optionGroups).filter(Boolean);
            setOptionGroups(groups);
            console.log(`[${menuIdToFetch}] (2) Fetched ${groups.length} groups.`);

            // ตั้งค่า Default Selections
            const defaultSelections = {};
            groups.forEach(group => {
                if (group.selectionType === 'single_required') {
                    const defaultOption = group.option.find(opt => opt.optionName?.includes('100%')) || group.option.find(opt => opt.optionName?.includes('50%')) || group.option[0];
                    if (defaultOption) { defaultSelections[group.groupId] = String(defaultOption.optionId); }
                } else if (group.selectionType === 'single_optional') {
                    defaultSelections[group.groupId] = ''; // 'None'
                } else if (group.selectionType === 'multiple_optional') {
                    defaultSelections[group.groupId] = [];
                }
            });
            setSelections(defaultSelections);
        } catch (err) {
            console.error(`[${menuIdToFetch}] (!) ERROR fetching options: ${err.message}`);
            setError("ไม่สามารถโหลดตัวเลือกเพิ่มเติมได้");
        } finally {
            setIsOptionsLoading(false);
            console.log(`[${menuIdToFetch}] (4) Finished fetching options.`);
        }
    }, []); // Dependency ว่าง เพราะเราส่ง menuId และ basePrice เข้ามาตรงๆ

    // --- 4. Effect (เดิม) ที่ใช้โหลด *เมนูหลัก* (ปรับปรุงเล็กน้อย) ---
    useEffect(() => {
        const fetchMenuItem = async () => {
            if (!menuId) { 
                setError("Menu ID not found."); 
                setIsLoading(false); 
                return; 
            }
            setIsLoading(true); 
            setError(null);
            
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
                setCurrentPrice(data.menuPrice || 0); // *ตั้งค่าราคเริ่มต้นที่นี่*
                
                // *เมื่อโหลดเมนูหลักเสร็จ ให้ไปโหลดตัวเลือกต่อ*
                await fetchOptions(data.menuId, data.menuPrice); 

            } catch (err) {
                console.error("Error fetching item:", err.message);
                setError(`ไม่สามารถโหลดข้อมูลเมนูได้: ${err.message}`);
                setMenuItem(null);
            } finally {
                setIsLoading(false); // *โหลดเมนูหลักเสร็จ*
            }
        };
        fetchMenuItem();
    }, [menuId, fetchOptions]); // เพิ่ม fetchOptions ใน dependency array

    // --- 5. Effect ที่ยกมาจาก RecommendedMenuCard (คำนวณราคา) ---
    // (ปรับปรุงเล็กน้อยให้ใช้ menuItem.menuPrice)
    useEffect(() => {
        // ไม่ต้องคำนวณถ้าตัวเลือกกำลังโหลด หรือยังไม่มีเมนู
        if (isOptionsLoading || !menuItem) return; 

        let priceAdjustmentTotal = 0;
        const basePrice = menuItem.menuPrice || 0;

        Object.entries(selections).forEach(([groupId, selectedOptionId]) => {
            const currentSelectedOptionId = String(selectedOptionId);
            const group = optionGroups.find(g => String(g.groupId) === String(groupId));
            
            if (group && currentSelectedOptionId && currentSelectedOptionId !== '') {
                const option = group.option.find(o => String(o.optionId) === currentSelectedOptionId);
                if (option) {
                    const adjustment = typeof option.priceAdjustment === 'number' ? option.priceAdjustment : 0;
                    priceAdjustmentTotal += adjustment;
                }
            }
        });

        const newPrice = basePrice + priceAdjustmentTotal;
        if (newPrice !== currentPrice) {
            setCurrentPrice(newPrice);
        }
    }, [selections, optionGroups, menuItem, isOptionsLoading, currentPrice]);

    // --- 6. Handlers ที่ยกมาจาก RecommendedMenuCard ---

    // Handler สำหรับการเปลี่ยน Dropdown
    const handleSelectionChange = (groupId, optionId) => {
        console.log(`(!) Selection changed: Group ${groupId} -> Option ${optionId}`);
        setSelections(prev => ({ ...prev, [groupId]: optionId }));
    };

    // Handler สำหรับปุ่ม "ยืนยันเพิ่มลงตะกร้า" (อัปเดตใหม่)
    const handleConfirmAddToCart = () => {
        if (!menuItem) return;
        
        try {
            // รวบรวมข้อมูลตัวเลือก
            const allSelectedOptions = [];
            let priceAdjustmentTotal = 0;
            Object.entries(selections).forEach(([groupId, selectedOptionId]) => {
                if (selectedOptionId && selectedOptionId !== '') {
                    const group = optionGroups.find(g => String(g.groupId) === String(groupId));
                    if (group) {
                        const option = group.option.find(o => String(o.optionId) === String(selectedOptionId));
                        if (option) {
                            allSelectedOptions.push({
                                optionId: option.optionId,
                                optionName: option.optionName,
                                groupName: group.nameGroup,
                                priceAdjustment: option.priceAdjustment || 0
                            });
                            priceAdjustmentTotal += (option.priceAdjustment || 0);
                        }
                    }
                }
            });

            const customizations = { 
                selectedOptions: allSelectedOptions, 
                priceAdjustment: priceAdjustmentTotal 
            };

            // สร้าง Item ที่จะลงตะกร้า
            const newItem = {
                cartItemId: uuidv4(), // ID ที่ไม่ซ้ำกันสำหรับตะกร้า
                menuId: menuItem.menuId,
                menuName: menuItem.menuName,
                menuPrice: menuItem.menuPrice, // ราคาตั้งต้น
                finalPrice: currentPrice, // ราคาจริงหลังบวกตัวเลือก
                publicImageUrl: menuItem.publicImageUrl,
                quantity: 1,
                customizations: customizations, // ข้อมูลตัวเลือก
                specialInstructions: specialInstructions.trim() || null // โน้ต
            };

            // บันทึกลง Local Storage
            const savedCartJSON = localStorage.getItem('myCafeCart');
            let currentCart = savedCartJSON ? JSON.parse(savedCartJSON) : [];
            currentCart.push(newItem);
            
            console.log(`Added ${newItem.menuName} (cartItemId: ${newItem.cartItemId}) to cart`);
            localStorage.setItem('myCafeCart', JSON.stringify(currentCart));
            
            window.dispatchEvent(new Event('local-storage'));
            
            router.push('/basket'); // ไปที่หน้าตะกร้า

        } catch (error) {
            console.error("Failed to update cart:", error);
            alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
        }
    };

    // --- 7. Render Logic ---
    if (isLoading) return <div className="text-center py-20">Loading...</div>;
    if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
    if (!menuItem) return <div className="text-center py-20 text-gray-500">Menu not found</div>;

    // --- 8. UI ที่อัปเดตแล้ว ---
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/menu-page" className="text-green-700 hover:text-amber-800 transition-colors inline-flex items-center group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        กลับไปที่เมนู
                    </Link>
                </div>

                <div className="bg-[#F0EBE3] rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    {/* Image */}
                    <div className="w-full h-64 sm:h-80 bg-gray-100 relative">
                        <Image
                            src={menuItem.publicImageUrl || 'https://placehold.co/600x400/EFEFEF/AAAAAA?text=Image'}
                            alt={menuItem.menuName}
                            layout="fill"
                            objectFit="cover"
                            priority
                        />
                    </div>

                    {/* Details */}
                    <div className="p-6 sm:p-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-[#4A3728] mb-3">{menuItem.menuName}</h1>
                        <p className="text-[#4A3728] mb-5 leading-relaxed">{menuItem.menuDescription || "ไม่มีคำอธิบาย"}</p>
                        
                        {/* --- ส่วนของ Customizations ที่เพิ่มเข้ามา --- */}
                        <div className="mb-6 space-y-4 border-t pt-6">
                            <h2 className="text-xl font-semibold text-[#4A3728] mb-4">Additional options</h2>
                            
                            {isOptionsLoading && (
                                <p className="text-gray-500 text-sm">Loading...</p>
                            )}
                            
                            {!isOptionsLoading && optionGroups.length > 0 && (
                                <div className="space-y-4">
                                    {optionGroups.map(group => (
                                        <div key={group.groupId}>
                                            <label 
                                                htmlFor={`select-${menuItem.menuId}-${group.groupId}`} 
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                {group.nameGroup}
                                            </label>
                                            <select
                                                id={`select-${menuItem.menuId}-${group.groupId}`}
                                                value={selections[group.groupId] || ''}
                                                onChange={(e) => handleSelectionChange(group.groupId, e.target.value)}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                                            >
                                                {/* เพิ่ม Option "None" ถ้าเป็น single_optional */}
                                                {group.selectionType === 'single_optional' && (
                                                    <option value="">None</option>
                                                )}
                                                {group.option.map(opt => (
                                                    <option key={opt.optionId} value={String(opt.optionId)}>
                                                        {opt.optionName} {opt.priceAdjustment > 0 ? `(+${opt.priceAdjustment.toFixed(2)}฿)` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ช่องใส่โน้ต */}
                            <div>
                                <label 
                                    htmlFor={`instructions-${menuItem.menuId}`} 
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                   Note
                                </label>
                                <textarea
                                    id={`instructions-${menuItem.menuId}`}
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    rows="3"
                                    placeholder="เช่น ไม่หวาน, แยกน้ำแข็ง..."
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-800 focus:border-green-800 block w-full p-2.5 placeholder-gray-400"
                                />
                            </div>
                        </div>
                        {/* --- จบส่วน Customizations --- */}

                        {/* ราคา (อัปเดตให้ใช้ currentPrice) */}
                        <p className="text-3xl font-bold text-amber-600 mb-8">
                            Subtotal: {currentPrice.toFixed(2)} ฿
                        </p>

                        {/* Confirm Button (อัปเดต onClick และ disabled) */}
                        <button
                            onClick={handleConfirmAddToCart}
                            // ปิดปุ่มถ้ากำลังโหลดเมนูหลัก หรือกำลังโหลดตัวเลือก
                            disabled={isLoading || isOptionsLoading} 
                            className="w-full bg-[#2c8160] hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg text-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> </svg>
                             Add to cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}