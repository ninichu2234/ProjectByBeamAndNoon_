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
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">คุยกับ AI แนะนำเมนู</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="question" className="block text-gray-700 font-bold mb-2">พิมพ์คำถามของคุณที่นี่:</label>
                    <textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                        rows="4"
                        placeholder="เช่น แนะนำกาแฟที่ไม่เปรี้ยวหน่อย..."
                        disabled={isLoading}
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105 disabled:bg-gray-400"
                >
                    {isLoading ? 'กำลังประมวลผล...' : '✨ ส่งคำถาม'}
                </button>
            </div>
            <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-md min-h-[100px]">
                <h2 className="text-xl font-bold mb-4">คำตอบจาก AI:</h2>
                <div className="text-gray-800 whitespace-pre-wrap">{answer}</div>
                {recommendedMenus.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3 border-t pt-4">เมนูที่แนะนำสำหรับคุณ:</h3>
                        <div className="space-y-3">
                            {recommendedMenus.map((menu, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-900">{menu.menuName}</p>
                                        <p className="text-sm text-gray-600">{menu.menuPrice} บาท</p>
                                    </div>
                                    <button
                                        onClick={() => handleOrderClick(menu)}
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
                                    >
                                        สั่งเมนูนี้
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
