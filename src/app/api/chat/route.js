// File: src/app/api/chat/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // รับข้อมูลที่หน้าแชทส่งมา
    const { question, menuContext, fileContent } = await request.json();

    // [FIX 1 - สำคัญที่สุด] ดึง API Key จาก Environment Variables
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("Missing GEMINI_API_KEY in .env.local file");
    }

    const MODEL_NAME = 'gemini-2.5-pro';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
    const myOwnContent = "Our cafe opens between 8am - 6pm on weekdays, and 10am - 9pm on weekends.";

    // [FIX 3 - ปรับปรุง] ปรับ Prompt ให้ AI สร้าง JSON ที่ถูกต้องและไม่มีข้อความอื่นปน
    const promptText = `
        You are a helpful cafe assistant. Your task is to answer the user's question based on the provided information.
        You MUST respond with **only** a single, valid JSON object. Do not include any text, markdown formatting (like \`\`\`json), or explanations before or after the JSON object.
        The JSON object must contain two keys:
        1. "text": (string) Your helpful answer in Thai.
        2. "recommendations": (array) An array of menu item objects if you are recommending, or an empty array [] if not.

           // [EDIT] สั่งให้ AI ใช้ Key ที่ถูกต้องตรงกับที่ Frontend ต้องการ
           Each object in this array MUST have the following keys:
           - "menuId": (string or number) The ID of the item from the context.
           - "menuName": (string) The name of the item.
           - "menuPrice": (number) The price of the item (as a number, not a string).
           
           If you are not recommending any items, this should be an empty array [].

        Here is the information to use:
        - General Info: ${myOwnContent}
        - Menu Context: ${menuContext}
        ${fileContent ? `- User File Content: ${fileContent}` : ''}

        User's question: "${question}"

        Generate only the JSON object now.
    `;

    const requestBody = { contents: [{ parts: [{ text: promptText }] }] };

    // เรียก Gemini API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API returned status: ${response.status}. Body: ${errorBody}`);
    }

    const data = await response.json();

    // [FIX 4 - สำคัญ] ส่งข้อมูลกลับในรูปแบบที่ ChatPage.js คาดหวัง
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error("Invalid response structure from Gemini API");
    }
    
    // ดึงข้อความดิบที่ AI สร้างขึ้น
    const rawResponseText = data.candidates[0].content.parts[0].text;
    
    // [EDIT - แก้ปัญหา JSON น่าเกลียด]
    // "ทำความสะอาด" คำตอบจาก AI ให้เหลือแต่ JSON จริงๆ
    // โดยค้นหาเครื่องหมาย { ที่แรก และ } สุดท้าย
    const jsonMatch = rawResponseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      // ถ้าหา JSON ไม่เจอเลย ให้โยน Error
      console.error("AI did not return valid JSON:", rawResponseText);
      throw new Error("AI response was not in the expected JSON format.");
    }

    // นี่คือ JSON สะอาดๆ ที่จะส่งไปให้ "หน้าร้าน"
    const cleanJsonString = jsonMatch[0];
    
    // ส่ง { responseText: "..." } กลับไปให้หน้าแชท
    // โดย "..." คือ String ที่เป็น JSON สะอาดๆ
    return NextResponse.json({ responseText: cleanJsonString });

  } catch (error) {
    console.error("Error in /api/chat:", error);
    // ส่ง error message กลับไปให้หน้าแชทเห็น
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


