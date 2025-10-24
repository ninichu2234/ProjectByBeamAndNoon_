import { NextResponse } from 'next/server';

// [EDIT] เราจะใช้ Gemini Flash รุ่นใหม่ล่าสุด
const MODEL_NAME = 'gemini-2.5-pro';

export async function POST(request) {
  try {
    const { question, menuContext } = await request.json();
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("Missing GEMINI_API_KEY in .env.local file");
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
    const myOwnContent = "Our cafe opens between 8am - 6pm on weekdays, and 10am - 9pm on weekends.";

    // [EDIT] นี่คือส่วนที่แก้ไข "Prompt" ให้เข้มงวด
    const promptText = `
        You are a helpful cafe assistant. Your task is to answer the user's question based on the provided information.
        You MUST respond with **only** a single, valid JSON object. Do not include any text or markdown formatting.
        The JSON object must contain "text" (your answer in Thai) and "recommendations" (an array).

        **CRITICAL RULE:** If you recommend menu items, you **MUST** use the exact \`menuId\`, \`menuName\`, and \`menuPrice\` from the 'Menu Context' provided below. 
        Do NOT invent your own IDs (like 'C01') or prices. Use the numeric IDs.

        Here is the information to use:
        - General Info: ${myOwnContent}
        - Menu Context: ${menuContext}

        User's question: "${question}"

        Generate only the JSON object now.
    `;

    const requestBody = { contents: [{ parts: [{ text: promptText }] }] };

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

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error("Invalid response structure from Gemini API");
    }
    
    // ดึงข้อความดิบที่ AI สร้างขึ้น
    const rawResponseText = data.candidates[0].content.parts[0].text;
    
    // "ทำความสะอาด" คำตอบจาก AI ให้เหลือแต่ JSON จริงๆ
    const jsonMatch = rawResponseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("AI did not return valid JSON:", rawResponseText);
      throw new Error("AI response was not in the expected JSON format.");
    }

    const cleanJsonString = jsonMatch[0];
    
    // ส่ง { responseText: "..." } กลับไปให้หน้าแชท
    return NextResponse.json({ responseText: cleanJsonString });

  } catch (error) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

