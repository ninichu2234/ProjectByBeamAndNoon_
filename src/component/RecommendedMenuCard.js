// src/component/RecommendedMenuCard.js

"use client";
import React, { useState, useEffect, useCallback } from 'react';
// [FIX PATH] แก้ไข Path ไปยัง supabaseClient ให้ถูกต้อง
import { supabase } from '../app/lib/supabaseClient'; 
import Image from 'next/image';

export default function RecommendedMenuCard({ menu, onAddToCart }) {
    const [optionGroups, setOptionGroups] = useState([]);
    const [selections, setSelections] = useState({}); 
    const [isLoading, setIsLoading] = useState(true);
    const [currentPrice, setCurrentPrice] = useState(menu.menuPrice || 0);
    const [specialInstructions, setSpecialInstructions] = useState('');

    const addLog = (message) => console.log(`[${menu.menuName}] ${message}`);

    // --- (fetchOptions, useEffect โหลดข้อมูล, useEffect คำนวณราคา - เหมือนเดิม) ---
    const fetchOptions = useCallback(async (menuId) => {
        setIsLoading(true);
        setOptionGroups([]);
        setSelections({});
        setCurrentPrice(menu.menuPrice || 0); 
        setSpecialInstructions(''); 
        addLog(`(1) Fetching options...`);
        try {
            const { data, error } = await supabase.from('menuItemOptionGroups').select(`groupId, optionGroups (groupId, nameGroup, selectionType, option ( optionId, optionName, priceAdjustment ))`).eq('menuId', menuId);
            if (error) throw error;
            const groups = data.map(item => item.optionGroups).filter(Boolean); 
            setOptionGroups(groups);
            addLog(`(2) Fetched ${groups.length} groups.`);
            const defaultSelections = {};
            groups.forEach(group => {
                if (group.selectionType === 'single_required') { 
                    const defaultOption = group.option.find(opt => opt.optionName?.includes('100%')) || group.option.find(opt => opt.optionName?.includes('50%')) || group.option[0];
                    if (defaultOption) { defaultSelections[group.groupId] = String(defaultOption.optionId); }
                } else if (group.selectionType === 'single_optional') { 
                     defaultSelections[group.groupId] = ''; 
                } else if (group.selectionType === 'multiple_optional') {
                     defaultSelections[group.groupId] = []; 
                }
            });
            setSelections(defaultSelections);
        } catch (err) { addLog(`(!) ERROR fetching options: ${err.message}`);
        } finally { setIsLoading(false); addLog(`(4) Finished fetching.`); }
    }, [menu.menuId, menu.menuName, menu.menuPrice]); // ‼️ หมายเหตุ: ถ้า addLog ถูกสร้างนอก useCallback คุณอาจต้องเพิ่ม 'addLog' ในนี้ตามที่ Vercel เตือน

    useEffect(() => {
        if (menu.menuId) { fetchOptions(menu.menuId); }
        setCurrentPrice(menu.menuPrice || 0); 
    }, [menu.menuId, menu.menuPrice, fetchOptions]);

    useEffect(() => {
        if (!isLoading && optionGroups && optionGroups.length >= 0) { 
            let priceAdjustmentTotal = 0;
            const basePrice = menu.menuPrice || 0;
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
            if (newPrice !== currentPrice) { setCurrentPrice(newPrice); }
        } 
    }, [selections, optionGroups, menu.menuPrice, isLoading, currentPrice]); 

    // --- (Handlers - handleSelectionChange, handleAddClick - เหมือนเดิม) ---
    const handleSelectionChange = (groupId, optionId) => {
        addLog(`(!) Selection changed: Group ${groupId} -> Option ${optionId}`);
        setSelections(prev => ({ ...prev, [groupId]: optionId }));
    };

    const handleAddClick = () => {
        addLog(`(+) Add clicked. Final Price: ${currentPrice}. Instructions: "${specialInstructions}"`);
        const allSelectedOptions = [];
        let priceAdjustmentTotal = 0; 
        Object.entries(selections).forEach(([groupId, selectedOptionId]) => {
            if (selectedOptionId && selectedOptionId !== '') { 
                const group = optionGroups.find(g => String(g.groupId) === String(groupId));
                if (group) {
                    const option = group.option.find(o => String(o.optionId) === String(selectedOptionId));
                    if (option) {
                        allSelectedOptions.push({
                            optionId: option.optionId, optionName: option.optionName,
                            groupName: group.nameGroup, priceAdjustment: option.priceAdjustment || 0
                        });
                        priceAdjustmentTotal += (option.priceAdjustment || 0);
                    }
                }
            }
        });
        const customizations = { selectedOptions: allSelectedOptions, priceAdjustment: priceAdjustmentTotal };
        
        const itemToCart = { 
            ...menu, 
            quantity: 1, 
            finalPrice: currentPrice, 
            customizations: customizations,
            specialInstructions: specialInstructions.trim() || null 
        };
        
        onAddToCart(itemToCart); 
    };

    // --- ‼️‼️ UI ที่แก้ไข (ส่วน Dropdowns) ‼️‼️ ---
    return (
        <div className="bg-white/10 p-4 rounded-lg border border-white/20 flex flex-col transition hover:shadow-md hover:border-green-500">
            
            {/* (แถวบน: ข้อมูลเมนู - เหมือนเดิม) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mb-4">
                 <div className="flex items-center mb-3 sm:mb-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden mr-4 flex-shrink-0 bg-gray-700">
                        <Image src={menu.publicImageUrl || 'https://placehold.co/100x100/FFF/333?text=No+Image'} alt={menu.menuName || 'Menu Image'} width={80} height={80} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-white text-lg">{menu.menuName || 'Unknown Menu'}</p>
                        <p className="text-sm text-gray-300">Base: {typeof menu.menuPrice === 'number' ? `${menu.menuPrice.toFixed(2)} บาท` : 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* ‼️ 1. เปลี่ยนจาก flex-wrap เป็น grid ‼️ */}
            {!isLoading && optionGroups.length > 0 && (
                <div className="mb-4">
                    {/* ใช้ grid-cols-1 (มือถือ) และ md:grid-cols-2 (เดสก์ท็อป) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                        {optionGroups.map(group => (
                            // ‼️ 2. เปลี่ยนเป็น flex-col เพื่อให้ Label อยู่บน Select ‼️
                            <div key={group.groupId} className="flex flex-col space-y-1">
                                <label 
                                    htmlFor={`select-${menu.menuId}-${group.groupId}`} 
                                    className="text-xs text-gray-300 flex-shrink-0"
                                >
                                    {group.nameGroup}:
                                </label>
                                <select
                                    id={`select-${menu.menuId}-${group.groupId}`}
                                    value={selections[group.groupId] || ''} 
                                    onChange={(e) => handleSelectionChange(group.groupId, e.target.value)}
                                    // ‼️ 3. เพิ่ม w-full ให้ dropdown กว้างเต็มคอลัมน์ ‼️
                                    className="bg-white/20 text-white text-xs rounded p-2 border border-white/30 focus:outline-none focus:ring-1 focus:ring-green-500 w-full"
                                >
                                    {group.selectionType === 'single_optional' && (<option value="" className="text-black">None</option>)}
                                    {group.option.map(opt => (<option key={opt.optionId} value={String(opt.optionId)} className="text-black">{opt.optionName} {opt.priceAdjustment > 0 ? `(+${opt.priceAdjustment.toFixed(2)}฿)` : ''}</option>))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* ‼️ จบส่วนที่แก้ไข ‼️ */}

            {isLoading && (<div className="mb-4"><p className="text-xs text-gray-400">Loading options...</p></div>)}

            {/* (Textarea - เหมือนเดิม) */}
            <div className="mb-4">
                <label htmlFor={`instructions-${menu.menuId}`} className="block text-xs text-gray-300 mb-1">Notes:</label>
                <textarea
                    id={`instructions-${menu.menuId}`}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    rows="2"
                    placeholder="e.g., less ice, separate syrup..."
                    className="w-full bg-white/10 text-white text-xs rounded p-2 border border-white/30 focus:outline-none focus:ring-1 focus:ring-green-500 placeholder-gray-400"
                />
            </div>

            {/* (แถวล่าง: ราคา & ปุ่ม Add - เหมือนเดิม) */}
            <div className="border-t border-white/10 mt-auto pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <p className="text-lg font-bold text-white text-left sm:text-left mb-2 sm:mb-0">
                    Total: {currentPrice.toFixed(2)} บาท
                </p>
                <div className="flex-shrink-0 w-full sm:w-auto">
                    <button onClick={handleAddClick} disabled={!menu.menuId || isLoading} className="w-full sm:w-auto bg-[#2c8160] hover:bg-green-900 text-white font-bold py-2 px-5 rounded-full transition-colors duration-300 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Add 
                    </button>
                </div>
            </div>
        </div>
    );
}