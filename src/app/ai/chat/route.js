// File: src/app/api/chat/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // รับข้อมูลที่หน้าแชทส่งมา
    const { question, menuContext, fileContent } = await request.json();

    // ดึง API Key จาก Environment Variables เพื่อความปลอดภัย
    const API_KEY = 'AIzaSyBKc_6DmN-5YZWtnKqRzjGCdqb7txWsv3I';

    if (!API_KEY) {
      throw new Error("Missing GEMINI_API_KEY in environment variables");
    }

    const MODEL_NAME = 'gemini-2.5-pro';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    const myOwnContent = "Our cafe opens between 8am - 6pm on weekdays, and 10am - 9pm on weekends.";

    // สร้าง Prompt ที่จะส่งให้ AI
    const promptText = `
        You are a helpful cafe assistant. Your task is to answer the user's question based on the provided information.
        ALWAYS respond in a valid JSON format. The JSON object must contain "text" and "recommendations" keys.

        Information:
        - General Info: ${myOwnContent}
        - Menu: ${menuContext}
        ${fileContent ? `- User File: ${fileContent}` : ''}

        User's question: "${question}"

        Generate the JSON response.`;

    const requestBody = { contents: [{ parts: [{ text: promptText }] }] };

    // เรียก Gemini API จากฝั่งเซิร์ฟเวอร์ (ไม่มีปัญหา CORS)
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API returned status: ${response.status}. Body: ${errorBody}`);
    }

    // ส่งผลลัพธ์กลับไปให้หน้าแชท
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in /ai/chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}