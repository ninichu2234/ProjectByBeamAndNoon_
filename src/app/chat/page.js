"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// ‼️ [FIX PATH] แก้ไข Path ไปยัง supabaseClient
import { supabase } from '../lib/supabaseClient'; 
import Image from 'next/image';

// ‼️ [CHANGED] 1. Import Component ใหม่ (ลบ Modal ออก) ‼️
import RecommendedMenuCard from '../../component/RecommendedMenuCard'; 
import { v4 as uuidv4 } from 'uuid'; 

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

    // ‼️ [REMOVED] 2. ไม่ต้องใช้ State ของ Modal แล้ว ‼️
    // const [selectedMenu, setSelectedMenu] = useState(null); 

    useEffect(() => {
        try {
            const savedCart = JSON.parse(localStorage.getItem('myCafeCart') || '[]');
            setCartItems(savedCart);
            console.log("ChatPage: Initial cart loaded:", savedCart);
        } catch (error) {
            console.error("ChatPage: Could not load cart from localStorage", error);
            setCartItems([]);
        }

        const fetchAllMenus = async () => {
            // (โค้ด fetchAllMenus... เหมือนเดิม)
            try {
                const { data: menuItems, error } = await supabase
                    .from('menuItems')
                    .select('*');
                if (error) throw error;
                if (!menuItems) throw new Error("No data returned from menuItems table.");

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
                        return { ...item, publicImageUrl: imageData.publicUrl };
                    }
                    return item;
                });
                setAllMenuItems(itemsWithImages);
            } catch (error) {
                console.error("ChatPage: CRITICAL Supabase Error fetching all menu items:", error.message);
                setAllMenuItems([]);
            }
        };

        fetchAllMenus();
        isInitialMount.current = false;
        
    }, []); 

    useEffect(() => {
        // (โค้ด useEffect [cartItems]... เหมือนเดิม)
        const currentCart = Array.isArray(cartItems) ? cartItems : [];
        const newTotal = currentCart.reduce((sum, item) => {
            if (item.finalPrice) {
                return sum + (item.finalPrice * (item.quantity ?? 0));
            }
            return sum + ((item.menuPrice ?? 0) * (item.quantity ?? 0));
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
            } catch (error) {
                console.error("ChatPage: Failed to save cart to localStorage", error);
            }
        }
    }, [cartItems]);

    useEffect(() => {
        // (โค้ด useEffect [answer, isLoading]... เหมือนเดิม)
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

    const handleListen = () => {
        // (โค้ด handleListen... เหมือนเดิม)
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
            console.log("ChatPage: Speech recognized:", speechToText);
            handleSubmit(speechToText); 
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
            if (question === "กำลังฟัง... พูดได้เลยค่ะ 🎤") {
                setQuestion(''); 
            }
            console.log("ChatPage: Speech recognition ended.");
        };

        recognition.start();
    };

    // ‼️ [REMOVED] 3. ลบ handleAddClick (เพราะ Component ใหม่จะจัดการเอง) ‼️
    // const handleAddClick = (menuDataFromRec) => { ... };

    // ‼️ [SAME] 4. ฟังก์ชัน _updateCart (เหมือนเดิม) ‼️
    // (ฟังก์ชันนี้จะถูกเรียกจาก RecommendedMenuCard)
    const _updateCart = (itemToAddFromCard) => {
        setCartItems(prevItems => {
            const currentCart = Array.isArray(prevItems) ? prevItems : [];
            console.log("ChatPage: Updating cart. Adding:", itemToAddFromCard);

            if (!itemToAddFromCard || typeof itemToAddFromCard !== 'object' || itemToAddFromCard.menuId === null || itemToAddFromCard.menuId === undefined) {
                console.error("ChatPage: Invalid itemToAddFromCard data:", itemToAddFromCard);
                return currentCart;
            }

            const newItem = {
                ...itemToAddFromCard,
                cartItemId: uuidv4(), // สร้าง ID ใหม่เสมอ
                quantity: 1 
            };
            
            const updatedItems = [...currentCart, newItem];
            console.log(`ChatPage: Added new item to cart with cartItemId: ${newItem.cartItemId}`, newItem);
            console.log("ChatPage: Cart updated state:", updatedItems);
            return updatedItems;
        });
    };
    
    const handleSubmit = async (textFromSpeech = null) => {
        // (โค้ด handleSubmit... เหมือนเดิม)
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

        let menuContext = "Here is the cafe's menu from the database:\n";
        if (Array.isArray(allMenuItems) && allMenuItems.length > 0) {
            allMenuItems.forEach(item => {
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
            if (!response.ok) throw new Error(`API call failed with status: ${response.status}. Response: ${responseBody}`);

            let data;
            try {
                data = JSON.parse(responseBody);
            } catch (e) {
                throw new Error("ไม่สามารถประมวลผลคำตอบจาก Server ได้ (Invalid JSON format)");
            }

            const { responseText } = data;
            if (responseText) {
                const jsonMatch = responseText.trim().match(/^\{[\s\S]*\}$/);
                if (jsonMatch) {
                    try {
                        const parsedAIResponse = JSON.parse(jsonMatch[0]);
                        setAnswer(parsedAIResponse.text || "นี่คือเมนูที่แนะนำค่ะ (แต่ไม่มีข้อความ)");

                        let cleanRecommendations = [];
                        if (Array.isArray(parsedAIResponse.recommendations)) {
                            cleanRecommendations = parsedAIResponse.recommendations
                                .map(menu => {
                                    if (!menu || typeof menu !== 'object') return null;
                                    const recommendedId = menu.menuId ?? menu.item_id ?? null;
                                    if (recommendedId === null) return null;

                                    const fullMenuItem = allMenuItems.find(item =>
                                        String(item.menuId) === String(recommendedId)
                                    );

                                    if (fullMenuItem) {
                                        return fullMenuItem;
                                    } else {
                                        return {
                                            menuId: recommendedId,
                                            menuName: menu.menuName ?? menu.name ?? 'Unknown Menu',
                                            menuPrice: typeof (menu.menuPrice ?? menu.price) === 'number' ? (menu.menuPrice ?? menu.price) : null,
                                            publicImageUrl: null 
                                        };
                                    }
                                })
                                .filter(menu => menu !== null); 
                        }
                        setRecommendedMenus(cleanRecommendations);
                    } catch (e) {
                        setAnswer("ขออภัยค่ะ AI ตอบกลับมาในรูปแบบ JSON ที่ไม่ถูกต้อง");
                        setRecommendedMenus([]);
                    }
                } else {
                    setAnswer(responseText);
                    setRecommendedMenus([]);
                }
            } else {
                setAnswer(data?.error || "ขออภัยค่ะ ไม่ได้รับคำตอบ (responseText) จาก Server");
                setRecommendedMenus([]);
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

    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto p-4 sm:p-8 max-w-5xl">
                 {/* (Header, Today's Special, Input Section - เหมือนเดิม) */}
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isListening) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => setQuestion("มีเมนูอะไรใหม่บ้าง?")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">มีอะไรใหม่?</button>
                        <button onClick={() => setQuestion("แนะนำกาแฟไม่เปรี้ยวหน่อย")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">กาแฟไม่เปรี้ยว</button>
                        <button onClick={() => setQuestion("เครื่องดื่มที่ไม่ใช่กาแฟมีอะไรบ้าง?")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">ไม่ใช่กาแฟ</button>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            onClick={() => handleSubmit()}
                            disabled={isLoading || !question.trim() || isListening || question === "กำลังฟัง... พูดได้เลยค่ะ 🎤"}
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
                    {/* (AI Answer Display - เหมือนเดิม) */}
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
                    
                    {/* ‼️ [CHANGED] 5. เปลี่ยนมาใช้ Component ใหม่ ‼️ */}
                    {Array.isArray(recommendedMenus) && recommendedMenus.length > 0 && (
                        <div className="mt-6 border-t border-white/20 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Just for you:</h3>
                            <div className="space-y-3">
                                {recommendedMenus.map((menu) => (
                                    <RecommendedMenuCard 
                                        key={menu.menuId}
                                        menu={menu}
                                        onAddToCart={_updateCart} // ส่งฟังก์ชัน _updateCart ไปให้
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* (Cart Summary - เหมือนเดิม) */}
                <div className="bg-[#F0EBE3] p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-[#4A3728] mb-4">Your Order</h2>
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                        {Array.isArray(cartItems) && cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <div key={item.cartItemId} className="flex justify-between items-center text-[#4A3728]">
                                    <div className="font-medium">
                                        {item.menuName} x {item.quantity}
                                        {item.customizations?.selectedOptions && item.customizations.selectedOptions.map(opt => (
                                            <p key={opt.optionId} className="text-xs text-gray-600 ml-2">
                                                - {opt.groupName}: {opt.optionName} {opt.priceAdjustment > 0 ? `(+${opt.priceAdjustment}฿)` : ''}
                                            </p>
                                        ))}
                                    </div>
                                    <p className="font-bold">{(item.finalPrice * item.quantity).toFixed(2)} ฿</p>
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

            {/* ‼️ [REMOVED] 6. ลบ Modal ออก ‼️ */}
            {/* <MenuOptionsModal ... /> */}
        </div>
    );
}