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
    const [isListening, setIsListening] = useState(false); // (บีม) State นี้จะถูกคุมโดย (ข้อ 13)
    const isInitialMount = useRef(true);

    // [FIX 13] State และ Ref สำหรับการสนทนาต่อเนื่อง
    const [isContinuousListening, setIsContinuousListening] = useState(false);
    const recognitionRef = useRef(null);
    
    // (ข้อ 14 ถูกข้ามไปตามคำขอ)

    // ... (useEffect โหลด cart, menu, options ไม่เปลี่ยนแปลง) ...
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

    // ... (useEffect คำนวณราคา ไม่เปลี่ยนแปลง) ...
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

    // [FIX 13] Helper function for Text-to-Speech (เพิ่ม onEndCallback)
    const speak = (text, onEndCallback = null) => {
        if (typeof window === 'undefined' || !window.speechSynthesis || !text) {
            if (onEndCallback) onEndCallback(); // เรียก callback ทันทีถ้าพูดไม่ได้
            return;
        }
        window.speechSynthesis.cancel(); 
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = 'th-TH';
        utt.rate = 1.0;

        // [FIX 13] เมื่อพูดจบ ให้เรียก callback
        utt.onend = () => {
            if (onEndCallback) {
                onEndCallback();
            }
        };
        
        // [FIX 13] จัดการกรณี error
        utt.onerror = (e) => {
            console.error("Speech synthesis error:", e);
            if (onEndCallback) {
                onEndCallback(); // ยังคงเรียก callback เพื่อให้ loop ไม่พัง
            }
        };

        let voices = window.speechSynthesis.getVoices();
        const setVoice = () => {
            voices = window.speechSynthesis.getVoices();
            const voice = voices.find(v => v.lang === 'th-TH' && v.name.includes('Kanya'));
            if (voice) utt.voice = voice;
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.speak(utt);
            } else if (onEndCallback) {
                onEndCallback(); // Failsafe
            }
        };
        if (voices.length === 0) {
            window.speechSynthesis.onvoiceschanged = setVoice;
        } else {
            setVoice(); 
        }
    };

    // [FIX 13] Added cleanup effect for speech synthesis on unmount
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.onvoiceschanged = null;
            }
            // [FIX 13] cleanup STT ด้วย
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, []); 


    // [FIX 13] ลบ `handleListen` (แบบเก่า) ทิ้ง
    /*
    const handleListen = () => { 
       // ... โค้ดเก่าถูกลบ ...
    };
    */

    // [FIX 13] ฟังก์ชันสำหรับเริ่มฟัง (STT) - นี่คือส่วนหนึ่งของ Loop
    const startListening = () => {
        if (!isContinuousListening) return; 

        console.log("STT: Starting listener...");
        if (typeof window === 'undefined') {
            stopContinuousListening(); return;
        }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            alert("Browser not supported");
            stopContinuousListening(); return;
        }
        
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        const rec = new SR();
        recognitionRef.current = rec;
        rec.lang = 'th-TH';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.continuous = false; 

        rec.onstart = () => {
            setIsListening(true); // (บีม) ใช้ State "isListening" เดิม
            setQuestion("กำลังฟัง...");
        };
        
        rec.onresult = (e) => {
            const text = e.results[0][0].transcript;
            console.log("STT: Heard:", text);
            setQuestion(text);
            setIsListening(false);
            if (recognitionRef.current) {
                recognitionRef.current.stop(); 
                recognitionRef.current = null;
            }
            
            // [FIX 13] เรียก handleSubmit พร้อม callback (startListening)
            handleSubmit(text, startListening);
        };
        
        rec.onend = () => {
            console.log("STT: Listener ended.");
            setIsListening(false);
            recognitionRef.current = null;
            
            if (isContinuousListening && !isLoading) { 
                 console.log("STT: Timeout or no speech, listening again.");
                 startListening();
            }
        };
        
        // [START] โค้ดที่แก้ไขจากคำถามล่าสุด
        rec.onerror = (e) => {
            console.error("Speech error", e.error);
            setIsListening(false);
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }

            // [FIX] เพิ่มการจัดการ Error ที่ไม่สามารถกู้คืนได้
            if (e.error === 'not-allowed') {
                alert("คุณต้องอนุญาตให้ใช้ไมโครโฟนก่อนค่ะ");
                stopContinuousListening(); // หยุด loop ไปเลย
            } else if (e.error === 'service-not-allowed') {
                 alert("Speech Recognition ใช้งานไม่ได้ อาจจะต้องรันบน HTTPS หรือ localhost เท่านั้นค่ะ");
                 stopContinuousListening(); // หยุด loop
            } else if (e.error !== 'aborted' && isContinuousListening) {
                // สำหรับ Error อื่นๆ (เช่น network, no-speech) ให้พยายามฟังใหม่
                console.log("STT: Error, listening again.");
                startListening();
            }
        };
        // [END] โค้ดที่แก้ไขจากคำถามล่าสุด

        rec.start();
    };

    // [FIX 13] ฟังก์ชันสำหรับหยุดโหมดสนทนาต่อเนื่อง
    const stopContinuousListening = () => {
        console.log("Stopping continuous conversation.");
        setIsContinuousListening(false);
        setIsListening(false);
        setIsLoading(false); 
        
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel(); 
        }
        setQuestion('');
        setAnswer('สวัสดีค่ะ ให้ AI Barista แนะนำเมนูอะไรดีคะ?'); 
        
        // (ข้อ 14 ไม่ได้เพิ่มการล้าง chatHistory)
    };

    // [FIX 13] ฟังก์ชันสำหรับปุ่มไมโครโฟน (Toggle)
    const toggleContinuousListen = () => {
        if (isContinuousListening) {
            // ถ้ากำลังคุยอยู่ กดอีกครั้งเพื่อ >> หยุด
            stopContinuousListening();
        } else {
            // ถ้ายังไม่ได้คุย กดเพื่อ >> เริ่ม
            if (isLoading) return; 
            
            setIsContinuousListening(true);
            setAnswer("สวัสดีค่ะ พูดคุยได้เลย...");
            
            speak("สวัสดีค่ะ พูดคุยได้เลยค่ะ", () => {
                startListening();
            });
        }
    };


    // [FIX 7] แก้ไขฟังก์ชัน _updateCart ให้รวมออเดอร์ที่เหมือนกัน
    const _updateCart = (itemToAddFromCard) => {
        setCartItems(prevItems => {
            const currentCart = Array.isArray(prevItems) ? prevItems : [];
            if (!itemToAddFromCard?.menuId) { 
                console.error("ChatPage: Invalid item data received from card:", itemToAddFromCard); 
                return currentCart; 
            }

            // (บีม) สร้าง "ลายนิ้วมือ" (fingerprint)
            const newItemOptions = itemToAddFromCard.customizations?.selectedOptions || [];
            const newItemFingerprint = JSON.stringify(newItemOptions.map(opt => ({
                groupName: opt.groupName,
                optionName: opt.optionName
            })).sort((a, b) => a.groupName.localeCompare(b.groupName))); 
            const newItemSpecialInstructions = itemToAddFromCard.specialInstructions || "";

            // (บีม) ค้นหา item ที่เหมือนกัน
            const existingItemIndex = currentCart.findIndex(item => {
                const existingItemOptions = item.customizations?.selectedOptions || [];
                const existingItemFingerprint = JSON.stringify(existingItemOptions.map(opt => ({
                    groupName: opt.groupName,
                    optionName: opt.optionName
                })).sort((a, b) => a.groupName.localeCompare(b.groupName)));
                const existingItemSpecialInstructions = item.specialInstructions || "";

                return item.menuId === itemToAddFromCard.menuId && 
                       existingItemFingerprint === newItemFingerprint &&
                       existingItemSpecialInstructions === newItemSpecialInstructions;
            });

            if (existingItemIndex > -1) {
                // ถ้าเจอ -> รวมยอด
                const updatedItems = [...currentCart];
                const existingItem = updatedItems[existingItemIndex];
                updatedItems[existingItemIndex] = {
                    ...existingItem,
                    quantity: (existingItem.quantity || 1) + (itemToAddFromCard.quantity || 1),
                };
                console.log(`ChatPage: Merged item quantity for cartItemId: ${existingItem.cartItemId}`);
                return updatedItems;
            } else {
                // ถ้าไม่เจอ -> เพิ่มใหม่
                const newItem = { 
                    ...itemToAddFromCard, 
                    cartItemId: itemToAddFromCard.cartItemId || uuidv4(),
                };
                const updatedItems = [...currentCart, newItem];
                console.log(`ChatPage: Added new item cartItemId: ${newItem.cartItemId}`, newItem);
                return updatedItems; 
            }
        });
    };
    
    // [FIX 13] Handler to submit question to AI (เพิ่ม onSpeakEndCallback)
    // (ข้อ 14 ไม่ได้เพิ่ม chatHistory)
    const handleSubmit = async (textFromSpeech = null, onSpeakEndCallback = null) => { 
        const currentQuestion = textFromSpeech || question; 
        
        if ((!currentQuestion.trim() || currentQuestion === "กำลังฟัง...") && onSpeakEndCallback) {
            onSpeakEndCallback();
            return;
        }
        
        if (!currentQuestion.trim() || currentQuestion === "กำลังฟัง...") return;

        // (ข้อ 14 ไม่ได้เพิ่ม chatHistory, เราจึงยังใช้ promptToAI แบบเดิม)
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
                    question: promptToAI, // (บีม) ยังใช้ promptToAI แบบเดิม
                    menuContext, 
                    optionsContext 
                    // (ข้อ 14 ไม่ได้เพิ่ม chatHistory)
                }) 
            });

            const body = await res.text(); if (!res.ok) throw new Error(`API Error (${res.status}): ${body}`); 
            let data; try { data = JSON.parse(body); } catch (e) { throw new Error("Invalid JSON response from API"); }
            
            const { responseText } = data; if (!responseText) throw new Error("API returned no responseText");

            // (บีม) เพิ่มโค้ด "แกะ" JSON (จากครั้งก่อน)
            let jsonString = responseText;
            const jsonMatch = responseText.match(/```json([\s\S]*?)```/);
            if (jsonMatch && jsonMatch[1]) {
                jsonString = jsonMatch[1].trim();
            }
            
            if (jsonString.startsWith('{') && jsonString.endsWith('}')) { 
                try { 
                    const aiRes = JSON.parse(jsonString); 
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
                            return { ...fullMenuItem, suggestedOptions: suggestedOptions };
                        }).filter(Boolean); 
                    } 
                    setRecommendedMenus(recs); 
                    console.log("ChatPage: Recommendations set:", recs);
                } catch (e) { 
                    finalAnswerText = jsonString; 
                    setAnswer(finalAnswerText); 
                    setRecommendedMenus([]); 
                    console.error("AI JSON Parse Error (after regex):", e); 
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
            
            // [FIX 13] ตรวจสอบว่ามี callback (onSpeakEndCallback) หรือไม่
            if (onSpeakEndCallback) { 
                // ถ้ามี = มาจากโหมดเสียงต่อเนื่อง
                speak(finalAnswerText, onSpeakEndCallback); 
            } else if (textFromSpeech) {
                // (บีม) กรณีที่เรียกจาก handleListen (เวอร์ชันเก่า)
                setQuestion(''); 
                speak(finalAnswerText); 
            }
            // (ถ้ามาจากปุ่ม "Ask Barista" ก็ไม่ต้องพูด)
            
            // (ข้อ 14 ไม่ได้เพิ่มการบันทึก chatHistory)
            
            // (บีม) ล้างช่องพิมพ์ ถ้าเป็นการส่งแบบ "พิมพ์"
            if (!textFromSpeech && !onSpeakEndCallback) {
                setQuestion('');
            }
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
                     <textarea 
                        id="question" 
                        value={question} 
                        onChange={(e) => setQuestion(e.target.value)} 
                        className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-400" 
                        rows="3" 
                        placeholder="เช่น กาแฟไม่เปรี้ยว, ชาผลไม้..." 
                        // [FIX 13] ปิดใช้งาน textarea ถ้ากำลังฟัง หรือ อยู่ในโหมดคุยต่อเนื่อง
                        disabled={isLoading || isListening || isContinuousListening} 
                        onKeyDown={(e) => { 
                            // [FIX 13] อัปเดต onKeyDown
                            if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isListening && !isContinuousListening) { 
                                e.preventDefault(); 
                                handleSubmit(null, null); // (บีม) เรียก handleSubmit แบบพิมพ์
                            } 
                        }} 
                    />
                     <div className="mt-3 flex flex-wrap gap-2"> 
                         <button onClick={() => setQuestion("New Menu?")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">New Menu?</button>
                         {/* [FIX 4] ลบปุ่ม "หาแฟนให้หน่อย" */}
                         {/* <button onClick={() => setQuestion("หาแฟนให้หน่อย")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">หาแฟนให้หน่อย</button> */}
                         <button onClick={() => setQuestion("Something sweet")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">Something sweet</button>
                     </div>
                     <div className="mt-4 flex items-center gap-3">
                         <button 
                            onClick={() => handleSubmit(null, null)} // (บีม) เรียก handleSubmit แบบพิมพ์
                            // [FIX 13] ปิดใช้งานปุ่ม Ask ถ้ากำลังฟัง หรือ อยู่ในโหมดคุยต่อเนื่อง
                            disabled={isLoading || !question.trim() || isListening || isContinuousListening || question === "กำลังฟัง..."} 
                            className="w-full bg-[#2c8160] hover:bg-green-900 text-white font-bold py-3 px-8 rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        > 
                            {isLoading ? 'Thinking...' : ' Ask Barista'} 
                        </button>
                         <button 
                            // [FIX 13] เปลี่ยน onClick เป็น toggleContinuousListen
                            onClick={toggleContinuousListen} 
                            // (บีม) ปิดใช้งานปุ่มไมค์ ถ้ากำลังโหลดคำตอบ (จากการพิมพ์)
                            disabled={isLoading && !isContinuousListening} 
                            className={`p-3 rounded-full transition-colors ${
                                // (บีม) ใช้ "isContinuousListening" (ข้อ 13) เป็นตัวหลักในการโชว์สีแดง
                                isContinuousListening ? 'bg-red-600 animate-pulse' 
                                : 'bg-white/20 hover:bg-white/30' // โหมดปกติ
                            } disabled:bg-gray-400 disabled:cursor-not-allowed`} 
                            title={isContinuousListening ? "หยุดคุย" : "เริ่มคุยด้วยเสียง"}
                        > 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 11-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> 
                        </button>
                     </div>
                 </div>

                {/* Recommendation Section (ย้าย Card เข้ามา) */}
                <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg min-h-[100px] mb-8">
                     <div className="flex items-start space-x-4"> 
                         <div className="bg-[#2c8160] rounded-full p-2 flex-shrink-0"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.5a1 1 0 01.7.3l2.4 2.4a1 1 0 01.3.7V8z" /></svg> </div>
                         <div className="w-full"> 
                            <h2 className="text-xl font-bold text-white mb-2">Suggestion:</h2> 
                            {/* (บีม) แก้ไข: แสดง answer (ข้อความ) เฉพาะเมื่อมี */}
                            {answer && <div className="text-white whitespace-pre-wrap prose prose-invert max-w-none">{answer}</div>}
                        </div>
                     </div>
                    
                    {/* (บีม) ย้าย Card เข้ามาไว้ข้างใน (จากครั้งก่อน) */}
                    {Array.isArray(recommendedMenus) && recommendedMenus.length > 0 && (
                        <div className="mt-6 border-t border-white/20 pt-6">
                            {/* (บีม) ซ่อน "Recommend for you:" ถ้ามีแต่รูป */}
                            {/* <h3 className="text-lg font-semibold text-white mb-4">Recommend for you:</h3> */}
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
                        <span className="text-2xl font-extrabold text-[#4A3728]">{totalPrice.toFixed(2)} ฿</span> 
                    </div>
                    <Link href="/basket">
                        {/* [FIX 6] (บีม) ใช้คำให้เหมือนกัน */}
                        <button disabled={!cartItems || cartItems.length === 0} className="mt-5 w-full bg-[#2c8160] hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                            View Cart ({cartItems.length})
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}