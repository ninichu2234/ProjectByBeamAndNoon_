// src/app/chat/page.js

"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// [FIX PATH] แก้ไข Path ไปยัง supabaseClient ให้ถูกต้อง
import { supabase } from '../lib/supabaseClient'; 
import Image from 'next/image';

// [CHANGED] Import Component ใหม่
import RecommendedMenuCard from '../../component/RecommendedMenuCard'; // ตรวจสอบ Path ให้ถูกต้อง
import { v4 as uuidv4 } from 'uuid'; 

export default function ChatPage() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('สวัสดีค่ะ ให้ AI Barista แนะนำเมนูอะไรดีคะ?');
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedMenus, setRecommendedMenus] = useState([]);
    const [allMenuItems, setAllMenuItems] = useState([]);
    const [allOptions, setAllOptions] = useState({});
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const isInitialMount = useRef(true);

    // Effect โหลด cart, menu items, และ options ตอนเริ่ม
    useEffect(() => {
        // Load cart
        try {
            const savedCart = JSON.parse(localStorage.getItem('myCafeCart') || '[]');
            setCartItems(savedCart);
            console.log("ChatPage: Initial cart loaded:", savedCart);
        } catch (error) { console.error("ChatPage: Could not load cart", error); setCartItems([]); }
        
        // Fetch all menu items
        const fetchAllMenus = async () => { 
            console.log("ChatPage: Fetching all menus...");
            try {
                const { data: menuItems, error } = await supabase.from('menuItems').select('*');
                if (error) throw error; if (!menuItems) throw new Error("No data");
                const getFolderName = (cat) => { /* Function to get folder name */ 
                    switch(cat){ case 'Coffee': case 'Tea': case 'Milk': case 'Refreshers': return 'Drink'; case 'Bakery': case 'Cake': case 'Dessert': return 'Bakery'; case 'Other': return 'orther'; default: return cat;} };
                const itemsWithImages = menuItems.map(item => {
                    if (item.menuImage && item.menuCategory) {
                        const folderName = getFolderName(item.menuCategory);
                        const imagePath = `${folderName}/${item.menuImage}`;
                        const { data: imageData } = supabase.storage.from('menu-images').getPublicUrl(imagePath);
                        return { ...item, publicImageUrl: imageData?.publicUrl };
                    } return item; });
                setAllMenuItems(itemsWithImages);
                console.log("ChatPage: Menus fetched successfully.");
            } catch (error) { console.error("ChatPage: Error fetching menus:", error.message); setAllMenuItems([]); }
        };

        // Fetch all customization options (Using correct schema: 'option' and 'optionGroups')
        const fetchAllOptions = async () => {
            console.log("ChatPage: Fetching all options...");
            try {
                const { data: optionsData, error } = await supabase
                    .from('option') 
                    .select(`
                        optionName,
                        priceAdjustment,
                        optionGroups ( nameGroup ) 
                    `); 

                if (error) throw error;
                if (!optionsData) throw new Error("No options data returned");

                const grouped = optionsData.reduce((acc, opt) => {
                    if (!opt.optionGroups || !opt.optionGroups.nameGroup) {
                        console.warn("Skipping option with missing group:", opt);
                        return acc;
                    }
                    const group = opt.optionGroups.nameGroup; 
                    if (!acc[group]) acc[group] = [];
                    const priceInfo = (opt.priceAdjustment ?? 0) > 0 
                        ? `+${opt.priceAdjustment}B` 
                        : 'default';
                    acc[group].push(`${opt.optionName} (${priceInfo})`);
                    return acc;
                }, {}); 
                
                setAllOptions(grouped);
                console.log("ChatPage: Options fetched and grouped:", grouped);
            
            } catch (error) {
                console.error("ChatPage: Error fetching options:", error.message);
                setAllOptions({});
            }
        };
        
        fetchAllMenus();
        fetchAllOptions(); 
        
        isInitialMount.current = false;
    }, []); 

    // Effect คำนวณราคารวม และ บันทึก cart
    useEffect(() => {
        const currentCart = Array.isArray(cartItems) ? cartItems : [];
        const newTotal = currentCart.reduce((sum, item) => {
            const priceToUse = item.finalPrice ?? item.menuPrice ?? 0; 
            const quantity = item.quantity ?? 0;
            return sum + (priceToUse * quantity);
        }, 0);
        setTotalPrice(newTotal); 

        if (!isInitialMount.current) {
            try {
                if (currentCart.length > 0) { 
                    localStorage.setItem('myCafeCart', JSON.stringify(currentCart)); 
                } else { 
                    localStorage.removeItem('myCafeCart'); 
                }
                window.dispatchEvent(new Event('local-storage')); 
            } catch (error) { console.error("ChatPage: Failed to save cart", error); }
        }
    }, [cartItems]); 

    // Helper function for Text-to-Speech
    const speak = (text) => {
        if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
        window.speechSynthesis.cancel(); 
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = 'th-TH';
        utt.rate = 1.0;
        let voices = window.speechSynthesis.getVoices();
        const setVoice = () => {
            voices = window.speechSynthesis.getVoices();
            const voice = voices.find(v => v.lang === 'th-TH' && v.name.includes('Kanya'));
            if (voice) utt.voice = voice;
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.speak(utt);
            }
        };
        if (voices.length === 0) {
            window.speechSynthesis.onvoiceschanged = setVoice;
        } else {
            setVoice(); 
        }
    };

    // Added cleanup effect for speech synthesis on unmount
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []); 


    // Handler for Speech-to-Text
    const handleListen = () => { 
        if (typeof window === 'undefined') return; 
        
        // ‼️ นี่คือส่วนที่ทำให้เกิด Error "Browser not supported" ‼️
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition; 
        if (!SR) {
            alert("ขออภัยครับ เบราว์เซอร์ของคุณไม่รองรับการสั่งด้วยเสียง (โปรดลองใช้ Google Chrome)");
            return;
        }
        // ‼️ สิ้นสุดส่วน Error ‼️
        
        const rec = new SR(); rec.lang = 'th-TH'; rec.interimResults = false; rec.maxAlternatives = 1;
        rec.onstart = () => { setIsListening(true); setQuestion("กำลังฟัง..."); };
        rec.onresult = (e) => { 
            const text = e.results[0][0].transcript; 
            setQuestion(text); 
            handleSubmit(text); // ‼️ ส่งข้อความเสียงไปให้ handleSubmit
        };
        rec.onerror = (e) => { console.error("Speech error", e.error); setQuestion(''); alert(`Error: ${e.error}`); };
        rec.onend = () => { setIsListening(false); if (question === "กำลังฟัง...") setQuestion(''); }; rec.start();
    };

    // Handler to add item from RecommendedMenuCard to cart
    const _updateCart = (itemToAddFromCard) => {
        setCartItems(prevItems => {
            const currentCart = Array.isArray(prevItems) ? prevItems : [];
            if (!itemToAddFromCard?.menuId) { 
                console.error("ChatPage: Invalid item data received from card:", itemToAddFromCard); 
                return currentCart; 
            }
            const newItem = { 
                ...itemToAddFromCard, 
                cartItemId: itemToAddFromCard.cartItemId || uuidv4(), 
            };
            const updatedItems = [...currentCart, newItem];
            console.log(`ChatPage: Added item cartItemId: ${newItem.cartItemId}`, newItem);
            return updatedItems; 
        });
    };
    
    // Handler to submit question to AI
    const handleSubmit = async (textFromSpeech = null) => { // ‼️ textFromSpeech จะมีค่าถ้ามาจากไมค์
        const currentQuestion = textFromSpeech || question; 
        if (!currentQuestion.trim() || currentQuestion === "กำลังฟัง...") return;

        const promptToAI = `${currentQuestion}\n\n(AI, please also ask a relevant follow-up question to keep the conversation going.)`;

        setIsLoading(true); setAnswer("กำลังคิด..."); setRecommendedMenus([]);

        let menuContext = "Menu:\n"; 
        if (allMenuItems?.length > 0) { 
            allMenuItems.forEach(item => { menuContext += `- ID: ${item.menuId}, Name: ${item.menuName}, Price: ${item.menuPrice}\n`; }); 
        } else { menuContext += "- None loaded.\n"; }

        let optionsContext = "Available Customizations:\n";
        if (Object.keys(allOptions).length > 0) {
            for (const groupName in allOptions) {
                optionsContext += `* ${groupName}:\n  - ${allOptions[groupName].join('\n  - ')}\n`;
            }
        } else {
            optionsContext += "- None loaded.\n";
        }
        
        let finalAnswerText = ''; 

        try {
            const res = await fetch('/api/chat', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    question: promptToAI, 
                    menuContext, 
                    optionsContext 
                }) 
            });

            const body = await res.text(); if (!res.ok) throw new Error(`API Error (${res.status}): ${body}`); 
            let data; try { data = JSON.parse(body); } catch (e) { throw new Error("Invalid JSON response from API"); }
            const { responseText } = data; if (!responseText) throw new Error("API returned no responseText");
            const jsonMatch = responseText.trim().match(/^\{[\s\S]*\}$/); 
            
            if (jsonMatch) { 
                try { 
                    const aiRes = JSON.parse(jsonMatch[0]); 
                    finalAnswerText = aiRes.text || "แนะนำ:"; 
                    setAnswer(finalAnswerText); 
                    
                    let recs = []; 
                    if (Array.isArray(aiRes.recommendations)) { 
                        recs = aiRes.recommendations.map(m => { 
                            const id = m?.menuId ?? m?.item_id; 
                            if (id == null) return null; 
                            const fullMenuItem = allMenuItems.find(i => String(i.menuId) === String(id)); 
                            if (!fullMenuItem) return null; 
                            const suggestedOptions = m.suggestedOptions || []; 
                            return {
                                ...fullMenuItem, 
                                suggestedOptions: suggestedOptions 
                            };
                        }).filter(Boolean); 
                    } 
                    setRecommendedMenus(recs); 
                    console.log("ChatPage: Recommendations set:", recs);
                } catch (e) { 
                    finalAnswerText = "AI Error: Invalid JSON structure in response."; 
                    setAnswer(finalAnswerText); 
                    setRecommendedMenus([]); 
                    console.error("AI JSON Parse Error:", e); 
                } 
            } else { 
                finalAnswerText = responseText; 
                setAnswer(finalAnswerText); 
                setRecommendedMenus([]); 
                console.log("ChatPage: AI response was plain text."); 
            }
        } catch (error) { 
            console.error("ChatPage Submit Error:", error); 
            finalAnswerText = `เกิดข้อผิดพลาด: ${error.message}`; 
            setAnswer(finalAnswerText); 
            setRecommendedMenus([]);
        } finally { 
            setIsLoading(false); 
            
            // ‼️ ‼️ ‼️ นี่คือ Logic ที่คุณต้องการ ‼️ ‼️ ‼️
            if (textFromSpeech) { // ถ้า textFromSpeech มีค่า (มาจากไมค์)
                setQuestion(''); // ล้างช่อง input
                speak(finalAnswerText); // สั่งให้ AI พูดกลับ
            } 
            // ‼️ ถ้า textFromSpeech เป็น null (มาจากปุ่ม Ask Barista) มันจะไม่ทำใน if นี้
        }
    };

    // --- JSX ---
    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto p-4 sm:p-8 max-w-5xl">
                 {/* Header */}
                 <div className="text-center mb-8">
                     <h1 className="text-[#4A3728] font-bold text-3xl tracking-tight">Barista</h1>
                     <p className="text-[#4A3728] font-bold">Ready to recommend for you</p>
                 </div>
                 {/* Today's Special */}
                 <div className="bg-[#4A3728] p-6 rounded-xl mb-8 border-l-4 border-green-700">
                     <h2 className="text-2xl font-bold text-white mb-2">Today&apos;s Special</h2>
                     <p className="text-white mb-4">&quot;Iced Oat Milk Hazelnut Latte&quot; ความหอมหวานลงตัว</p>
                     <button onClick={() => setQuestion("ขอลอง Iced Oat Milk Hazelnut Latte")} className="bg-[#2c8160] hover:bg-green-900 text-white font-bold py-2 px-5 rounded-full text-sm">Ask about this menu</button>
                 </div>

                 {/* Input Section */}
                 <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg mb-8"> 
                     <label htmlFor="question" className="block text-white font-bold mb-6">What can I get for you?</label>
                     <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-400" rows="3" placeholder="เช่น กาแฟไม่เปรี้ยว, ชาผลไม้..." disabled={isLoading || isListening} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isListening) { e.preventDefault(); handleSubmit(); } }} />
                     <div className="mt-3 flex flex-wrap gap-2"> 
                         <button onClick={() => setQuestion("New Menu?")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">New Menu?</button>
                         <button onClick={() => setQuestion("หาแฟนให้หน่อย")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">หาแฟนให้หน่อย</button>
                         <button onClick={() => setQuestion("Something sweet")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">Something sweet</button>
                     </div>
                     <div className="mt-4 flex items-center gap-3">
                         {/* ‼️ ปุ่มนี้จะเรียก handleSubmit(null) */}
                         <button onClick={() => handleSubmit()} disabled={isLoading || !question.trim() || isListening || question === "Listening..."} className="w-full bg-[#2c8160] hover:bg-green-900 text-white font-bold py-3 px-8 rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"> {isLoading ? 'Thinking...' : ' Ask Barista'} </button>
                         {/* ‼️ ปุ่มนี้จะเรียก handleListen() */}
                         <button onClick={handleListen} disabled={isLoading || isListening} className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-600 animate-pulse' : 'bg-white/20 hover:bg-white/30'} disabled:bg-gray-400 disabled:cursor-not-allowed`} title="สั่งด้วยเสียง"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 11-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> </button>
                     </div>
                 </div>

                {/* Recommendation Section */}
                <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg min-h-[100px] mb-8">
                     <div className="flex items-start space-x-4"> 
                         <div className="bg-[#2c8160] rounded-full p-2 flex-shrink-0"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.5a1 1 0 01.7.3l2.4 2.4a1 1 0 01.3.7V8z" /></svg> </div>
                         <div className="w-full"> <h2 className="text-xl font-bold text-white mb-2">Suggestion:</h2> <div className="text-white whitespace-pre-wrap prose prose-invert max-w-none">{answer}</div> </div>
                     </div>
                    
                    {Array.isArray(recommendedMenus) && recommendedMenus.length > 0 && (
                        <div className="mt-6 border-t border-white/20 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Recommend for you:</h3>
                            <div className="space-y-4">
                                {recommendedMenus.map((menu) => (
                                    <RecommendedMenuCard 
                                        key={menu.menuId}
                                        menu={menu}
                                        initialOptions={menu.suggestedOptions || []} 
                                        onAddToCart={_updateCart} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Cart Summary Section */}
                <div className="bg-[#F0EBE3] p-6 rounded-xl shadow-lg sticky top-4 z-10">
                    <h2 className="text-2xl font-bold text-[#4A3728] mb-4">Your Order</h2>
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                        {Array.isArray(cartItems) && cartItems.length > 0 ? (
                            cartItems.map((item) => {
                                const priceToDisplay = item.finalPrice ?? item.menuPrice ?? 0;
                                const itemTotal = priceToDisplay * (item.quantity ?? 0);
                                return (
                                    <div key={item.cartItemId} className="flex justify-between items-start text-[#4A3728]"> 
                                        <div className="font-medium text-sm flex-grow mr-2"> 
                                            {item.menuName} x {item.quantity}
                                            {item.customizations?.selectedOptions?.map(opt => (
                                                <p key={opt.optionId} className="text-xs text-gray-600 ml-2">
                                                    - {opt.groupName}: {opt.optionName} {opt.priceAdjustment > 0 ? `(+${opt.priceAdjustment.toFixed(2)}฿)` : ''}
                                                </p>
                                            ))}
                                             {item.specialInstructions && (
                                                 <p className="text-xs text-blue-600 ml-2 mt-1"> 
                                                     Note: <span className="italic">{item.specialInstructions}</span>
                                                 </p>
                                             )}
                                        </div>
                                        <p className="font-bold flex-shrink-0 whitespace-nowrap"> {itemTotal.toFixed(2)} ฿</p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 text-center">Your cart is empty</p>
                        )}
                    </div>
                    {/* Total and Checkout */}
                    <div className="border-t-2 border-[#4A3728] pt-4 flex justify-between items-center">
                        <span className="text-xl font-bold text-[#4A3728]">Total:</span>
                        <span className="text-2xl font-extrabold text-[#4A3T28]">{totalPrice.toFixed(2)} ฿</span> 
                    </div>
                    <Link href="/basket">
                        <button disabled={!cartItems || cartItems.length === 0} className="mt-5 w-full bg-[#2c8160] hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                            Continue
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}