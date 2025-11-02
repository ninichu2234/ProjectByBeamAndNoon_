import { NextResponse } from 'next/server';

// [FIX] (บีม) แก้ไข Model Name และ API Version
const MODEL_NAME = 'gemini-2.5-pro'; // ‼️ (บีม) ใช้ตัวนี้
const API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request) {
  try {
    // ‼️ (บีม) รับ chatHistory (ข้อ 14)
    const { question, menuContext, optionsContext, chatHistory } = await request.json();

    if (!API_KEY) {
      throw new Error("Missing GEMINI_API_KEY in .env.local file");
    }

    // [FIX] (บีม) ‼️ แก้จาก v1beta เป็น v1 ‼️
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
    const myOwnContent = "Our cafe opens between 8am - 6pm on weekdays, and 10am - 9pm on weekends.";

    // [FIX 14] (บีม) สร้าง "พรอมต์ระบบ" (System Prompt)
    const systemPrompt = `
        You are a helpful and friendly cafe barista.
        Your task is to answer the user's question in Thai based on the provided information and the chat history.
        You MUST respond with **only** a single, valid JSON object. Do not include any other text or markdown formatting (like \`\`\`json).

        **JSON Format Required:**
        {
          "text": "Your conversational answer in Thai. Continue the conversation naturally. Do NOT ask a new question unless it makes sense to.",
          "recommendations": [
            { 
              "menuId": "123", 
              "menuName": "Item Name",
              "suggestedOptions": [
                { "groupName": "Name of the group", "optionName": "Name of the option" }
              ] 
            }
          ]
        }

        **--- CRITICAL RULES ---**
        1.  **Answer in Thai**: Your "text" response must be in Thai.
        2.  **Natural Conversation**: Continue the conversation based on the 'Chat History'. Do NOT ask a new follow-up question every single time.
        3.  **Exact Matching (Menu)**: If you recommend items, you **MUST** use the exact \`menuId\` and \`menuName\` from the 'Menu Context'. Do NOT invent items.
        4.  **Customization (suggestedOptions)**: 
            * If the user requests a specific customization (e.g., "ไม่หวาน", "เพิ่มช็อต", "ขอนมโอ๊ต"), you MUST find the matching "groupName" and "optionName" from the 'Options Context' and put it in the 'suggestedOptions' array.
            * The "groupName" and "optionName" MUST MATCH the context *EXACTLY*.
            * If the user's request is a note (e.g., "ขอน้ำแข็งน้อยๆ", "แยกไซรัป"), use the groupName "Notes" and put the request in "optionName". (e.g., \`{ "groupName": "Notes", "optionName": "น้ำแข็งน้อย" }\`)
            * If the user does not specify any customizations for an item, return an EMPTY array: \`"suggestedOptions": []\`
        5.  **JSON Only**: Your entire output must be *only* the JSON object, starting with { and ending with }.

        **--- Provided Information ---**
        
        **General Info:** ${myOwnContent}
        **Menu Context:** ${menuContext || 'No menu context provided.'}
        **Options Context:** ${optionsContext || 'No customization options available.'} 
    `;

    // [FIX 14] (บีม) สร้าง "contents" (รวมประวัติแชท + คำถามใหม่)
    const contents = [
        // (บีม) ใส่ประวัติแชท (ถ้ามี)
        ...(chatHistory || []), 
        // (บีม) ใส่คำถามใหม่
        {
            role: "user",
            parts: [{ text: question }]
        }
    ];

    // [FIX] (บีม) ‼️‼️ ลบ "generationConfig" ที่มีปัญหาทิ้งไปเลย ‼️‼️
    
    const requestBody = { 
      contents: contents, // [FIX 14]
      systemInstruction: { // [FIX 14]
          parts: [{ text: systemPrompt }]
      }
      // [FIX] (บีม) ‼️‼️ ลบ "generationConfig" ออกจาก request body ‼️‼️
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Gemini API Error (${response.status}): ${errorBody}`); 
      throw new Error(`Gemini API returned status: ${response.status}. Body: ${errorBody}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error("Invalid response structure from Gemini API");
    }
    
    const rawResponseText = data.candidates[0].content.parts[0].text;
    
    return NextResponse.json({ responseText: rawResponseText }); 

  } catch (error) {
    console.error("Error in /api/chat:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

