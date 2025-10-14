"use client"; // ต้องมีบรรทัดนี้เพื่อบอกว่า Component นี้ทำงานฝั่ง Client

import React from 'react';

export default function ChatPage() {

    async function promptGemini() {
        // !!! คำเตือน: การใส่ API Key ไว้ในโค้ดฝั่ง Client แบบนี้อันตรายมาก !!!
        // ผู้ใช้จะเห็น Key ของคุณได้จาก Source Code ในเบราว์เซอร์
        const API_KEY = 'AIzaSyBKc_6DmN-5YZWtnKqRzjGCdqb7txWsv3I'; // <--- ไม่ปลอดภัยอย่างยิ่ง
        const MODEL_NAME = 'gemini-1.5-pro-latest'; // แนะนำให้ใช้รุ่นล่าสุด
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
        
        const questionInput = document.getElementById('question');
        const fileInput = document.getElementById('fileInput');
        const answerDiv = document.getElementById('answer');

        answerDiv.innerHTML = "กำลังคิด... กรุณารอสักครู่ ✨";

        let fileData = '';
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileData = await readTextFile(file);
        }
        
        const myOwnContent = "We open between 8am - 6pm during weekday. During weekend, we open 10am - 9pm.";
        
        let promptText = `Use the following information: ${myOwnContent}.`;
        if (fileData) {
            promptText += ` Also use this information from the uploaded file: ${fileData}.`;
        }
        promptText += ` Answer the following question: ${questionInput.value}`;

        const requestBody = {
            contents: [{
                parts: [{ text: promptText }]
            }]
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (responseText) {
                answerDiv.innerHTML = responseText.replace(/\n/g, '<br>'); // แสดงผลขึ้นบรรทัดใหม่
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

            <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">คำตอบจาก AI:</h2>
                <div id="answer" className="text-gray-800 whitespace-pre-wrap">
                    ... คำตอบจะแสดงที่นี่ ...
                </div>
            </div>
        </div>
    );
}



