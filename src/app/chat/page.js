"use client";
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
    const [question, setQuestion] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [answer, setAnswer] = useState('... คำตอบจะแสดงที่นี่ ...');
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedMenus, setRecommendedMenus] = useState([]);
    const [fullMenuList, setFullMenuList] = useState([]); 
    const router = useRouter();

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
        if (!menu || !menu.menuId) {
            console.error("ข้อมูลเมนูไม่สมบูรณ์ ไม่สามารถเพิ่มลงตะกร้าได้:", menu);
            alert('เกิดข้อผิดพลาด: ข้อมูลเมนูไม่สมบูรณ์');
            return;
        }
    
        try {
            const savedCartJSON = localStorage.getItem('myCafeCart');
            let currentCart = [];
            if (savedCartJSON) {
                currentCart = JSON.parse(savedCartJSON);
            }
    
            const existingItemIndex = currentCart.findIndex(item => item.menuId === menu.menuId);
    
            if (existingItemIndex > -1) {
                currentCart[existingItemIndex].quantity += 1;
            } else {
                const newItem = {
                    menuId: menu.menuId,
                    menuName: menu.menuName,
                    menuPrice: menu.menuPrice,
                    menuImageUrl: menu.menuImageUrl || 'https://placehold.co/100x100/E2D6C8/4A3F35?text=Item',
                    quantity: 1
                };
                currentCart.push(newItem);
            }
    
            localStorage.setItem('myCafeCart', JSON.stringify(currentCart));
    
            alert(`เพิ่มเมนู '${menu.menuName}' ลงในตะกร้าแล้ว!`);
            
            router.push('/cart');
    
        } catch (error) {
            console.error("เกิดข้อผิดพลาดร้ายแรงใน handleOrderClick:", error);
            alert("ขออภัยค่ะ เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า");
        }
    };

    const handleSubmit = async () => {
        // 1. ตรวจสอบก่อนว่าผู้ใช้พิมพ์คำถามหรือไม่
        if (!question.trim()) {
            alert('กรุณาพิมพ์คำถามของคุณ');
            return;
        }

        // 2. ตั้งค่าสถานะ Loading
        setIsLoading(true);
        setAnswer("กำลังดึงข้อมูลเมนูและสอบถาม AI... กรุณารอสักครู่ ✨");
        setRecommendedMenus([]);

        try {
            // 3. ดึงข้อมูลเมนูจาก Supabase
            const { data: menuItems, error: supabaseError } = await supabase
                .from('menuItems')
                .select('menuId, menuName, menuDescription, menuPrice')
                .order('menuId', { ascending: true });

            if (supabaseError) {
                throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลเมนูจากฐานข้อมูลค่ะ: " + supabaseError.message);
            }
            
            if (menuItems) {
                setFullMenuList(menuItems);
            }

            // 4. สร้าง menuContext จากข้อมูลที่เพิ่งดึงมา
            let menuContext = "Here is the cafe's menu from the database:\n";
            if (menuItems && menuItems.length > 0) {
                menuItems.forEach(item => {
                    menuContext += `- Name: ${item.menuName}, Description: ${item.menuDescription}, Price: ${item.menuPrice} baht.\n`;
                });
            }

            // 5. ประกาศค่าคงที่และสร้าง promptText (หลังจากมี menuContext แล้ว)
            const API_KEY = 'AIzaSyBKc_6DmN-5YZWtnKqRzjGCdqb7txWsv3I'; // โปรดเก็บ Key นี้เป็นความลับใน Production
            const MODEL_NAME = 'gemini-2.5-pro'; 
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
            const myOwnContent = "Our cafe opens between 8am - 6pm on weekdays, and 10am - 9pm on weekends.";

            const promptText = `
                You are a helpful cafe assistant. Your task is to answer the user's question based on the provided information.
                
                ALWAYS respond in a valid JSON format. The JSON object must contain two keys:
                1. "text": A friendly, conversational string answering the user's question.
                2. "recommendations": An array of menu objects that you are specifically recommending from the database. Each object must have "menuName" and "menuPrice". If you are not recommending any specific items, provide an empty array [].

                Here is the information you must use:
                - General Info: ${myOwnContent}
                - Menu from Database: ${menuContext}
                ${fileContent ? `- Additional info from uploaded file: ${fileContent}.` : ''}

                User's question: "${question}"

                Now, generate the JSON response.
            `;

            const requestBody = { contents: [{ parts: [{ text: promptText }] }] };

            // 6. เรียกใช้ Gemini API
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
                        setAnswer(parsedResponse.text || "นี่คือเมนูที่แนะนำค่ะ");
                        
                        if (parsedResponse.recommendations && fullMenuList.length > 0) {
                            const enrichedRecommendations = parsedResponse.recommendations.map(rec => {
                                const fullItem = fullMenuList.find(dbItem => dbItem.menuName === rec.menuName);
                                return fullItem ? fullItem : rec;
                            }).filter(item => item.menuId);
                            
                            setRecommendedMenus(enrichedRecommendations);
                        } else {
                            setRecommendedMenus([]);
                        }
                    } catch (e) {
                        console.error("Failed to parse extracted JSON:", e);
                        setAnswer(responseText);
                        setRecommendedMenus([]);
                    }
                } else {
                    setAnswer(responseText);
                    setRecommendedMenus([]);
                }
            } else {
                setAnswer("ขออภัยค่ะ ไม่ได้รับคำตอบจาก AI");
            }

        } catch (error) {
            console.error('Error during handleSubmit:', error);
            setAnswer("เกิดข้อผิดพลาดค่ะ: " + error.message);
        } finally {
            // 7. ปิดสถานะ Loading ไม่ว่าจะสำเร็จหรือล้มเหลว
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">คุยกับ AI แนะนำเมนู</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
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