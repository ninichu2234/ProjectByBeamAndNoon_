// src/app/api/chat/route.js

import { NextResponse } from 'next/server';

// [EDIT] แก้ไขเป็น 'gemini-1.5-flash'
const MODEL_NAME = 'gemini-2.5-pro'; 

export async function POST(request) {
  try {
    // ‼️‼️ [FIX] แก้ไขบรรทัดนี้ ‼️‼️
    const { question, menuContext, optionsContext } = await request.json();
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("Missing GEMINI_API_KEY in .env.local file");
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
    const myOwnContent = "Our cafe opens between 8am - 6pm on weekdays, and 10am - 9pm on weekends.";

    // [EDIT] อัปเดต Prompt ให้รองรับ suggestedOptions
    const promptText = `
        You are a helpful and friendly cafe barista.
        Your task is to answer the user's question in Thai based on the provided information.
        You MUST respond with **only** a single, valid JSON object. Do not include any other text or markdown formatting (like \`\`\`json).

        **JSON Format Required:**
        {
          "text": "Your conversational answer in Thai. You MUST also ask a follow-up question.",
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
        2.  **Follow-up Question**: Your "text" response MUST end with a relevant follow-up question (e.g., "สนใจรับอะไรเพิ่มไหมคะ?").
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

        **User's question:** "${question}"

        Generate only the single, valid JSON object now.
    `;
    
    // ตั้งค่า Generation Config เพื่อบังคับให้ AI ตอบเป็น JSON
    const generationConfig = {
      "response_mime_type": "application/json",
    };

    const requestBody = { 
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig 
    };

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
    
    const rawResponseText = data.candidates[0].content.parts[0].text;
    
    return NextResponse.json({ responseText: rawResponseText }); 

  } catch (error) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}