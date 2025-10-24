"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// [FIX] 1. Import 'supabase' จากไฟล์ส่วนกลาง
import { supabase } from '../lib/supabaseClient'; 

// [FIX] 2. ลบการสร้าง Client ที่ซ้ำซ้อนทิ้ง
// const supabaseUrl = ...
// const supabaseKey = ...
// const supabase = createClient(...)

export default function ChatPage() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('สวัสดีค่ะ ให้ AI Barista แนะนำเมนูอะไรดีคะ?');
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedMenus, setRecommendedMenus] = useState([]);
    const [allMenuItems, setAllMenuItems] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isListening, setIsListening] = useState(false);
    
    // [FIX] 3. สร้าง "ธง" เพื่อเช็กการโหลดครั้งแรก
    const isInitialMount = useRef(true);

    // --- useEffect Hooks ---
    
    // [1] Effect "โหลด" (ทำงานครั้งเดียว)
    useEffect(() => {
        try {
            // [FIX] อ่านจาก localStorage ก่อนเสมอ
            const savedCart = JSON.parse(localStorage.getItem('myCafeCart') || '[]');
            setCartItems(savedCart);
            console.log("ChatPage: Initial cart loaded:", savedCart); // Log เพิ่มเติม
        } catch (error) {
            console.error("ChatPage: Could not load cart from localStorage", error);
            setCartItems([]);
        }

        const fetchAllMenus = async () => {
            console.log("ChatPage: Attempting to fetch all menu items from Supabase...");
            // [FIX] 4. 'supabase' ถูก import มาจากข้างบนแล้ว
            const { data, error } = await supabase.from('menuItems').select('*');
            if (error) {
                // นี่คือจุดที่ต้องสงสัย ถ้า Supabase Key ผิด Error จะโผล่ที่นี่
                console.error("ChatPage: CRITICAL Error fetching all menu items:", error);
            } else {
                setAllMenuItems(data || []);
                // [DEBUG] นี่คือ Log ที่จะบอกเราว่า "เมนูหลัก" โหลดมาครบหรือไม่
                console.log("ChatPage: All menu items fetched successfully:", data); 
            }
        };
        fetchAllMenus();
        
        // [FIX] ตั้งค่าธงหลังโหลดเสร็จใน Effect แรก
        // ... (existing code) ...
        const timer = setTimeout(() => {
             isInitialMount.current = false;
             console.log("ChatPage: Initial mount flag set to false.");
        }, 50);
       
       return () => clearTimeout(timer);

    }, []); // [] ทำให้ทำงานครั้งเดียว

    // [2] Effect "บันทึก" และ "คำนวณราคา"
    useEffect(() => {
        
        // ... (existing code) ...
        const newTotal = cartItems.reduce((sum, item) => sum + ((item.menuPrice ?? 0) * (item.quantity ?? 0)), 0);
        setTotalPrice(newTotal);
        // ... (existing code) ...

        // [FIX] 6. ตรวจสอบ "ธง" เพื่อ "บันทึก" ลง localStorage
        if (!isInitialMount.current) {
            try { 
                if (Array.isArray(cartItems) && cartItems.length > 0) {
                    localStorage.setItem('myCafeCart', JSON.stringify(cartItems));
                     console.log("ChatPage: Cart saved to localStorage:", cartItems); 
                } else {
                    localStorage.removeItem('myCafeCart');
                    console.log("ChatPage: Cart removed from localStorage."); 
                }
                // [FIX] 7. ส่งสัญญาณบอก Navbar ว่าตะกร้าเปลี่ยนแล้ว
                window.dispatchEvent(new Event('local-storage')); 
                console.log("ChatPage: 'local-storage' event dispatched."); 
            } catch (error) {
                console.error("ChatPage: Failed to save cart to localStorage", error);
            }
        } else {
            console.log("ChatPage: Initial mount, skipping save to localStorage.");
        }
    }, [cartItems]); // [!] ทำงานทุกครั้งที่ cartItems เปลี่ยน

    
    // ... (existing code for Text-to-Speech) ...
    useEffect(() => {
        const speak = (text) => {
             if (typeof window === 'undefined' || !window.speechSynthesis) return; 
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'th-TH';
            utterance.rate = 1.0;
            
            let voices = window.speechSynthesis.getVoices();
             if (voices.length === 0) {
                 window.speechSynthesis.onvoiceschanged = () => {
                     voices = window.speechSynthesis.getVoices();
                     const thaiFemaleVoice = voices.find(voice => voice.lang === 'th-TH' && voice.name.includes('Kanya'));
                     if (thaiFemaleVoice) utterance.voice = thaiFemaleVoice;
                     if (answer === text && !isLoading) window.speechSynthesis.speak(utterance);
                 };
             } else {
                 const thaiFemaleVoice = voices.find(voice => voice.lang === 'th-TH' && voice.name.includes('Kanya'));
                 if (thaiFemaleVoice) utterance.voice = thaiFemaleVoice;
                  window.speechSynthesis.speak(utterance);
             }
        };

        if (answer && answer !== 'สวัสดีค่ะ ให้ AI Barista แนะนำเมนูอะไรดีคะ?' && !isLoading) {
            speak(answer);
        }
        return () => {
             if (typeof window !== 'undefined' && window.speechSynthesis) {
                 window.speechSynthesis.cancel();
                 window.speechSynthesis.onvoiceschanged = null; 
             }
        };
    }, [answer, isLoading]);

    // ... (existing code for Speech-to-Text) ...
    const handleListen = () => {
         if (typeof window === 'undefined') return; 
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("ขออภัยค่ะ เบราว์เซอร์ของคุณไม่รองรับฟังก์ชันสั่งงานด้วยเสียง");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'th-TH';
        recognition.interimResults = false;
        recognition.onstart = () => {
            setIsListening(true);
            setQuestion("กำลังฟัง... พูดได้เลยค่ะ 🎤");
        };
        recognition.onresult = (event) => {
            const speechToText = event.results[0][0].transcript;
            setQuestion(speechToText);
        };
        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setQuestion('');
            alert("เกิดข้อผิดพลาดในการรับเสียง: " + event.error);
        };
        recognition.onend = () => {
            setIsListening(false);
            document.getElementById('question')?.focus();
        };
        recognition.start();
    };
    
    // จัดการตะกร้าสินค้า (นี่คือจุดที่เกิด Error)
    const handleOrderClick = (menuDataFromRec) => {
        if (!menuDataFromRec || typeof menuDataFromRec !== 'object' || !menuDataFromRec.menuId) {
             console.error("ChatPage: Invalid menu data received from AI:", menuDataFromRec);
            alert("เกิดข้อผิดพลาด: ข้อมูลเมนูที่ได้รับจาก AI ไม่ถูกต้อง");
            return;
        }
        console.log("ChatPage: handleOrderClick called with:", menuDataFromRec);
        
        // [DEBUG] ตรวจสอบว่า "เมนูหลัก" มีของหรือไม่
        if (!Array.isArray(allMenuItems) || allMenuItems.length === 0) {
             console.error("ChatPage: allMenuItems is EMPTY. This is the problem!");
             alert("ข้อผิดพลาด: ข้อมูลเมนูหลักยังโหลดไม่เสร็จ (allMenuItems is empty). กรุณาตรวจสอบการเชื่อมต่อ Supabase และรีสตาร์ทเซิร์ฟเวอร์");
             return;
        }
        
        // นี่คือ "ยาม" ที่หาเมนูไม่เจอ
        const menuToAdd = allMenuItems.find(item => String(item.menuId) === String(menuDataFromRec.menuId));
        
        if (menuToAdd) {
             console.log("ChatPage: Found matching menu in allMenuItems:", menuToAdd);
            _updateCart(menuToAdd);
        } else {
             // ถ้าหาไม่เจอ Error จะโผล่ที่นี่
             console.warn("ChatPage: Menu not found in allMenuItems:", menuDataFromRec);
             alert(`ขออภัยค่ะ ไม่พบข้อมูลสำหรับเมนู "${menuDataFromRec.menuName || menuDataFromRec.menuId}" ในระบบ`);
        }
    };
    
    const _updateCart = (menuToAdd) => {
        // ... (existing code) ...
        setCartItems(prevItems => {
             const currentCart = Array.isArray(prevItems) ? prevItems : [];
             console.log("ChatPage: Updating cart. Previous items:", currentCart, "Adding:", menuToAdd);
            const existingItem = currentCart.find(item => item.menuId === menuToAdd.menuId);
            let updatedItems;
            if (existingItem) {
                updatedItems = currentCart.map(item =>
                    item.menuId === menuToAdd.menuId
                        ? { ...item, quantity: (item.quantity ?? 0) + 1 } 
                        : item
                );
            } else {
                 if (!menuToAdd.menuId || !menuToAdd.menuName || typeof menuToAdd.menuPrice !== 'number') {
                      console.error("ChatPage: Invalid menuToAdd data:", menuToAdd);
                      return currentCart; 
                 }
                 updatedItems = [...currentCart, { 
                    menuId: menuToAdd.menuId, 
                    menuName: menuToAdd.menuName, 
                    menuPrice: menuToAdd.menuPrice, 
                    menuImageUrl: menuToAdd.menuImageUrl,
                    quantity: 1 
                 }];
            }
             console.log("ChatPage: Cart updated:", updatedItems);
             return updatedItems;
        });
    };
    
    // [FIX] ฟังก์ชัน handleSubmit ที่เรียก API Route
    const handleSubmit = async () => {
        // ... (existing code) ...
        if (!question.trim() || question === "กำลังฟัง... พูดได้เลยค่ะ 🎤") return;
        
        setIsLoading(true);
        setAnswer("กำลังคิดเมนูให้ค่าสุดหล่อ รอสักครู่น้า ✨");
        setRecommendedMenus([]); 

        let menuContext = "Here is the cafe's menu from the database:\n";
        if (Array.isArray(allMenuItems)) {
            allMenuItems.forEach(item => {
                menuContext += `- ID: ${item.menuId}, Name: ${item.menuName}, Description: ${item.menuDescription}, Price: ${item.menuPrice} baht.\n`;
            });
        }
        
        // [EDIT] แก้ URL ให้ตรงกับตำแหน่งไฟล์ route.js
        const API_ENDPOINT = '/api/chat'; 
        console.log(`ChatPage: Submitting to ${API_ENDPOINT} with question:`, question); 
        
        try {
            // เรียกไปที่ API Route ของเราเอง
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, menuContext }) // ส่งข้อมูลไปให้ Server
            });
             
             const responseBody = await response.text();
             console.log(`ChatPage: Raw response from ${API_ENDPOINT}:`, responseBody);

            if (!response.ok) {
                 try {
                     const errorData = JSON.parse(responseBody);
                     throw new Error(errorData.error || `API call failed with status: ${response.status}`);
                 } catch (parseError) {
                      throw new Error(`API call failed with status: ${response.status}. Response: ${responseBody}`);
                 }
            }

            // ... (existing code for parsing response) ...
            let data;
            try {
                data = JSON.parse(responseBody);
            } catch (e) {
                console.error(`ChatPage: Failed to parse JSON from ${API_ENDPOINT}:`, e, "Raw:", responseBody);
                throw new Error("ไม่สามารถประมวลผลคำตอบจาก Server ได้");
            }
             
            const { responseText } = data;
             console.log(`ChatPage: Parsed responseText from ${API_ENDPOINT}:`, responseText);
            
            if (responseText) {
                const jsonMatch = responseText.trim().match(/^\{[\s\S]*\}$/); 
                if (jsonMatch) {
                    try {
                        const parsedResponse = JSON.parse(jsonMatch[0]);
                         console.log("ChatPage: Parsed AI JSON response:", parsedResponse); 
                        setAnswer(parsedResponse.text || "นี่คือเมนูที่แนะนำค่ะ");
                        setRecommendedMenus(Array.isArray(parsedResponse.recommendations) ? parsedResponse.recommendations : []);
                    } catch (e) {
                         console.error("ChatPage: JSON Parsing Error:", e, "Raw Response:", responseText);
                        setAnswer("ขออภัยค่ะ AI ตอบกลับมาในรูปแบบที่ไม่ถูกต้อง (JSON parse error)");
                         setRecommendedMenus([]);
                    }
                } else {
                    setAnswer(responseText); 
                     setRecommendedMenus([]);
                     console.log("ChatPage: AI response was not JSON.");
                }
            } else {
                setAnswer("ขออภัยค่ะ ไม่ได้รับคำตอบจาก AI");
                 setRecommendedMenus([]);
                 console.warn("ChatPage: No responseText received from API route.");
            }
        } catch (error) {
            console.error("ChatPage: Error submitting question:", error); 
            setAnswer(`เกิดข้อผิดพลาด: ${error.message}`);
             setRecommendedMenus([]); 
        } finally {
            setIsLoading(false);
        }
    };

    // --- ส่วน Return (แก้ไข Vercel Errors แล้ว) ---
    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto p-4 sm:p-8 max-w-5xl">
                {/* ... (existing JSX code) ... */}
                <div className="text-center mb-8">
                    <h1 className="text-[#4A3728] font-bold text-3xl tracking-tight">Barista สำหรับสุดหล่อ</h1>
                    <p className="text-[#4A3728] font-bold">พร้อมแนะนำเมนูโปรดให้สุดหล่อ</p>
                </div>
                <div className="bg-[#4A3728] p-6 rounded-xl mb-8 border-l-4 border-[#4A3728]">
                     <h2 className="text-2xl font-bold text-white mb-2">Today&apos;s Special</h2>
                     <p className="text-white mb-4">&quot;Iced Oat Milk Hazelnut Latte&quot; ความหอมของเฮเซลนัทผสมผสานกับความนุ่มของนมโอ๊ตอย่างลงตัว</p>
                     <button 
                        onClick={() => setQuestion("ขอลอง Iced Oat Milk Hazelnut Latte ครับ")}
                        className="bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-5 rounded-full transition-colors duration-300 text-sm">
                        ถามเกี่ยวกับเมนูนี้
                     </button>
                </div>

                <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg mb-8">
                    <label htmlFor="question" className="block text-white font-bold mb-6">What can I get started for you?</label>
                    <textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        rows="3"
                        placeholder="e.g., I&apos;m looking for a smooth, non-acidic coffee..."
                        disabled={isLoading || isListening}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => setQuestion("มีเมนูอะไรใหม่บ้าง?")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">มีอะไรใหม่?</button>
                        <button onClick={() => setQuestion("แนะนำกาแฟไม่เปรี้ยวหน่อย")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">กาแฟไม่เปรี้ยว</button>
                        <button onClick={() => setQuestion("เครื่องดื่มที่ไม่ใช่กาแฟมีอะไรบ้าง?")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">ไม่ใช่กาแฟ</button>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !question.trim() || isListening}
                            className="w-full bg-green-800 hover:bg-green-900 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-md transform hover:scale-105 disabled:bg-gray-400 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Brewing your answer...' : '✨ Ask Barista'}
                        </button>
                        <button
                            onClick={handleListen}
                            disabled={isLoading || isListening}
                            className={`p-3 rounded-full transition-colors duration-300 ${isListening ? 'bg-red-600 animate-pulse' : 'bg-white/20 hover:bg-white/30'} disabled:bg-gray-400 disabled:cursor-not-allowed`}
                            title="สั่งงานด้วยเสียง"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg min-h-[100px] mb-8">
                    <div className="flex items-start space-x-4">
                         <div className="bg-green-800 rounded-full p-2 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8z" />
                            </svg>
                        </div>
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-white mb-2">Here&apos;s my recommendation:</h2>
                            <div className="text-white whitespace-pre-wrap prose prose-invert">{answer}</div>
                        </div>
                    </div>
                    {/* ... (existing JSX code) ... */}
                    {Array.isArray(recommendedMenus) && recommendedMenus.length > 0 && (
                        <div className="mt-6 border-t border-white/20 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Just for you:</h3>
                            <div className="space-y-3">
                                {recommendedMenus.map((menu, index) => (
                                    <div key={menu.menuId || index} className="bg-white/10 p-4 rounded-lg border border-white/20 flex items-center justify-between transition hover:shadow-md hover:border-green-500">
                                        <div>
                                            <p className="font-bold text-white">{menu.menuName || 'Unknown Menu'}</p>
                                            <p className="text-sm text-gray-300">{typeof menu.menuPrice === 'number' ? `${menu.menuPrice.toFixed(2)} บาท` : 'N/A'}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleOrderClick(menu)} 
                                            disabled={!menu.menuId || !menu.menuName || typeof menu.menuPrice !== 'number'}
                                            className="bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-5 rounded-full transition-colors duration-300 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Your Order</h2>
                    {/* ... (existing JSX code) ... */}
                    {isInitialMount.current ? (
                         <p className="text-center text-gray-300 py-4">กำลังโหลด...</p>
                    ) : Array.isArray(cartItems) && cartItems.length > 0 ? (
                        <>
                            <div className="space-y-3 mb-4">
                                {cartItems.map(item => (
                                    <div key={item.menuId} className="flex justify-between items-center">
                                        <p className="text-white">{item.menuName ?? 'Unknown Item'} <span className="text-sm text-gray-300">x {item.quantity ?? 0}</span></p>
                                        <p className="font-semibold text-white">{((item.menuPrice ?? 0) * (item.quantity ?? 0)).toFixed(2)} บาท</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-white/20 pt-4 flex justify-between items-center">
                                <p className="text-lg font-bold text-white">Total</p>
                                <p className="text-lg font-bold text-white">{totalPrice.toFixed(2)} บาท</p>
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <button onClick={() => document.getElementById('question')?.focus()} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full transition">สั่งเพิ่มกับ AI</button>
                                <Link href="/basket" className="w-full">
                                    <button className="w-full bg-green-800 hover:bg-green-900 text-white font-bold py-3 rounded-full transition">Checkout</button>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-300 py-4">ตะกร้าของคุณยังว่างอยู่</p>
                    )}
                </div>
            </div>
        </div>
    );
}
