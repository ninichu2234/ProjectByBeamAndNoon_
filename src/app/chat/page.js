"use client";
import React, { useState } from 'react';
// 1. **(สำคัญ)** กลับมาใช้ import แบบมาตรฐานหลังจากติดตั้งแล้ว
import { createClient } from '@supabase/supabase-js';

// --- ใส่ข้อมูล Supabase ของคุณ ---
// คุณต้องสร้างไฟล์ .env.local เพื่อเก็บค่าเหล่านี้ หรือใส่โดยตรงเพื่อทดสอบ
const supabaseUrl = 'https://rcrntadwwvhyojmjrmzh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcm50YWR3d3ZoeW9qbWpybXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjU2MzAsImV4cCI6MjA3Mzc0MTYzMH0.sMK4cdz4iB95ZycKg3srZQZm_orBEq45az5pkObPGnA';
const supabase = createClient(supabaseUrl, supabaseKey);


export default function ChatPage() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('... คำตอบจะแสดงที่นี่ ...');
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedMenus, setRecommendedMenus] = useState([]);
    const [allMenuItems, setAllMenuItems] = useState([]);
   

    const handleOrderClick = (recommendedMenu) => {
        const menuToAdd = allMenuItems.find(item => item.menuName === recommendedMenu.menuName);
        if (!menuToAdd) {
            alert("ขออภัยค่ะ ไม่พบข้อมูลเมนูนี้ในระบบ");
            return;
        }
        const existingCartJSON = localStorage.getItem('myCafeCart');
        let cart = existingCartJSON ? JSON.parse(existingCartJSON) : [];
        const existingItemIndex = cart.findIndex(item => item.menuId === menuToAdd.menuId);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ ...menuToAdd, quantity: 1 });
        }
        localStorage.setItem('myCafeCart', JSON.stringify(cart));
        window.location.href = '/basket';
    };

    const handleSubmit = async () => {
        if (!question.trim()) {
            alert('กรุณาพิมพ์คำถามของคุณ');
            return;
        }
        setIsLoading(true);
        setAnswer("กำลังดึงข้อมูลเมนูและสอบถาม AI... กรุณารอสักครู่ ✨");
        setRecommendedMenus([]);

        const { data: menuItems, error: supabaseError } = await supabase
            .from('menuItems')
            .select('*')
            .order('menuId', { ascending: true });

        if (supabaseError) {
            setAnswer("เกิดข้อผิดพลาดในการดึงข้อมูลเมนู: " + supabaseError.message);
            setIsLoading(false);
            return;
        }
        
        setAllMenuItems(menuItems || []);

        let menuContext = "Here is the cafe's menu from the database:\n";
        menuItems.forEach(item => {
            menuContext += `- Name: ${item.menuName}, Description: ${item.menuDescription}, Price: ${item.menuPrice} baht.\n`;
        });

        const API_KEY = 'AIzaSyBKc_6DmN-5YZWtnKqRzjGCdqb7txWsv3I'; // <--- **ใส่ Gemini Key ของคุณที่นี่**
        
        const MODEL_NAME = 'gemini-2.5-pro';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
        
        const promptText = `
            You are a helpful cafe assistant. Your task is to answer the user's question based on the menu.
            ALWAYS respond in a valid JSON format.

            The JSON object MUST contain two keys:
            1. "text": A friendly, conversational string answering the user's question in Thai.
            2. "recommendations": An array of menu objects that you are specifically recommending. Each object must have "menuName" and "menuPrice". If not recommending anything, provide an empty array [].

            Here is an EXAMPLE of a perfect response format:
            {
                "text": "แน่นอนค่ะ สำหรับกาแฟที่ไม่เปรี้ยว ทางร้านแนะนำเป็นพิเศษ 2 ตัวนี้เลยค่ะ มีความหอมนุ่มและกลมกล่อมมากค่ะ",
                "recommendations": [
                    { "menuName": "Latte (Iced)", "menuPrice": 75 },
                    { "menuName": "Caramel Macchiato", "menuPrice": 85 }
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
            
            console.log("AI Response:", responseText);

            if (responseText) {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const parsedResponse = JSON.parse(jsonMatch[0]);
                        setAnswer(parsedResponse.text || "นี่คือเมนูที่แนะนำค่ะ");
                        setRecommendedMenus(parsedResponse.recommendations || []);
                    } catch (e) {
                        console.error("JSON Parsing Error:", e);
                        setAnswer("ขออภัยค่ะ AI ตอบกลับมาในรูปแบบที่ไม่ถูกต้อง");
                    }
                } else {
                    setAnswer(responseText);
                }
            } else {
                setAnswer("ขออภัยค่ะ ไม่ได้รับคำตอบจาก AI");
            }
        } catch (error) {
            console.error(error);
            setAnswer("เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI ค่ะ กรุณาตรวจสอบ API Key");
        } finally {
            setIsLoading(false);
        }
    }

    

    return (
        // เปลี่ยนพื้นหลังหลักเป็นสีน้ำตาลอ่อนมากๆ (คล้ายสีลาเต้)
        <div className="bg-white min-h-screen">
            <div className="container mx-auto p-4 sm:p-8 max-w-5xl">
    
                {/* ส่วนหัว: ใช้สีเขียวเข้มและสีน้ำตาลของเมล็ดกาแฟ */}
                <div className="text-center mb-8">
                    <div className="inline-block bg-green-800 rounded-full p-2 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1014.12 11.88a3 3 0 00-4.242 4.242z" />
                        </svg>
                    </div>
                    <h1 className="text-[#4A3728] font-bold text-[#4A3728] tracking-tight">AI Barista</h1>
                    <p className="text-[#4A3728] font-bold">พร้อมแนะนำเครื่องดื่มแก้วโปรดให้คุณ</p>
                </div>
    
                {/* ส่วนโปรโมชั่น: เน้นด้วยเส้นขอบสีน้ำตาลเข้ม */}
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
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full px-4 py-3 text-white border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 transition"
                        rows="3"
                        placeholder="e.g., I'm looking for a smooth, non-acidic coffee..."
                        disabled={isLoading}
                    />
    
                    {/* ปุ่มคำถามด่วน: ใช้พื้นหลังสีน้ำตาลอ่อน */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => setQuestion("มีเมนูอะไรใหม่บ้าง?")} className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 py-1 px-3 rounded-full transition">มีอะไรใหม่?</button>
                        <button onClick={() => setQuestion("แนะนำกาแฟไม่เปรี้ยวหน่อย")} className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 py-1 px-3 rounded-full transition">กาแฟไม่เปรี้ยว</button>
                        <button onClick={() => setQuestion("เครื่องดื่มที่ไม่ใช่กาแฟมีอะไรบ้าง?")} className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 py-1 px-3 rounded-full transition">ไม่ใช่กาแฟ</button>
                    </div>
    
                    <div className="mt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-green-800 hover:bg-green-900 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-md transform hover:scale-105 disabled:bg-gray-400 disabled:shadow-none disabled:transform-none"
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
                            <div className="text-white whitespace-pre-wrap prose">{answer}</div>
                        </div>
                    </div>
    
                    {/* ส่วนเมนูแนะนำ */}
                    {recommendedMenus.length > 0 && (
                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-amber-900 mb-4">Just for you:</h3>
                            <div className="space-y-3">
                                {recommendedMenus.map((menu, index) => (
                                    <div key={index} className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-center justify-between transition hover:shadow-md hover:border-green-800">
                                        <div>
                                            <p className="font-bold text-amber-900">{menu.menuName}</p>
                                            <p className="text-sm text-amber-800">{menu.menuPrice} บาท</p>
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
                    <div className="space-y-3 mb-4">
                        {/* ตัวอย่างรายการสินค้า */}
                        <div className="flex justify-between items-center">
                            <p className="text-white">Latte (Iced) <span className="text-sm text-white">x 1</span></p>
                            <p className="font-semibold text-white">75 บาท</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-white">Caramel Macchiato <span className="text-sm text-white">x 2</span></p>
                            <p className="font-semibold text-white">170 บาท</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                        <p className="text-lg font-bold text-white">Total</p>
                        <p className="text-lg font-bold text-white">245 บาท</p>
                    </div>
                    <button className="mt-6 w-full bg-green-800 hover:bg-green-900 text-white font-bold py-3 rounded-full transition">
                        Checkout
                    </button>
                </div>
    
            </div>
        </div>
    );
}