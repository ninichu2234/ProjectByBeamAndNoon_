"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
// ‼️ 1. Import Image ‼️
import Image from 'next/image';

export default function ChatPage() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('สวัสดีค่ะ ให้ AI Barista แนะนำเมนูอะไรดีคะ?');
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedMenus, setRecommendedMenus] = useState([]);
    const [allMenuItems, setAllMenuItems] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        try {
            const savedCart = JSON.parse(localStorage.getItem('myCafeCart') || '[]');
            setCartItems(savedCart);
            console.log("ChatPage: Initial cart loaded:", savedCart);
        } catch (error) {
            console.error("ChatPage: Could not load cart from localStorage", error);
            setCartItems([]);
        }

        // ‼️ 2. อัปเกรด fetchAllMenus ให้ดึง URL รูปภาพ ‼️
        const fetchAllMenus = async () => {
            console.log("ChatPage: ==> ENTERING fetchAllMenus function...");
            try {
                console.log("ChatPage: Attempting to fetch all menu items...");

                const { data: menuItems, error, status, statusText } = await supabase
                    .from('menuItems')
                    .select('*');

                console.log("ChatPage: Supabase fetch response:", { data: menuItems, error, status, statusText });

                if (error) throw error;
                if (!menuItems) throw new Error("No data returned from menuItems table.");

                // --- ( Logic สร้าง URL รูปภาพ - เหมือนหน้า menu-page ) ---
                const getFolderName = (category) => {
                    switch (category) {
                        case 'Coffee': return 'Drink';
                        case 'Tea': return 'Drink';
                        case 'Milk': return 'Drink';
                        case 'Refreshers': return 'Drink';
                        case 'Bakery': return 'Bakery';
                        case 'Cake': return 'Bakery';
                        case 'Dessert': return 'Bakery';
                        case 'Other': return 'orther';
                        default: return category;
                    }
                };

                const itemsWithImages = menuItems.map(item => {
                    if (item.menuImage && item.menuCategory) {
                        const folderName = getFolderName(item.menuCategory);
                        const imagePath = `${folderName}/${item.menuImage}`;
                        const { data: imageData } = supabase
                            .storage
                            .from('menu-images')
                            .getPublicUrl(imagePath);
                        // เก็บ publicUrl ไว้ใน object
                        return { ...item, publicImageUrl: imageData.publicUrl };
                    }
                    return item;
                });
                // --- ( จบ Logic สร้าง URL รูปภาพ ) ---

                // เก็บเมนูที่มี URL รูปภาพแล้ว
                setAllMenuItems(itemsWithImages);
                console.log("ChatPage: All menu items fetched successfully (with Image URLs). Data length:", itemsWithImages.length);

                if (itemsWithImages.length === 0) {
                    console.warn("ChatPage: Fetched menu items successfully, but the array is empty...");
                }
            } catch (error) {
                console.error("ChatPage: CRITICAL Supabase Error fetching all menu items:", error.message);
                alert(`เกิดข้อผิดพลาดร้ายแรงในการโหลดเมนูหลัก: ${error.message}`);
                setAllMenuItems([]);
            }
            console.log("ChatPage: <== EXITING fetchAllMenus function.");
        };

        fetchAllMenus();

        // [FIX] ตั้งค่าธงหลังโหลดเสร็จใน Effect แรก
        const timer = setTimeout(() => {
            isInitialMount.current = false;
            console.log("ChatPage: Initial mount flag set to false.");
        }, 150);

        return () => clearTimeout(timer);

    }, []); // [] ทำให้ทำงานครั้งเดียว

    // [2] Effect "บันทึก" และ "คำนวณราคา"
    useEffect(() => {
        const currentCart = Array.isArray(cartItems) ? cartItems : [];
        const newTotal = currentCart.reduce((sum, item) => sum + ((item.menuPrice ?? 0) * (item.quantity ?? 0)), 0);
        setTotalPrice(newTotal);
        console.log("ChatPage: Total price calculated:", newTotal);

        if (!isInitialMount.current) {
            try {
                if (currentCart.length > 0) {
                    localStorage.setItem('myCafeCart', JSON.stringify(currentCart));
                    console.log("ChatPage: Cart saved to localStorage:", currentCart);
                } else {
                    localStorage.removeItem('myCafeCart');
                    console.log("ChatPage: Cart removed from localStorage.");
                }
                window.dispatchEvent(new Event('local-storage'));
                console.log("ChatPage: 'local-storage' event dispatched.");
            } catch (error) {
                console.error("ChatPage: Failed to save cart to localStorage", error);
            }
        } else {
            console.log("ChatPage: Initial mount, skipping save to localStorage.");
        }
    }, [cartItems]);

    // ... (useEffect สำหรับ speak - เหมือนเดิม) ...
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
                    if (answer === text && !isLoading && typeof window !== 'undefined' && window.speechSynthesis) {
                        window.speechSynthesis.speak(utterance);
                    }
                };
            } else {
                const thaiFemaleVoice = voices.find(voice => voice.lang === 'th-TH' && voice.name.includes('Kanya'));
                if (thaiFemaleVoice) utterance.voice = thaiFemaleVoice;
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.speak(utterance);
                }
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

    // ... (handleListen - Speech-to-Text - เหมือนเดิม) ...
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
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setQuestion("กำลังฟัง... พูดได้เลยค่ะ 🎤");
        };

        recognition.onresult = (event) => {
            const speechToText = event.results[0][0].transcript;
            setQuestion(speechToText);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error, event.message);
            setQuestion('');
            let errorMessage = "เกิดข้อผิดพลาดในการรับเสียง: ";
            switch (event.error) {
                case 'no-speech': errorMessage += "ไม่พบเสียงพูด"; break;
                case 'audio-capture': errorMessage += "ไม่สามารถเข้าถึงไมโครโฟนได้"; break;
                case 'not-allowed': errorMessage += "ไม่อนุญาตให้ใช้ไมโครโฟน"; break;
                default: errorMessage += event.message;
            }
            alert(errorMessage);
        };

        recognition.onend = () => {
            setIsListening(false);
            if (!question && document.getElementById('question')) {
                document.getElementById('question').focus();
            } else if (question && question !== "กำลังฟัง... พูดได้เลยค่ะ 🎤") {
                handleSubmit();
            }
        };

        recognition.start();
    };

    // ... (handleOrderClick - เหมือนเดิม) ...
    const handleOrderClick = (menuDataFromRec) => {
        if (!menuDataFromRec || typeof menuDataFromRec !== 'object' || menuDataFromRec.menuId === null || menuDataFromRec.menuId === undefined) {
            console.error("ChatPage: Invalid cleaned menu data in handleOrderClick (missing ID):", menuDataFromRec);
            alert("เกิดข้อผิดพลาด: ข้อมูลเมนูไม่สมบูรณ์ (ไม่มี ID)");
            return;
        }
        console.log("ChatPage: handleOrderClick called with cleaned menu:", menuDataFromRec);

        if (!Array.isArray(allMenuItems) || allMenuItems.length === 0) {
            console.error("ChatPage: allMenuItems is EMPTY. Cannot add item. Check Supabase connection and RLS Policy.");
            alert("ข้อผิดพลาด: ข้อมูลเมนูหลักยังโหลดไม่เสร็จ (allMenuItems is empty). กรุณาตรวจสอบการเชื่อมต่อ Supabase, RLS Policy (ต้องเป็น anon, SELECT, using true) และรีสตาร์ทเซิร์ฟเวอร์");
            return;
        }

        const menuToAdd = allMenuItems.find(item =>
            String(item.menuId) === String(menuDataFromRec.menuId)
        );

        if (menuToAdd) {
            console.log("ChatPage: Found matching menu in allMenuItems:", menuToAdd);
            _updateCart(menuToAdd);
        } else {
            console.warn("ChatPage: Menu ID from AI not found in allMenuItems (this shouldn't happen if fetch was successful):", menuDataFromRec);
            alert(`ขออภัยค่ะ ไม่พบข้อมูลสำหรับเมนู ID "${menuDataFromRec.menuId}" ในรายการเมนูหลักของร้าน`);
        }
    };

    // ‼️ 4. อัปเกรด _updateCart ให้บันทึก URL รูปภาพ ‼️
    const _updateCart = (menuToAdd) => {
        setCartItems(prevItems => {
            const currentCart = Array.isArray(prevItems) ? prevItems : [];
            console.log("ChatPage: Updating cart. Previous items:", currentCart, "Adding:", menuToAdd);

            if (!menuToAdd || typeof menuToAdd !== 'object' || menuToAdd.menuId === null || menuToAdd.menuId === undefined || !menuToAdd.menuName || typeof menuToAdd.menuPrice !== 'number') {
                console.error("ChatPage: Invalid menuToAdd data passed to _updateCart:", menuToAdd);
                alert("เกิดข้อผิดพลาดภายใน: ข้อมูลเมนูที่จะเพิ่มลงตะกร้าไม่สมบูรณ์");
                return currentCart;
            }

            const existingItemIndex = currentCart.findIndex(item => item.menuId === menuToAdd.menuId);

            let updatedItems;
            if (existingItemIndex > -1) {
                updatedItems = [...currentCart];
                const currentQuantity = updatedItems[existingItemIndex].quantity ?? 0;
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    // อัปเดตข้อมูลเมนู (เผื่อมีการเปลี่ยนแปลง) และบวก quantity
                    ...menuToAdd,
                    quantity: currentQuantity + 1
                };
                console.log(`ChatPage: Increased quantity for menuId ${menuToAdd.menuId}`);
            } else {
                // ส่ง ...menuToAdd ทั้งก้อน (ที่มี publicImageUrl) เข้าไป
                const newItem = {
                    ...menuToAdd,
                    quantity: 1
                };
                updatedItems = [...currentCart, newItem];
                console.log(`ChatPage: Added new item to cart:`, newItem);
            }
            console.log("ChatPage: Cart updated state:", updatedItems);
            return updatedItems;
        });
    };

    // ‼️ 3. อัปเกรด handleSubmit ให้ค้นหา URL รูปภาพ ‼️
    const handleSubmit = async (textFromSpeech = null) => {
        const currentQuestion = textFromSpeech || question;

        if (!currentQuestion.trim() || currentQuestion === "กำลังฟัง... พูดได้เลยค่ะ 🎤") {
            if (!textFromSpeech && document.getElementById('question')) {
                document.getElementById('question').focus();
            }
            return;
        }

        setIsLoading(true);
        setAnswer("กำลังคิดเมนูให้ค่าสุดหล่อ รอสักครู่น้า ✨");
        setRecommendedMenus([]);

        // สร้าง menuContext จาก allMenuItems (ที่มี publicImageUrl)
        let menuContext = "Here is the cafe's menu from the database:\n";
        if (Array.isArray(allMenuItems) && allMenuItems.length > 0) {
            allMenuItems.forEach(item => {
                // ‼️ ส่ง ImageURL (publicImageUrl) ไปให้ AI ด้วย ‼️
                menuContext += `- ID: ${item.menuId}, Name: ${item.menuName}, Price: ${item.menuPrice} baht.${item.menuDescription ? ` Desc: ${item.menuDescription}` : ''}${item.publicImageUrl ? ` ImageURL: ${item.publicImageUrl}` : ''}\n`;
            });
        } else {
            console.warn("ChatPage: handleSubmit - allMenuItems is empty! AI will lack menu context.");
            menuContext += "- No menu items loaded from database. Please inform the user if asked about the menu.\n";
        }

        const API_ENDPOINT = '/api/chat';
        console.log(`ChatPage: Submitting to ${API_ENDPOINT} with question: "${currentQuestion}"`);

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: currentQuestion, menuContext })
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

            let data;
            try {
                data = JSON.parse(responseBody);
            } catch (e) {
                console.error(`ChatPage: Failed to parse JSON from ${API_ENDPOINT} response body:`, e, "Raw Body:", responseBody);
                throw new Error("ไม่สามารถประมวลผลคำตอบจาก Server ได้ (Invalid JSON format)");
            }

            const { responseText } = data;
            console.log(`ChatPage: Parsed responseText from ${API_ENDPOINT}:`, responseText);

            if (responseText) {
                const jsonMatch = responseText.trim().match(/^\{[\s\S]*\}$/);
                if (jsonMatch) {
                    try {
                        const parsedAIResponse = JSON.parse(jsonMatch[0]);
                        console.log("ChatPage: Parsed AI JSON response:", parsedAIResponse);

                        setAnswer(parsedAIResponse.text || "นี่คือเมนูที่แนะนำค่ะ (แต่ไม่มีข้อความ)");

                        let cleanRecommendations = [];
                        if (Array.isArray(parsedAIResponse.recommendations)) {
                            // ‼️ นี่คือส่วนที่แก้ไข ‼️
                            // เราจะ "ค้นหา" เมนูฉบับเต็มจาก allMenuItems
                            cleanRecommendations = parsedAIResponse.recommendations
                                .map(menu => {
                                    if (!menu || typeof menu !== 'object') return null;
                                    // หา ID ที่ AI ส่งมา
                                    const recommendedId = menu.menuId ?? menu.item_id ?? null;
                                    if (recommendedId === null) return null;

                                    // ค้นหาเมนูฉบับเต็ม (ที่มี publicImageUrl) จาก allMenuItems
                                    const fullMenuItem = allMenuItems.find(item =>
                                        String(item.menuId) === String(recommendedId)
                                    );

                                    if (fullMenuItem) {
                                        // ถ้าเจอ ให้ส่งเมนูฉบับเต็มกลับไป
                                        return fullMenuItem;
                                    } else {
                                        // ถ้าไม่เจอ (ซึ่งไม่ควรเกิด) ให้ส่งข้อมูลเท่าที่ AI มีมา
                                        console.warn(`ChatPage: AI recommended menuId ${recommendedId} but it was not found in allMenuItems.`);
                                        const cleanedMenu = {
                                            menuId: recommendedId,
                                            menuName: menu.menuName ?? menu.name ?? 'Unknown Menu',
                                            menuPrice: typeof (menu.menuPrice ?? menu.price) === 'number' ? (menu.menuPrice ?? menu.price) : null,
                                            publicImageUrl: null // ไม่มีรูป
                                        };
                                        return cleanedMenu;
                                    }
                                })
                                .filter(menu => menu !== null); // กรองอันที่หาไม่เจอจริงๆ ออก
                        }

                        // เก็บข้อมูล recommendations (ที่มี publicImageUrl) แล้วเข้า State
                        setRecommendedMenus(cleanRecommendations);
                        console.log("ChatPage: Set cleaned recommendations (with full data):", cleanRecommendations);
                    } catch (e) {
                        console.error("ChatPage: AI JSON Parsing Error:", e, "Raw AI Response:", responseText);
                        setAnswer("ขออภัยค่ะ AI ตอบกลับมาในรูปแบบ JSON ที่ไม่ถูกต้อง");
                        setRecommendedMenus([]);
                    }
                } else {
                    setAnswer(responseText);
                    setRecommendedMenus([]);
                    console.log("ChatPage: AI response was not JSON format.");
                }
            } else {
                if (data?.error) {
                    setAnswer(`เกิดข้อผิดพลาดจาก Server: ${data.error}`);
                } else {
                    setAnswer("ขออภัยค่ะ ไม่ได้รับคำตอบ (responseText) จาก Server");
                }
                setRecommendedMenus([]);
                console.warn("ChatPage: No responseText received from API route:", data);
            }
        } catch (error) {
            console.error("ChatPage: Error in handleSubmit:", error);
            setAnswer(`เกิดข้อผิดพลาดในการสื่อสารกับ AI: ${error.message}`);
            setRecommendedMenus([]);
        } finally {
            setIsLoading(false);
            if (textFromSpeech) {
                setQuestion('');
            }
        }
    };

    // --- ส่วน Return (UI) ---
    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto p-4 sm:p-8 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-[#4A3728] font-bold text-3xl tracking-tight">Barista สำหรับสุดหล่อ</h1>
                    <p className="text-[#4A3728] font-bold">พร้อมแนะนำเมนูโปรดให้สุดหล่อ</p>
                </div>
                {/* Today's Special */}
                <div className="bg-[#4A3728] p-6 rounded-xl mb-8 border-l-4 border-[#4A3728]">
                    <h2 className="text-2xl font-bold text-white mb-2">Today&apos;s Special</h2>
                    <p className="text-white mb-4">&quot;Iced Oat Milk Hazelnut Latte&quot; ความหอมของเฮเซลนัทผสมผสานกับความนุ่มของนมโอ๊ตอย่างลงตัว</p>
                    <button
                        onClick={() => setQuestion("ขอลอง Iced Oat Milk Hazelnut Latte ครับ")}
                        className="bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-5 rounded-full transition-colors duration-300 text-sm">
                        ถามเกี่ยวกับเมนูนี้
                    </button>
                </div>

                {/* Input Section */}
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isListening) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    {/* Quick Buttons */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => setQuestion("มีเมนูอะไรใหม่บ้าง?")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">มีอะไรใหม่?</button>
                        <button onClick={() => setQuestion("แนะนำกาแฟไม่เปรี้ยวหน่อย")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">กาแฟไม่เปรี้ยว</button>
                        <button onClick={() => setQuestion("เครื่องดื่มที่ไม่ใช่กาแฟมีอะไรบ้าง?")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">ไม่ใช่กาแฟ</button>
                    </div>
                    {/* Submit and Listen Buttons */}
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            onClick={() => handleSubmit()}
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
                            {/* Microphone Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Recommendation Section */}
                <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg min-h-[100px] mb-8">
                    {/* AI Answer Display */}
                    <div className="flex items-start space-x-4">
                        <div className="bg-green-800 rounded-full p-2 flex-shrink-0">
                            {/* Chat Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8z" />
                            </svg>
                        </div>
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-white mb-2">Here&apos;s my recommendation:</h2>
                            {/* แสดงข้อความคำตอบ (อาจมี Markdown ถ้า AI ใส่มา) */}
                            <div className="text-white whitespace-pre-wrap prose prose-invert">{answer}</div>
                        </div>
                    </div>
                    {/* Display Recommended Menus */}
                    {/* ตรวจสอบ recommendedMenus ก่อน map */}
                    {Array.isArray(recommendedMenus) && recommendedMenus.length > 0 && (
                        <div className="mt-6 border-t border-white/20 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Just for you:</h3>
                            <div className="space-y-3">
                                {recommendedMenus.map((menu, index) => (
                                    // ‼️ 5. แสดงผลรูปภาพ ‼️
                                    <div key={menu.menuId || index} className="bg-white/10 p-4 rounded-lg border border-white/20 flex items-center justify-between transition hover:shadow-md hover:border-green-500">
                                        {/* ‼️ สร้าง Container สี่เหลี่ยมจัตุรัสสำหรับรูปภาพ ‼️ */}
                                        <div className="w-20 h-20 rounded-full overflow-hidden mr-4 flex-shrink-0">
                                            <Image
                                                src={menu.publicImageUrl || 'https://placehold.co/100x100/FFF/333?text=No+Image'}
                                                alt={menu.menuName || 'Menu Image'}
                                                width={80} // ขนาดเท่า Container
                                                height={80}
                                                // ‼️ ใช้ object-cover เพื่อให้รูปเต็มกรอบ ‼️
                                                className="w-full h-full object-cover"
                                                unoptimized={true} // ยังคงไว้เผื่อกรณี SVG
                                            />
                                        </div>

                                        {/* ส่วนของข้อมูลเมนู (เพิ่ม flex-1) */}
                                        <div className="flex-1">
                                            <p className="font-bold text-white">{menu.menuName || 'Unknown Menu'}</p>
                                            <p className="text-sm text-gray-300">{typeof menu.menuPrice === 'number' ? `${menu.menuPrice.toFixed(2)} บาท` : 'Price unavailable'}</p>
                                        </div>

                                        {/* ปุ่ม Add (เพิ่ม flex-shrink-0) */}
                                        <div className="flex-shrink-0">
                                            <button
                                                onClick={() => handleOrderClick(menu)}
                                                disabled={!menu.menuId || !menu.menuName || typeof menu.menuPrice !== 'number'}
                                                className="bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-5 rounded-full transition-colors duration-300 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Cart Summary Section */}
                <div className="bg-[#F0EBE3] p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-[#4A3728] mb-4">Your Order</h2>
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                        {/* ตรวจสอบ cartItems ก่อน map */}
                        {Array.isArray(cartItems) && cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <div key={item.menuId} className="flex justify-between items-center text-[#4A3728]">
                                    <p className="font-medium">{item.menuName} x {item.quantity}</p>
                                    <p className="font-bold">{(item.menuPrice * item.quantity).toFixed(2)} ฿</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">Your cart is empty.</p>
                        )}
                    </div>
                    <div className="border-t-2 border-[#4A3728] pt-4 flex justify-between items-center">
                        <span className="text-xl font-bold text-[#4A3728]">Total:</span>
                        <span className="text-2xl font-extrabold text-[#4A3728]">{totalPrice.toFixed(2)} ฿</span>
                    </div>
                    <Link href="/basket">
                        <button
                            disabled={!cartItems || cartItems.length === 0}
                            className="mt-5 w-full bg-[#4A3728] hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-md transform hover:scale-105 disabled:bg-gray-400 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
                        >
                            Proceed to Checkout
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

