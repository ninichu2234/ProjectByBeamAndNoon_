"use client";
import React from 'react';
// Make sure this path points to your supabase client setup file
import { supabase } from '../lib/supabaseClient';

export default function ChatPage() {

    async function promptGemini() {
        // --- Get UI Elements ---
        const questionInput = document.getElementById('question');
        const fileInput = document.getElementById('fileInput');
        const answerDiv = document.getElementById('answer');
        
        answerDiv.innerHTML = "กำลังดึงข้อมูลเมนูและสอบถาม AI... กรุณารอสักครู่ ✨";

        // --- 1. Fetch Menu Data from Supabase ---
        // This is where you put the code to get data from Supabase
        const { data: menuItems, error: supabaseError } = await supabase
            .from('menuItems') // **สำคัญ:** ตรวจสอบให้แน่ใจว่าชื่อตารางของคุณคือ 'menu_items'
            .select('menuName, menuDescription, menuPrice')
            .order('menuId', { ascending: true }); // Make sure you have a column named 'id' or change it to 'menuId'

        if (supabaseError) {
            console.error('Error fetching menuItems:', supabaseError.message);
            answerDiv.innerHTML = "เกิดข้อผิดพลาดในการดึงข้อมูลเมนูจากฐานข้อมูลค่ะ";
            return; // Stop the function if we can't get the menu
        }

        // --- 2. Format the Menu Data into Text for the AI ---
        let menuContext = "";
        if (menuItems && menuItems.length > 0) {
            menuContext = "Here is the menu data from our database:\n";
            menuItems.forEach(item => {
                menuContext += `- Name: ${item.menuName}, Description: ${item.menuDescription}, Price: ${item.menuPrice} baht.\n`;
            });
        } else {
            menuContext = "There are no items on the menu in the database.\n";
        }
        
        // --- 3. Build the Final Prompt for the AI ---
        const API_KEY = 'AIzaSyBKc_6DmN-5YZWtnKqRzjGCdqb7txWsv3I'; // <-- Still insecure
        const MODEL_NAME = 'gemini-2.5-pro'; // <-- Corrected model name
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
        
        let fileData = '';
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileData = await readTextFile(file);
        }
        
        const myOwnContent = "Our cafe opens between 8am - 6pm during weekdays. During weekends, we open 10am - 9pm.";
        
        // Now we add the menuContext to the prompt
        let promptText = `
            You are a helpful cafe assistant. Use the following information to answer the user's question.
            General Info: ${myOwnContent}
            Menu from Database: ${menuContext}
        `;

        if (fileData) {
            promptText += ` Also use this information from the uploaded file: ${fileData}.`;
        }
        promptText += ` Now, answer this user's question: "${questionInput.value}"`;

        const requestBody = {
            contents: [{
                parts: [{ text: promptText }]
            }]
        };

        // --- 4. Call the Gemini API (same as before) ---
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('API Error Response:', errorBody);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (responseText) {
                answerDiv.innerHTML = responseText.replace(/\n/g, '<br>');
            } else {
                answerDiv.innerHTML = "ขออภัยค่ะ ไม่ได้รับคำตอบจาก AI";
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            answerDiv.innerHTML = "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI ค่ะ";
        }
    }

    function readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }

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
                        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                        rows="4"
                        placeholder="เช่น ร้านเปิดกี่โมง, มีเมนูอะไรแนะนำบ้าง?"
                    ></textarea>
                </div>
                
                <div className="mb-4">
                    <label htmlFor="fileInput" className="block text-gray-700 font-bold mb-2">
                        อัปโหลดไฟล์ข้อมูลเพิ่มเติม (ถ้ามี):
                    </label>
                    <input type="file" id="fileInput" className="w-full text-gray-700" />
                </div>
                
                <button
                    onClick={promptGemini}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                    ✨ ส่งคำถาม
                </button>
            </div>

            <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-md min-h-[100px]">
                <h2 className="text-xl font-bold mb-4">คำตอบจาก AI:</h2>
                <div id="answer" className="text-gray-800 whitespace-pre-wrap">
                    ... คำตอบจะแสดงที่นี่ ...
                </div>
            </div>
        </div>
    );
}
