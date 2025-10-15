"use client";
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ChatPage() {
    const [question, setQuestion] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [answer, setAnswer] = useState('... คำตอบจะแสดงที่นี่ ...');
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedMenus, setRecommendedMenus] = useState([]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setFileContent('');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => setFileContent(e.target.result);
        reader.readAsText(file);
    };

    const handleOrderClick = (menu) => {
        alert(`เพิ่มเมนู '${menu.menuName}' ลงในตะกร้าแล้ว!`);
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
            .select('menuName, menuDescription, menuPrice')
            .order('menuId', { ascending: true });

        if (supabaseError) {
            setAnswer("เกิดข้อผิดพลาดในการดึงข้อมูลเมนูจากฐานข้อมูลค่ะ: " + supabaseError.message);
            setIsLoading(false);
            return;
        }

        let menuContext = "Here is the cafe's menu from the database:\n";
        if (menuItems && menuItems.length > 0) {
            menuItems.forEach(item => {
                menuContext += `- Name: ${item.menuName}, Description: ${item.menuDescription}, Price: ${item.menuPrice} baht.\n`;
            });
        }

        const API_KEY = 'AIzaSyBKc_6DmN-5YZWtnKqRzjGCdqb7txWsv3I';
        const MODEL_NAME = 'gemini-2.5-pro';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
        const myOwnContent = "Our cafe opens between 8am - 6pm on weekdays, and 10am - 9pm on weekends.";

        const promptText = `
            You are a helpful cafe assistant. Your task is to answer the user's question based on the provided information.
            
            ALWAYS respond in a valid JSON format. The JSON object must contain two keys:
            1. "text": A friendly, conversational string answering the user's question.
            2. "recommendations": An array of menu objects that you are specifically recommending from the database. Each object in the array must have "menuName" and "menuPrice". If you are not recommending any specific items, provide an empty array [].

            Here is the information you must use:
            - General Info: ${myOwnContent}
            - Menu from Database: ${menuContext}
            ${fileContent ? `- Additional info from uploaded file: ${fileContent}.` : ''}

            User's question: "${question}"

            Now, generate the JSON response.
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
                // --- จุดแก้ไขสำคัญ: แกะ JSON ออกจากข้อความ ---
                // นี่คือ "ล่ามแปลภาษา" ที่เราเพิ่มเข้ามา
                const jsonMatch = responseText.match(/\{[\s\S]*\}/); // พยายามหา block ของ JSON {...}

                if (jsonMatch) {
                    try {
                        const parsedResponse = JSON.parse(jsonMatch[0]);
                        // นำข้อมูลที่แกะได้ไปใส่ใน State ที่ถูกต้อง
                        setAnswer(parsedResponse.text || "นี่คือเมนูที่แนะนำค่ะ");
                        setRecommendedMenus(parsedResponse.recommendations || []);
                    } catch (e) {
                        // หาก JSON ที่ได้มาไม่สมบูรณ์ ก็ให้แสดงเป็นข้อความธรรมดาแทน
                        console.error("Failed to parse extracted JSON:", e);
                        setAnswer(responseText);
                        setRecommendedMenus([]);
                    }
                } else {
                    // หากหา JSON ไม่เจอเลย ก็แสดงเป็นข้อความธรรมดา
                    setAnswer(responseText);
                    setRecommendedMenus([]);
                }
            } else {
                setAnswer("ขออภัยค่ะ ไม่ได้รับคำตอบจาก AI");
            }

        } catch (error) {
            console.error('Error calling Gemini API:', error);
            setAnswer("เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI ค่ะ");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">คุยกับ AI แนะนำเมนู</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* --- ส่วน Input เหมือนเดิม --- */}
                <div className="mb-4">
                    <label htmlFor="question" className="block text-gray-700 font-bold mb-2">
                        พิมพ์คำถามของคุณที่นี่:
                    </label>
                    <textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                        rows="4"
                        placeholder="เช่น แนะนำกาแฟที่ไม่เปรี้ยวหน่อย, มีอะไรสดชื่นๆ บ้าง?"
                        disabled={isLoading}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="fileInput" className="block text-gray-700 font-bold mb-2">
                        อัปโหลดไฟล์ข้อมูลเพิ่มเติม (ถ้ามี):
                    </label>
                    <input type="file" id="fileInput" onChange={handleFileChange} className="w-full text-gray-700" disabled={isLoading}/>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'กำลังประมวลผล...' : '✨ ส่งคำถาม'}
                </button>
            </div>

            {/* --- ส่วนแสดงผลลัพธ์ --- */}
            <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-md min-h-[100px]">
                <h2 className="text-xl font-bold mb-4">คำตอบจาก AI:</h2>
                {/* ส่วนแสดงข้อความสนทนา */}
                <div className="text-gray-800 whitespace-pre-wrap">{answer}</div>

                {/* --- ส่วนใหม่: แสดงผลเมนูที่แนะนำ --- */}
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

