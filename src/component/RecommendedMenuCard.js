// src/component/RecommendedMenuCard.js

"use client";
import React, { useState, useEffect, useCallback } from 'react';
// [FIX PATH] แก้ไข Path ไปยัง supabaseClient ให้ถูกต้อง
import { supabase } from '../app/lib/supabaseClient'; 
import Image from 'next/image';

export default function RecommendedMenuCard({ menu, onAddToCart }) {
    const [optionGroups, setOptionGroups] = useState([]);
    const [selections, setSelections] = useState({}); // Stores { groupId: optionIdAsString }
    const [isLoading, setIsLoading] = useState(true);
    const [currentPrice, setCurrentPrice] = useState(menu.menuPrice || 0);

    const addLog = (message) => console.log(`[${menu.menuName}] ${message}`);

    // --- Fetch Options ---
    const fetchOptions = useCallback(async (menuId) => {
        setIsLoading(true);
        setOptionGroups([]);
        setSelections({});
        setCurrentPrice(menu.menuPrice || 0); 
        addLog(`(1) Fetching options for menuId: ${menuId}...`);
        try {
            const { data, error } = await supabase
                .from('menuItemOptionGroups')
                .select(`
                    groupId,
                    optionGroups (
                        groupId, nameGroup, selectionType,
                        option ( optionId, optionName, priceAdjustment )
                    )
                `)
                .eq('menuId', menuId);
            
            if (error) throw error;
            const groups = data.map(item => item.optionGroups).filter(Boolean); 
            setOptionGroups(groups);
            addLog(`(2) Fetched ${groups.length} groups.`);

            // Set Defaults
            const defaultSelections = {};
            groups.forEach(group => {
                if (group.selectionType?.startsWith('single')) {
                    const defaultOption = 
                        group.option.find(opt => opt.optionName?.includes('100%')) || 
                        group.option.find(opt => opt.optionName?.includes('50%')) || 
                        group.option[0];
                    if (defaultOption) {
                        defaultSelections[group.groupId] = String(defaultOption.optionId); 
                        addLog(`(3) Set default for Group ${group.groupId}: Option ${defaultOption.optionId} (${defaultOption.optionName})`);
                    }
                }
            });
            setSelections(defaultSelections);

        } catch (err) {
            addLog(`(!) ERROR fetching options: ${err.message}`);
        } finally {
            setIsLoading(false);
            addLog(`(4) Finished fetching.`);
        }
    }, [menu.menuId, menu.menuName, menu.menuPrice]); 

    // --- Effect to Fetch ---
    useEffect(() => {
        if (menu.menuId) {
            fetchOptions(menu.menuId);
        }
        setCurrentPrice(menu.menuPrice || 0); 
    }, [menu.menuId, menu.menuPrice, fetchOptions]);

    // --- Effect to Recalculate Price ---
    useEffect(() => {
        // Run only AFTER loading is false AND options are loaded
        if (!isLoading && optionGroups && optionGroups.length >= 0) { // Check length >= 0 handles empty options case
            let priceAdjustmentTotal = 0;
            const basePrice = menu.menuPrice || 0;
            addLog(`(5) Recalculating price. Base: ${basePrice}. Current Selections: ${JSON.stringify(selections)}`); 
            
            Object.entries(selections).forEach(([groupId, selectedOptionId]) => {
                 const currentSelectedOptionId = String(selectedOptionId); 
                 const group = optionGroups.find(g => String(g.groupId) === String(groupId)); 
                 
                 if (group && currentSelectedOptionId) {
                    addLog(` -> Processing Group ${groupId}, looking for OptionID '${currentSelectedOptionId}'`);
                    
                    // เพิ่ม Log ตัวเลือกทั้งหมดในกลุ่มนี้
                    addLog(` -> Options in this group: ${group.option.map(o => `ID:${o.optionId} (${o.optionName})`).join(', ')}`);

                    // หา option (เทียบ ID เป็น String)
                    const option = group.option.find(o => String(o.optionId) === currentSelectedOptionId); 
                    
                    if (option) {
                        // ดึง priceAdjustment ออกมา (ตรวจสอบว่าเป็น number)
                        const adjustment = typeof option.priceAdjustment === 'number' ? option.priceAdjustment : 0;
                        addLog(` -> FOUND Option: ID ${option.optionId} (${option.optionName}), Adjustment: ${adjustment}`);
                        priceAdjustmentTotal += adjustment;
                    } else {
                        // ถ้าหาไม่เจอ ให้ Log บอก
                        addLog(` -> (!) WARN: Option ID '${currentSelectedOptionId}' NOT FOUND in Group ID '${groupId}'.`);
                    }
                } else {
                     addLog(` -> Skipping Group ${groupId} (Group not found or no selection: '${selectedOptionId}')`);
                }
            });
            
            const newPrice = basePrice + priceAdjustmentTotal;
            addLog(`(6) Calculation complete. Total Adjustment: ${priceAdjustmentTotal}, New Price: ${newPrice}`);
            
            // อัปเดต State ถ้าจำเป็น
            if (newPrice !== currentPrice) { 
                setCurrentPrice(newPrice);
                addLog(`(7) *** Price state UPDATED to: ${newPrice} ***`);
            } else {
                 addLog(`(7) Price remains ${currentPrice}.`);
            }
        } else {
             addLog(`(X) Skipping price calculation (isLoading: ${isLoading}, optionGroups loaded: ${optionGroups?.length})`);
        }
    // เพิ่ม menu.menuPrice เข้าไปอีกครั้งเพื่อความแน่ใจ
    }, [selections, optionGroups, menu.menuPrice, isLoading, currentPrice]); 

    // --- Handlers ---
    const handleSelectionChange = (groupId, optionId) => {
        addLog(`(!) User changed selection: Group ${groupId} -> Option ${optionId}`);
        setSelections(prev => ({
            ...prev,
            [groupId]: optionId, 
        }));
    };

    const handleAddClick = () => {
        // (Logic เดิม)
        addLog(`(+) Add clicked. Final Price: ${currentPrice}`);
        const allSelectedOptions = [];
        let priceAdjustmentTotal = 0; 
        Object.entries(selections).forEach(([groupId, selectedOptionId]) => {
            const group = optionGroups.find(g => String(g.groupId) === String(groupId));
            if (group && selectedOptionId) {
                const option = group.option.find(o => String(o.optionId) === String(selectedOptionId));
                if (option) {
                     allSelectedOptions.push({
                        optionId: option.optionId, optionName: option.optionName,
                        groupName: group.nameGroup, priceAdjustment: option.priceAdjustment || 0
                    });
                    priceAdjustmentTotal += (option.priceAdjustment || 0);
                }
            }
        });
        const customizations = { selectedOptions: allSelectedOptions, priceAdjustment: priceAdjustmentTotal };
        const itemToCart = { ...menu, quantity: 1, finalPrice: currentPrice, customizations: customizations };
        onAddToCart(itemToCart);
    };

    // --- UI ---
    return (
        <div className="bg-white/10 p-4 rounded-lg border border-white/20 flex flex-col transition hover:shadow-md hover:border-green-500">
            
            {/* 1. Top Row: Menu Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mb-4">
                <div className="flex items-center mb-3 sm:mb-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden mr-4 flex-shrink-0 bg-gray-700">
                        <Image
                            src={menu.publicImageUrl || 'https://placehold.co/100x100/FFF/333?text=No+Image'}
                            alt={menu.menuName || 'Menu Image'}
                            width={80} height={80}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-white text-lg">{menu.menuName || 'Unknown Menu'}</p>
                        <p className="text-sm text-gray-300">Base: {typeof menu.menuPrice === 'number' ? `${menu.menuPrice.toFixed(2)} บาท` : 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* 2. Middle Row: Options Dropdowns */}
            {!isLoading && optionGroups.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {optionGroups.map(group => (
                            <div key={group.groupId} className="flex items-center space-x-2">
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
                                    className="bg-white/20 text-white text-xs rounded p-2 border border-white/30 focus:outline-none focus:ring-1 focus:ring-green-500"
                                >
                                    {group.option.map(opt => (
                                        <option key={opt.optionId} value={String(opt.optionId)} className="text-black">
                                            {opt.optionName} {opt.priceAdjustment > 0 ? `(+${opt.priceAdjustment.toFixed(2)}฿)` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {isLoading && (
                 <div className="mb-4">
                     <p className="text-xs text-gray-400">Loading options...</p>
                 </div>
            )}

            {/* 3. Bottom Row: Current Price & Add Button */}
            <div className="border-t border-white/10 mt-auto pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <p className="text-lg font-bold text-white text-left sm:text-left mb-2 sm:mb-0">
                    Total: {currentPrice.toFixed(2)} บาท
                </p>
                <div className="flex-shrink-0 w-full sm:w-auto">
                    <button
                        onClick={handleAddClick}
                        disabled={!menu.menuId || isLoading}
                        className="w-full sm:w-auto bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-5 rounded-full transition-colors duration-300 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Add to Order
                    </button>
                </div>
            </div>
        </div>
    );
}