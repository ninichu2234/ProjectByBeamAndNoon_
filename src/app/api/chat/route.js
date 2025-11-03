import { NextResponse } from 'next/server';

// [FIX] (บีม) แก้ไข Model Name และ API Version
const MODEL_NAME = 'gemini-2.5-pro'; // ‼️ (บีม) แนะนำให้ใช้ตัวนี้ (1.5 Pro)
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
          "text": "Your conversational answer in Thai. Continue the conversation naturally.",
          "recommendations": [
            { 
              "menuId": "123", 
              "menuName": "Item Name",
              "suggestedOptions": [
                { "groupName": "Name of the group", "optionName": "Name of the option" }
              ] 
            }
          ],
          "itemsToAutoAdd": [
            {
              "menuId": "123",
              "menuName": "Item Name",
              "quantity": 1,
              "suggestedOptions": [
                { "groupName": "Name of the group", "optionName": "Name of the option" }
              ]
            }
          ]
        }

        **--- CRITICAL RULES ---**
        1.  **Answer in Thai**: Your "text" response must be in Thai.
        2.  **Pay Attention to History**: You MUST read the 'Chat History' to understand the context. If the user mentioned a preference (e.g., "I want an *iced* drink", "I *don't* like coffee", "ขอชาไทย*เย็น*"), you MUST remember and apply that preference to all future recommendations and orders. Do NOT recommend a "hot" drink if they asked for "iced".
        3.  **Exact Matching (Menu)**: If you recommend items, you **MUST** use the exact \`menuId\` and \`menuName\` from the 'Menu Context'. Do NOT invent items.
        4.  **Customization (suggestedOptions)**: 
            * If the user requests a specific customization (e.g., "ไม่หวาน", "เพิ่มช็อต", "ขอนมโอ๊ต"), you MUST find the matching "groupName" and "optionName" from the 'Options Context' and put it in the 'suggestedOptions' array.
            * This includes common modifiers like **"ร้อน" (Hot), "เย็น" (Iced), "ปั่น" (Frappe)**. If the user says "ชาไทยเย็น" (Iced Thai Tea), you must find the "Type" group (or similar) and add the \`{ "groupName": "Type", "optionName": "เย็น" }\` option.
        5.  **JSON Only**: Your entire output must be *only* the JSON object, starting with { and ending with }.

        // [START] อัปเดตกฎ Auto-Add ให้เข้มงวดสุดๆ
        6.  **Auto-Add (itemsToAutoAdd)**: 
            * **Trigger Words**: User phrases in Thai like **'เอา'** (I'll take), **'ขอ'** (I'd like), **'สั่ง'** (order), 'เพิ่ม' (add), 'รับ' (I'll have) are **CONFIRMATION TRIGGERS**.
            * If a user uses a CONFIRMATION TRIGGER with a specific item (e.g., "เอาชาไทยเย็น 1 แก้ว"), you MUST place this item in \`itemsToAutoAdd\`.
            * You MUST parse the context (like "เย็น") and quantity (like "1 แก้ว"). If no quantity, default to 1.
            * Your \`text\` response MUST confirm the item was added to the cart (e.g., "ได้ค่ะ เพิ่มชาไทยเย็น 1 แก้วลงตะกร้าให้นะคะ").
            * This array MUST be empty if the user is only browsing (e.g., "ชาไทยราคาเท่าไหร่?").
        
        7.  **Quantity**: When adding to \`itemsToAutoAdd\`, parse the user's text for quantity (e.g., "ชาไทย 3 แก้ว" -> \`quantity: 3\`). If not specified, default to \`quantity: 1\`.
        
        8.  **DIFFERENTIATE Recommendations vs. Auto-Add (VERY IMPORTANT!)**:
            * \`recommendations\` = **For Display ONLY**. Use this to *show* users pictures of items they *might* like (e.g., when they say "สวัสดี" or "มีเค้กอะไรบ้าง?").
            * \`itemsToAutoAdd\` = **For Action ONLY**. Use this when the user *confirms* an order (e.g., "เอาเค้กส้ม").
            * **CRITICAL:** Do NOT put an item in `recommendations` if the user just *confirmed* it. A confirmed item **ONLY** goes in `itemsToAutoAdd`.

            * **Correct Example:**
                * User: "มีเค้กอะไรบ้าง?" (What cakes do you have?)
                * AI: \`text: "มีเค้กช็อกโกแลตกับเค้กส้มค่ะ" \`, \`recommendations: [ { ...cake1 }, { ...cake2 } ]\`, \`itemsToAutoAdd: []\`
            
            * **Correct Example:**
                * User: "งั้น**เอา**เค้กส้มค่ะ" (Okay, I'll **take** the orange cake)
                * AI: \`text: "ได้ค่ะ เพิ่มเค้กส้ม 1 ชิ้นลงตะกร้าค่ะ" \`, \`recommendations: []\` (Empty, or show *other* items, but NOT the orange cake), \`itemsToAutoAdd: [ { ...orange_cake, quantity: 1 } ]\`
        // [END] อัปเดตกฎ Auto-Add
        
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
    
    const requestBody = { 
      contents: contents, // [FIX 14]
      systemInstruction: { // [FIX 14]
          parts: [{ text: systemPrompt }]
      },
      // (บีม) เพิ่ม generationConfig เพื่อบังคับให้ตอบเป็น JSON
      generationConfig: {
          responseMimeType: "application/json",
      },
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
    
    // (บีม) responseText จะเป็น JSON object ที่สมบูรณ์แล้ว (เพราะเราสั่ง responseMimeType)
    const rawResponseText = data.candidates[0].content.parts[0].text;
    
    // (บีม) เราจะ parse มันที่นี่เลย
    try {
        const jsonResponse = JSON.parse(rawResponseText);
        // ส่งกลับเป็น JSON object ที่ parse แล้ว
        return NextResponse.json(jsonResponse); 
    } catch (e) {
        console.error("Failed to parse AI JSON response:", rawResponseText);
        throw new Error("AI did not return valid JSON.");
    }

  } catch (error) {
    console.error("Error in /api/chat:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}