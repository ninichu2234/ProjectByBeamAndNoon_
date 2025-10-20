"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';


// --- ใส่ข้อมูล Supabase ของคุณ ---
const supabaseUrl = 'https://rcrntadwwvhyojmjrmzh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcm50YWR3d3ZoeW9qbWpybXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjU2MzAsImV4cCI6MjA3Mzc0MTYzMH0.sMK4cdz4iB95ZycKg3srZQZm_orBEq45az5pkObPGnA';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ChatPage() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('สวัสดีค่ะ ให้ AI Barista แนะนำเมนูอะไรดีคะ?');
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedMenus, setRecommendedMenus] = useState([]);
    const [allMenuItems, setAllMenuItems] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    //const [isListening, setIsListening] = useState(false);
    // --- useEffect Hooks ---
    useEffect(() => {
        try {
            const savedCart = JSON.parse(localStorage.getItem('myCafeCart') || '[]');
            setCartItems(savedCart);
        } catch (error) {
            console.error("Could not load cart from localStorage", error);
            setCartItems([]);
        }

        const fetchAllMenus = async () => {
            const { data, error } = await supabase.from('menuItems').select('*');
            if (error) {
                console.error("Error fetching all menu items:", error);
            } else {
                setAllMenuItems(data || []);
                console.log("เมนูทั้งหมดถูกโหลดเรียบร้อยแล้ว:", data);
            }
        };

        fetchAllMenus();
    }, []);

    useEffect(() => {
        const newTotal = cartItems.reduce((sum, item) => sum + (item.menuPrice * item.quantity), 0);
        setTotalPrice(newTotal);

        if (cartItems.length > 0) {
            localStorage.setItem('myCafeCart', JSON.stringify(cartItems));
            console.log("ตะกร้าถูกบันทึก LocalStorage แล้ว:", cartItems);
        } else {
            localStorage.removeItem('myCafeCart');
        }
        window.dispatchEvent(new Event('local-storage'));
    }, [cartItems]);

   /* useEffect(() => {
        // ฟังก์ชันสำหรับสั่งให้อ่านออกเสียง
        const speak = (text) => {
            // หยุดการพูดก่อนหน้า (ถ้ามี)
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'th-TH'; // ตั้งค่าภาษาไทย
            utterance.rate = 1.0; // ความเร็วในการพูด (ปกติ = 1)

            // ลองหาเสียงผู้หญิงไทย ถ้ามีให้ใช้เสียงนั้น
            const voices = window.speechSynthesis.getVoices();
            const thaiFemaleVoice = voices.find(voice => voice.lang === 'th-TH' && voice.name.includes('Kanya'));
            if (thaiFemaleVoice) {
                utterance.voice = thaiFemaleVoice;
            }

            window.speechSynthesis.speak(utterance);
        };

        // เงื่อนไข: ต้องมีคำตอบ, ไม่ใช่ค่าเริ่มต้น และไม่ได้กำลังโหลด
        if (answer && answer !== '... คำตอบจะแสดงที่นี่ ...' && !isLoading) {
            speak(answer);
        }

        // Cleanup function: หยุดพูดเมื่อ component ถูก unmount
        return () => {
            window.speechSynthesis.cancel();
        };
    }, [answer, isLoading]); // ให้ useEffect ทำงานใหม่ทุกครั้งที่ answer หรือ isLoading เปลี่ยน
    // --- ฟังก์ชันจัดการตะกร้า (แก้ไขแล้ว) --- */


    const handleOrderClick = (menuDataFromRec) => {
        console.log("--- เริ่มกระบวนการเพิ่มสินค้า ---");
        console.log("1. ข้อมูลที่ได้รับจาก AI:", menuDataFromRec);
        console.log("2. เมนูทั้งหมดที่มีในระบบ:", allMenuItems);

        if (!menuDataFromRec.menuId) {
            console.error("ข้อผิดพลาด: AI ไม่ได้ส่ง menuId กลับมา!", menuDataFromRec);
            alert("เกิดข้อผิดพลาด: AI ไม่ได้ส่ง ID ของเมนูกลับมา");
            return;
        }

        const menuToAdd = allMenuItems.find(item => 
            // เปรียบเทียบแบบแปลงเป็นข้อความเพื่อความแน่นอน
            String(item.menuId) === String(menuDataFromRec.menuId)
        );
        
        console.log("3. ผลลัพธ์การค้นหาเมนูในระบบ:", menuToAdd);

        if (menuToAdd) {
            _updateCart(menuToAdd);
            
        } else {
            alert(`ขออภัยค่ะ ไม่พบข้อมูลสำหรับเมนู ID: "${menuDataFromRec.menuId}" ในระบบ`);
        }
    };
    
    const _updateCart = (menuToAdd) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.menuId === menuToAdd.menuId);
            if (existingItem) {
                return prevItems.map(item =>
                    item.menuId === menuToAdd.menuId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevItems, { ...menuToAdd, quantity: 1 }];
            }
        });
    };

    // [เพิ่ม] ฟังก์ชันสำหรับปุ่ม Checkout
    const handleCheckout = () => {
        // ฟังก์ชันนี้จะถูกเรียกเมื่อกดปุ่ม Checkout
        // ในทางเทคนิคแล้ว เราไม่จำเป็นต้องทำอะไรในนี้เลย
        // เพราะ useEffect คอยบันทึกข้อมูลตะกร้าล่าสุดให้เราโดยอัตโนมัติอยู่แล้ว
        // แต่เราสามารถใส่ console.log ไว้เพื่อยืนยันการทำงานได้
        
    };

    // --- ฟังก์ชันส่งคำถามหา AI (แก้ไขแล้ว) ---
    const handleSubmit = async () => {
        if (!question.trim()) {
            return;
        }
        setIsLoading(true);
        setAnswer("กำลังคิดมนูให้ค่าสุดหล่อ รอสักครู่น้า ✨");
        setRecommendedMenus([]);

        const { data: menuItems, error: supabaseError } = await supabase
            .from('menuItems')
            .select('*')
            .order('menuId', { ascending: true });

        if (supabaseError) {
            setAnswer("เกิดข้อผิดพลาดในการดึงข้อมูลเมนู: " + supabaseError.message);
            setIsLoading(false);
            return;
        };


//TextToSpeech
/*const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("ขออภัยค่ะ เบราว์เซอร์ของคุณไม่รองรับฟังก์ชันสั่งงานด้วยเสียง");
        return;
    } 

    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH'; // ตั้งค่าภาษาเป็นไทย
    recognition.interimResults = false; // รอให้พูดจบประโยคก่อนค่อยแสดงผล

    recognition.onstart = () => {
        setIsListening(true);
        setQuestion("กำลังฟัง... พูดได้เลยค่ะ 🎤");
    };

    recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setQuestion(speechToText); // นำข้อความที่ได้ไปใส่ใน State
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        alert("เกิดข้อผิดพลาดในการรับเสียง: " + event.error);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognition.start(); // เริ่มการทำงาน
}; */
    

//AI
        setAllMenuItems(menuItems || []);

        let menuContext = "Here is the cafe's menu from the database:\n";
        menuItems.forEach(item => {
            menuContext += `- ID: ${item.menuId}, Name: ${item.menuName}, Description: ${item.menuDescription}, Price: ${item.menuPrice} baht.\n`;
        });

        const API_KEY = 'AIzaSyBKc_6DmN-5YZWtnKqRzjGCdqb7txWsv3I';
        const MODEL_NAME = 'gemini-2.5-pro';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
        
        const promptText = `
            You are a helpful cafe assistant. Your task is to answer the user's question based on the menu.
            ALWAYS respond in a valid JSON format.

            The JSON object MUST contain two keys:
            1. "text": A friendly, conversational string answering the user's question in Thai.
            2. "recommendations": An array of menu objects that you are specifically recommending. Each object must have "menuId", "menuName", and "menuPrice".

            Here is an EXAMPLE of a perfect response format:
            {
                "text": "แน่นอนค่ะ สำหรับกาแฟที่ไม่เปรี้ยว ทางร้านแนะนำเป็นพิเศษ 2 ตัวนี้เลยค่ะ มีความหอมนุ่มและกลมกล่อมมากค่ะ",
                "recommendations": [
                    { "menuId": 1, "menuName": "Latte (Iced)", "menuPrice": 75 },
                    { "menuId": 5, "menuName": "Caramel Macchiato", "menuPrice": 85 }
                ]
            }

            Now, use the following information to generate a response in the same JSON format.
            Menu from Database: ${menuContext}
            User's question: "${question}"
        `;

        const requestBody = { contents: [{ parts: [{ text: promptText }] }] };
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) throw new Error(`API returned status: ${response.status}`);
            const data = await response.json();
            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (responseText) {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const parsedResponse = JSON.parse(jsonMatch[0]);
                        console.log("AI ตอบกลับมาว่า:", parsedResponse);
                        setAnswer(parsedResponse.text || "นี่คือเมนูที่แนะนำค่ะ");
                        setRecommendedMenus(parsedResponse.recommendations || []);
                    } catch (e) {
                        setAnswer("ขออภัยค่ะ AI ตอบกลับมาในรูปแบบที่ไม่ถูกต้อง");
                    }
                } else {
                    setAnswer(responseText);
                }
            } else {
                setAnswer("ขออภัยค่ะ ไม่ได้รับคำตอบจาก AI");
            }
        } catch (error) {
            setAnswer("เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI ค่ะ กรุณาตรวจสอบ API Key");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto p-4 sm:p-8 max-w-5xl">
                {/* ส่วนหัว */}
                <div className="text-center mb-8">
                    <h1 className="text-[#4A3728] font-bold text-3xl tracking-tight">Barista สำหรับสุดหล่อ</h1>
                    <p className="text-[#4A3728] font-bold">พร้อมแนะนำเมนูโปรดให้สุดหล่อ</p>
                </div>

                {/* ส่วนโปรโมชั่น */}
                <div className="bg-[#4A3728] p-6 rounded-xl mb-8 border-l-4 border-[#4A3728]">
                     <h2 className="text-2xl font-bold text-white mb-2">Today's Special</h2>
                     <p className="text-white mb-4">ลองเมนูใหม่ล่าสุดของเรา! "Iced Oat Milk Hazelnut Latte" ความหอมของเฮเซลนัทผสมผสานกับความนุ่มของนมโอ๊ตอย่างลงตัว</p>
                     <button 
                        onClick={() => setQuestion("ขอลอง Iced Oat Milk Hazelnut Latte ครับ")}
                        className="bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-5 rounded-full transition-colors duration-300 text-sm">
                        ถามเกี่ยวกับเมนูนี้
                     </button>
                </div>

                {/* กล่องสำหรับพิมพ์คำถาม */}
                <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg mb-8">
                    <label htmlFor="question" className="block text-white font-bold mb-6">What can I get started for you?</label>
                    <textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        rows="3"
                        placeholder="e.g., I'm looking for a smooth, non-acidic coffee..."
                        disabled={isLoading}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => setQuestion("มีเมนูอะไรใหม่บ้าง?")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">มีอะไรใหม่?</button>
                        <button onClick={() => setQuestion("แนะนำกาแฟไม่เปรี้ยวหน่อย")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">หวนคืนสู่วานร</button>
                        <button onClick={() => setQuestion("เครื่องดื่มที่ไม่ใช่กาแฟมีอะไรบ้าง?")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">wokovjv</button>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !question.trim()}
                            className="w-full bg-green-800 hover:bg-green-900 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-md transform hover:scale-105 disabled:bg-gray-400 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Brewing your answer...' : '✨ Ask Barista'}
                        </button>
                    </div>
                </div>

                {/* กล่องแสดงคำตอบจาก AI */}
                <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg min-h-[100px] mb-8">
                    <div className="flex items-start space-x-4">
                        <div className="bg-green-800 rounded-full p-2 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8z" />
                            </svg>
                        </div>
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-white mb-2">Here's my recommendation:</h2>
                            <div className="text-white whitespace-pre-wrap prose prose-invert">{answer}</div>
                        </div>
                    </div>
                    {recommendedMenus.length > 0 && (
                        <div className="mt-6 border-t border-white/20 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Just for you:</h3>
                            <div className="space-y-3">
                                {recommendedMenus.map((menu, index) => (
                                    <div key={index} className="bg-white/10 p-4 rounded-lg border border-white/20 flex items-center justify-between transition hover:shadow-md hover:border-green-500">
                                        <div>
                                            <p className="font-bold text-white">{menu.menuName}</p>
                                            <p className="text-sm text-gray-300">{menu.menuPrice} บาท</p>
                                        </div>
                                        <button
                                            onClick={() => handleOrderClick(menu)}
                                            className="bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-5 rounded-full transition-colors duration-300 text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ส่วนสรุปรายการสั่งซื้อ */}
                <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Your Order</h2>
                    {cartItems.length > 0 ? (
                        <>
                            <div className="space-y-3 mb-4">
                                {cartItems.map(item => (
                                    <div key={item.menuId} className="flex justify-between items-center">
                                        <p className="text-white">{item.menuName} <span className="text-sm text-gray-300">x {item.quantity}</span></p>
                                        <p className="font-semibold text-white">{(item.menuPrice * item.quantity).toFixed(2)} บาท</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-white/20 pt-4 flex justify-between items-center">
                                <p className="text-lg font-bold text-white">Total</p>
                                <p className="text-lg font-bold text-white">{totalPrice.toFixed(2)} บาท</p>
                            </div>
                            
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <button 
                                    onClick={() => document.getElementById('question')?.focus()} 
                                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full transition">
                                    สั่งเพิ่มกับ AI
                                </button>
                                {/* [แก้ไข] เพิ่ม onClick ให้กับ <a> tag */}
                                <a href="/basket" className="w-full" onClick={handleCheckout}>
                                    <button 
                                    className="w-full bg-green-800 hover:bg-green-900 text-white font-bold py-3 rounded-full transition">
                                        Checkout
                                    </button>
                                </a>
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

