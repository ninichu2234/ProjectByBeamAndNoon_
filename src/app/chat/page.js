"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// [FIX] 1. Import 'supabase' จากไฟล์ส่วนกลาง
import { supabase } from '../lib/supabaseClient'; 

// [FIX] 2. ลบการสร้าง Client ที่ซ้ำซ้อนทิ้ง
// const supabaseUrl = ...
// const supabaseKey = ...
// const supabase = createClient(...)

export default function ChatPage() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('สวัสดีค่ะ ให้ AI Barista แนะนำเมนูอะไรดีคะ?');
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedMenus, setRecommendedMenus] = useState([]);
    const [allMenuItems, setAllMenuItems] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isListening, setIsListening] = useState(false);
    
    // [FIX] 3. สร้าง "ธง" เพื่อเช็กการโหลดครั้งแรก
    const isInitialMount = useRef(true);

    // --- useEffect Hooks ---
    
    // [1] Effect "โหลด" (ทำงานครั้งเดียว)
    useEffect(() => {
        try {
            // [FIX] อ่านจาก localStorage ก่อนเสมอ
            const savedCart = JSON.parse(localStorage.getItem('myCafeCart') || '[]');
            setCartItems(savedCart);
            console.log("ChatPage: Initial cart loaded:", savedCart); // Log เพิ่มเติม
        } catch (error) {
            console.error("ChatPage: Could not load cart from localStorage", error);
            setCartItems([]);
        }

        const fetchAllMenus = async () => {
            console.log("ChatPage: ==> ENTERING fetchAllMenus function..."); // <-- Log เพิ่ม
            try { // <-- เพิ่ม try...catch รอบนอก
                console.log("ChatPage: Attempting to fetch all menu items from Supabase table 'menuItems'...");
                // [FIX] 4. 'supabase' ถูก import มาจากข้างบนแล้ว
                
                // *** นี่คือจุดที่เราเรียก Supabase ***
                const { data, error, status, statusText } = await supabase
                    .from('menuItems') // <-- เช็กชื่อตารางให้แน่ใจ
                    .select('*');     // <-- ดึงทุกคอลัมน์

                // [DEBUG] Log ผลลัพธ์ทั้งหมดที่ได้กลับมา
                console.log("ChatPage: Supabase fetch response:", { data, error, status, statusText });

                if (error) {
                    // ถ้ามี Error จาก Supabase โดยตรง
                    console.error("ChatPage: CRITICAL Supabase Error fetching all menu items:", error);
                    alert(`เกิดข้อผิดพลาดร้ายแรงในการโหลดเมนูหลักจาก Supabase: ${error.message}. Code: ${error.code}. Hint: ${error.hint}`);
                } else if (!data) {
                    // ถ้าไม่มี Error แต่ data เป็น null/undefined (ไม่ควรเกิด)
                    console.warn("ChatPage: Supabase returned no error, but data is null/undefined.");
                    alert("โหลดเมนูหลักสำเร็จ แต่ไม่ได้รับข้อมูล (Data is null). โปรดตรวจสอบตาราง Supabase.");
                    setAllMenuItems([]); // ตั้งค่าเป็น Array ว่าง
                } else {
                    // ถ้าสำเร็จ (ได้ data เป็น Array)
                    setAllMenuItems(data); // data อาจจะเป็น [] ถ้าตารางว่างจริงๆ
                    console.log("ChatPage: All menu items fetched successfully. Data length:", data.length); 
                    
                    // แจ้งเตือนถ้าได้ Array ว่างกลับมา (หลังจากเช็ก RLS แล้ว)
                    if (data.length === 0) {
                        console.warn("ChatPage: Fetched menu items successfully, but the array is empty. Double-check Supabase table 'menuItems' has rows and RLS policy allows 'anon' role to SELECT with 'USING (true)'.");
                        // เอา alert ออกก่อน เพราะอาจจะน่ารำคาญถ้าตารางว่างจริงๆ
                        // alert("โหลดเมนูหลักสำเร็จ แต่ไม่พบข้อมูลเมนูในฐานข้อมูล. โปรดตรวจสอบข้อมูลในตาราง 'menuItems' ที่ Supabase.");
                    }
                }
            } catch (networkOrOtherError) { // <-- ดัก Error อื่นๆ เช่น Network
                 console.error("ChatPage: Network or other error during fetchAllMenus:", networkOrOtherError);
                 alert(`เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อโหลดเมนูหลัก: ${networkOrOtherError.message}`);
                 setAllMenuItems([]); // ตั้งค่าเป็น Array ว่างถ้าเกิดปัญหา
            }
             console.log("ChatPage: <== EXITING fetchAllMenus function."); // <-- Log เพิ่ม
        };
        fetchAllMenus();
        
        // [FIX] ตั้งค่าธงหลังโหลดเสร็จใน Effect แรก
        const timer = setTimeout(() => {
             isInitialMount.current = false;
             console.log("ChatPage: Initial mount flag set to false.");
        }, 150); // เพิ่ม delay อีกนิด เผื่อ Supabase ช้ามากๆ
       
       return () => clearTimeout(timer); // Cleanup timer

    }, []); // [] ทำให้ทำงานครั้งเดียว

    // ... (โค้ดส่วนที่เหลือเหมือนเดิมทุกประการ) ...

    // [2] Effect "บันทึก" และ "คำนวณราคา"
    useEffect(() => {
        // [FIX] ตรวจสอบ cartItems ก่อน reduce
        const currentCart = Array.isArray(cartItems) ? cartItems : [];
        const newTotal = currentCart.reduce((sum, item) => sum + ((item.menuPrice ?? 0) * (item.quantity ?? 0)), 0);
        setTotalPrice(newTotal);
        console.log("ChatPage: Total price calculated:", newTotal); // Log เพิ่มเติม

        // [FIX] 6. ตรวจสอบ "ธง" เพื่อ "บันทึก" ลง localStorage
        if (!isInitialMount.current) {
            try { 
                if (currentCart.length > 0) {
                    localStorage.setItem('myCafeCart', JSON.stringify(currentCart));
                     console.log("ChatPage: Cart saved to localStorage:", currentCart); // Log เพิ่มเติม
                } else {
                    localStorage.removeItem('myCafeCart');
                    console.log("ChatPage: Cart removed from localStorage."); // Log เพิ่มเติม
                }
                // [FIX] 7. ส่งสัญญาณบอก Navbar ว่าตะกร้าเปลี่ยนแล้ว
                window.dispatchEvent(new Event('local-storage')); 
                console.log("ChatPage: 'local-storage' event dispatched."); // Log เพิ่มเติม
            } catch (error) {
                console.error("ChatPage: Failed to save cart to localStorage", error);
            }
        } else {
            console.log("ChatPage: Initial mount, skipping save to localStorage.");
        }
    }, [cartItems]); // [!] ทำงานทุกครั้งที่ cartItems เปลี่ยน

    
    // Text-to-Speech useEffect (เหมือนเดิม)
    useEffect(() => {
        const speak = (text) => {
             if (typeof window === 'undefined' || !window.speechSynthesis) return; 
            window.speechSynthesis.cancel(); // หยุดเสียงเก่าก่อน
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'th-TH';
            utterance.rate = 1.0; // ความเร็วปกติ
            
            // พยายามหาเสียง Kanya
            let voices = window.speechSynthesis.getVoices();
             if (voices.length === 0) {
                 // ถ้ายังไม่มีเสียง ให้รอ event onvoiceschanged
                 window.speechSynthesis.onvoiceschanged = () => {
                     voices = window.speechSynthesis.getVoices();
                     const thaiFemaleVoice = voices.find(voice => voice.lang === 'th-TH' && voice.name.includes('Kanya'));
                     if (thaiFemaleVoice) utterance.voice = thaiFemaleVoice;
                     // เช็คอีกครั้งว่ายังต้องการพูดข้อความนี้อยู่ไหม
                     if (answer === text && !isLoading && typeof window !== 'undefined' && window.speechSynthesis) {
                         window.speechSynthesis.speak(utterance);
                     }
                 };
             } else {
                 const thaiFemaleVoice = voices.find(voice => voice.lang === 'th-TH' && voice.name.includes('Kanya'));
                 if (thaiFemaleVoice) utterance.voice = thaiFemaleVoice;
                  // พูดได้เลยถ้ามีเสียงแล้ว
                  if (typeof window !== 'undefined' && window.speechSynthesis) {
                      window.speechSynthesis.speak(utterance);
                  }
             }
        };

        // เงื่อนไขในการพูด: มี answer, ไม่ใช่ข้อความเริ่มต้น, และไม่ได้กำลังโหลด
        if (answer && answer !== 'สวัสดีค่ะ ให้ AI Barista แนะนำเมนูอะไรดีคะ?' && !isLoading) {
            speak(answer);
        }

        // Cleanup function: หยุดพูด และล้าง event listener เมื่อ component unmount หรือ state เปลี่ยน
        return () => {
             if (typeof window !== 'undefined' && window.speechSynthesis) {
                 window.speechSynthesis.cancel();
                 window.speechSynthesis.onvoiceschanged = null; // สำคัญ: ล้าง listener ออกเสมอ
             }
        };
    }, [answer, isLoading]); // ทำงานเมื่อ answer หรือ isLoading เปลี่ยน

    // Speech-to-Text (เหมือนเดิม)
    const handleListen = () => {
         if (typeof window === 'undefined') return; 
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("ขออภัยค่ะ เบราว์เซอร์ของคุณไม่รองรับฟังก์ชันสั่งงานด้วยเสียง");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'th-TH'; // ภาษาไทย
        recognition.interimResults = false; // ไม่เอาผลลัพธ์ระหว่างพูด
        recognition.maxAlternatives = 1; // เอาแค่ผลลัพธ์ที่ดีที่สุด

        recognition.onstart = () => {
            setIsListening(true);
            setQuestion("กำลังฟัง... พูดได้เลยค่ะ 🎤"); // แสดงสถานะกำลังฟัง
        };

        recognition.onresult = (event) => {
            const speechToText = event.results[0][0].transcript;
            setQuestion(speechToText); // อัปเดต state ด้วยข้อความที่ได้ยิน
            // [เพิ่ม] เรียก handleSubmit ทันทีหลังได้ยิน
            // handleSubmit(speechToText); // ส่งข้อความไปให้ AI ประมวลผลต่อ
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error, event.message);
            setQuestion(''); // ล้างช่องข้อความ
            let errorMessage = "เกิดข้อผิดพลาดในการรับเสียง: ";
            switch (event.error) {
                case 'no-speech': errorMessage += "ไม่พบเสียงพูด"; break;
                case 'audio-capture': errorMessage += "ไม่สามารถเข้าถึงไมโครโฟนได้"; break;
                case 'not-allowed': errorMessage += "ไม่อนุญาตให้ใช้ไมโครโฟน"; break;
                default: errorMessage += event.message;
            }
            alert(errorMessage);
        };

        recognition.onend = () => {
            setIsListening(false);
            // ให้ focus กลับไปที่ textarea หลังฟังจบ (ถ้ายังไม่มีข้อความ)
            if (!question && document.getElementById('question')) {
                 document.getElementById('question').focus();
            } else if (question && question !== "กำลังฟัง... พูดได้เลยค่ะ 🎤") {
                // ถ้ามีข้อความแล้ว ให้เรียก handleSubmit อัตโนมัติ
                handleSubmit();
            }
        };

        recognition.start(); // เริ่มฟังเสียง
    };
    
    // จัดการตะกร้าสินค้า (นี่คือจุดที่เกิด Error)
    const handleOrderClick = (menuDataFromRec) => {
        // ข้อมูลที่เข้ามาควรจะถูก "ทำความสะอาด" มาแล้วจาก handleSubmit
        if (!menuDataFromRec || typeof menuDataFromRec !== 'object' || menuDataFromRec.menuId === null || menuDataFromRec.menuId === undefined) { 
             console.error("ChatPage: Invalid cleaned menu data in handleOrderClick (missing ID):", menuDataFromRec);
            alert("เกิดข้อผิดพลาด: ข้อมูลเมนูไม่สมบูรณ์ (ไม่มี ID)");
            return;
        }
        console.log("ChatPage: handleOrderClick called with cleaned menu:", menuDataFromRec);
        
        // [DEBUG] ตรวจสอบว่า "เมนูหลัก" มีของหรือไม่
        // *** นี่คือจุดที่สำคัญที่สุด ถ้าตรงนี้ยัง EMPTY แปลว่า Supabase/RLS มีปัญหา ***
        if (!Array.isArray(allMenuItems) || allMenuItems.length === 0) {
             console.error("ChatPage: allMenuItems is EMPTY. Cannot add item. Check Supabase connection and RLS Policy.");
             alert("ข้อผิดพลาด: ข้อมูลเมนูหลักยังโหลดไม่เสร็จ (allMenuItems is empty). กรุณาตรวจสอบการเชื่อมต่อ Supabase, RLS Policy (ต้องเป็น anon, SELECT, using true) และรีสตาร์ทเซิร์ฟเวอร์");
             return; // หยุดทำงานทันที ถ้าเมนูหลักว่าง
        }
        
        // นี่คือ "ยาม" ที่หาเมนูในเมนูหลัก
        const menuToAdd = allMenuItems.find(item => 
            // เปรียบเทียบ ID เป็น String เพื่อความแน่นอน
            String(item.menuId) === String(menuDataFromRec.menuId)
        );
        
        if (menuToAdd) {
             console.log("ChatPage: Found matching menu in allMenuItems:", menuToAdd);
             // ใช้ข้อมูลจาก allMenuItems เพื่อความถูกต้อง 100% (เผื่อ AI ส่งราคาผิดมา)
            _updateCart(menuToAdd); 
        } else {
             // ถ้าหาไม่เจอจริงๆ (ซึ่งไม่ควรเกิดขึ้นถ้า allMenuItems โหลดมาครบ)
             console.warn("ChatPage: Menu ID from AI not found in allMenuItems (this shouldn't happen if fetch was successful):", menuDataFromRec);
             alert(`ขออภัยค่ะ ไม่พบข้อมูลสำหรับเมนู ID "${menuDataFromRec.menuId}" ในรายการเมนูหลักของร้าน`);
        }
    };
    
    // ฟังก์ชันภายในสำหรับอัปเดต State ตะกร้า
    const _updateCart = (menuToAdd) => {
        setCartItems(prevItems => {
             // ตรวจสอบ prevItems ให้แน่ใจว่าเป็น Array
             const currentCart = Array.isArray(prevItems) ? prevItems : [];
             console.log("ChatPage: Updating cart. Previous items:", currentCart, "Adding:", menuToAdd);
             
             // ตรวจสอบข้อมูล menuToAdd อีกครั้งก่อนเพิ่มจริง
             if (!menuToAdd || typeof menuToAdd !== 'object' || menuToAdd.menuId === null || menuToAdd.menuId === undefined || !menuToAdd.menuName || typeof menuToAdd.menuPrice !== 'number') {
                  console.error("ChatPage: Invalid menuToAdd data passed to _updateCart:", menuToAdd);
                  alert("เกิดข้อผิดพลาดภายใน: ข้อมูลเมนูที่จะเพิ่มลงตะกร้าไม่สมบูรณ์");
                  return currentCart; // คืนค่าเดิมถ้าข้อมูลไม่ครบ
             }

            const existingItemIndex = currentCart.findIndex(item => item.menuId === menuToAdd.menuId);
            
            let updatedItems;
            if (existingItemIndex > -1) {
                // ถ้ามีอยู่แล้ว ให้อัปเดต quantity
                updatedItems = [...currentCart]; // สร้าง Array ใหม่
                const currentQuantity = updatedItems[existingItemIndex].quantity ?? 0;
                updatedItems[existingItemIndex] = { 
                    ...updatedItems[existingItemIndex], 
                    quantity: currentQuantity + 1 
                };
                console.log(`ChatPage: Increased quantity for menuId ${menuToAdd.menuId}`);
            } else {
                 // ถ้ายังไม่มี ให้เพิ่ม item ใหม่
                 const newItem = { 
                    menuId: menuToAdd.menuId, 
                    menuName: menuToAdd.menuName, 
                    menuPrice: menuToAdd.menuPrice, 
                    // [เพิ่ม] ดึง menuImageUrl จาก allMenuItems มาด้วย
                    menuImageUrl: menuToAdd.menuImageUrl || null, 
                    quantity: 1 
                 };
                 updatedItems = [...currentCart, newItem];
                 console.log(`ChatPage: Added new item to cart:`, newItem);
            }
             console.log("ChatPage: Cart updated state:", updatedItems);
             return updatedItems; // คืนค่าตะกร้าที่อัปเดตแล้ว
        });
    };
    
    // ฟังก์ชัน handleSubmit ที่เรียก API Route (Backend)
    // เพิ่ม Parameter 'textFromSpeech' สำหรับกรณีเรียกจาก handleListen
    const handleSubmit = async (textFromSpeech = null) => {
        // ใช้ textFromSpeech ถ้ามี, หรือใช้ question จาก state ถ้าไม่มี
        const currentQuestion = textFromSpeech || question;
        
        // ตรวจสอบว่ามีคำถามจริงๆ หรือไม่
        if (!currentQuestion.trim() || currentQuestion === "กำลังฟัง... พูดได้เลยค่ะ 🎤") {
            // ถ้าไม่มีคำถามจาก Speech และ state ก็ว่าง ให้ focus เฉยๆ
            if (!textFromSpeech && document.getElementById('question')) {
                 document.getElementById('question').focus();
            }
            return; 
        }
        
        setIsLoading(true); // เริ่ม Loading
        setAnswer("กำลังคิดเมนูให้ค่าสุดหล่อ รอสักครู่น้า ✨"); // แสดงข้อความรอ
        setRecommendedMenus([]); // เคลียร์เมนูแนะนำเก่า

        // สร้าง menuContext จาก allMenuItems (ถ้ามี)
        let menuContext = "Here is the cafe's menu from the database:\n";
        if (Array.isArray(allMenuItems) && allMenuItems.length > 0) {
            allMenuItems.forEach(item => {
                // ส่งเฉพาะข้อมูลที่จำเป็นไปให้ AI
                menuContext += `- ID: ${item.menuId}, Name: ${item.menuName}, Price: ${item.menuPrice} baht.${item.menuDescription ? ` Desc: ${item.menuDescription}` : ''}\n`;
            });
        } else {
            // เตือนถ้า allMenuItems ว่างเปล่า (สำคัญมาก!)
            console.warn("ChatPage: handleSubmit - allMenuItems is empty! AI will lack menu context. Check Supabase fetch and RLS.");
            menuContext += "- No menu items loaded from database. Please inform the user if asked about the menu.\n";
        }
        
        // Endpoint ของ API Route (Backend)
        const API_ENDPOINT = '/api/chat'; 
        console.log(`ChatPage: Submitting to ${API_ENDPOINT} with question: "${currentQuestion}"`); 
        
        try {
            // เรียก Backend API Route
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: currentQuestion, menuContext }) // ส่งคำถามและเมนูไป
            });
             
             // อ่าน Response เป็น Text ก่อนเผื่อไม่ใช่ JSON
             const responseBody = await response.text();
             console.log(`ChatPage: Raw response from ${API_ENDPOINT}:`, responseBody);

            // ตรวจสอบว่า API ตอบกลับมาสำเร็จหรือไม่ (status 2xx)
            if (!response.ok) {
                 // พยายาม Parse error message จาก Backend
                 try {
                     const errorData = JSON.parse(responseBody);
                     // ใช้ error message จาก Backend ถ้ามี, ถ้าไม่มีใช้ status code
                     throw new Error(errorData.error || `API call failed with status: ${response.status}`);
                 } catch (parseError) {
                      // ถ้า Parse ไม่ได้ แสดง status และ response ดิบๆ
                      throw new Error(`API call failed with status: ${response.status}. Response: ${responseBody}`);
                 }
            }

            // ถ้าสำเร็จ พยายาม Parse JSON ที่ Backend ส่งกลับมา
            let data;
            try {
                data = JSON.parse(responseBody);
            } catch (e) {
                console.error(`ChatPage: Failed to parse JSON from ${API_ENDPOINT} response body:`, e, "Raw Body:", responseBody);
                throw new Error("ไม่สามารถประมวลผลคำตอบจาก Server ได้ (Invalid JSON format)");
            }
             
            // ดึง responseText ที่ Backend เตรียมไว้ให้
            const { responseText } = data;
             console.log(`ChatPage: Parsed responseText from ${API_ENDPOINT}:`, responseText);
            
            // ตรวจสอบว่ามี responseText จริงๆ หรือไม่
            if (responseText) {
                // พยายามหา JSON string ที่สมบูรณ์ใน responseText
                const jsonMatch = responseText.trim().match(/^\{[\s\S]*\}$/); 
                if (jsonMatch) {
                    // ถ้าเจอ JSON string
                    try {
                        const parsedAIResponse = JSON.parse(jsonMatch[0]);
                         console.log("ChatPage: Parsed AI JSON response:", parsedAIResponse); 
                         
                         // อัปเดตข้อความที่จะแสดง/พูด
                        setAnswer(parsedAIResponse.text || "นี่คือเมนูที่แนะนำค่ะ (แต่ไม่มีข้อความ)");
                        
                        // --- นี่คือส่วน "ทำความสะอาด" ข้อมูล ---
                        let cleanRecommendations = [];
                        if (Array.isArray(parsedAIResponse.recommendations)) {
                            cleanRecommendations = parsedAIResponse.recommendations.map(menu => {
                                // ตรวจสอบ menu object ก่อนเข้าถึง property
                                if (!menu || typeof menu !== 'object') return null; 
                                
                                // แปลง Key และตรวจสอบ Type
                                const cleanedMenu = {
                                    // ใช้ ?? เพื่อหาค่าจาก Key ที่เป็นไปได้, ถ้าไม่มีเลยให้เป็น null
                                    menuId: menu.menuId ?? menu.item_id ?? null, 
                                    menuName: menu.menuName ?? menu.name ?? 'Unknown Menu', 
                                    menuPrice: menu.menuPrice ?? menu.price ?? null 
                                };

                                // ตรวจสอบ Type ของ Price ถ้าไม่ใช่ number ให้เป็น null
                                if (typeof cleanedMenu.menuPrice !== 'number') {
                                    cleanedMenu.menuPrice = null;
                                }

                                return cleanedMenu;

                            }).filter(menu => 
                                // กรองเอาเฉพาะอันที่ไม่ใช่ null และมี menuId ที่ถูกต้อง
                                menu !== null && menu.menuId !== null && menu.menuId !== undefined
                            ); 
                        }
                        
                        // เก็บข้อมูล recommendations ที่ "สะอาด" แล้วเข้า State
                        setRecommendedMenus(cleanRecommendations); 
                        console.log("ChatPage: Set cleaned recommendations:", cleanRecommendations);
                        
                    } catch (e) {
                         // ถ้า Parse JSON จาก AI ไม่สำเร็จ
                         console.error("ChatPage: AI JSON Parsing Error:", e, "Raw AI Response:", responseText);
                        setAnswer("ขออภัยค่ะ AI ตอบกลับมาในรูปแบบ JSON ที่ไม่ถูกต้อง");
                         setRecommendedMenus([]);
                    }
                } else {
                    // ถ้า responseText ไม่ใช่ JSON
                    setAnswer(responseText); // แสดงข้อความธรรมดา
                     setRecommendedMenus([]); // ไม่มีเมนูแนะนำ
                     console.log("ChatPage: AI response was not JSON format.");
                }
            } else {
                // ถ้า Backend ไม่ได้ส่ง responseText กลับมา
                 if (data?.error) { // ตรวจสอบว่า Backend ส่ง error message มาหรือไม่
                     setAnswer(`เกิดข้อผิดพลาดจาก Server: ${data.error}`);
                 } else {
                     setAnswer("ขออภัยค่ะ ไม่ได้รับคำตอบ (responseText) จาก Server");
                 }
                 setRecommendedMenus([]);
                 console.warn("ChatPage: No responseText received from API route:", data);
            }
        } catch (error) {
            // ถ้าเกิด Error ระหว่างการ fetch หรือการประมวลผล
            console.error("ChatPage: Error in handleSubmit:", error); 
            setAnswer(`เกิดข้อผิดพลาดในการสื่อสารกับ AI: ${error.message}`); // แสดง error message ที่ User เข้าใจได้
             setRecommendedMenus([]); // เคลียร์เมนูแนะนำ
        } finally {
            setIsLoading(false); // หยุด Loading เสมอ ไม่ว่าจะสำเร็จหรือล้มเหลว
             // ล้างคำถาม ถ้าเป็นการเรียกจาก Speech-to-Text
             if (textFromSpeech) {
                  setQuestion(''); 
             }
        }
    };

    // --- ส่วน Return (UI) ---
    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto p-4 sm:p-8 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-[#4A3728] font-bold text-3xl tracking-tight">Barista สำหรับสุดหล่อ</h1>
                    <p className="text-[#4A3728] font-bold">พร้อมแนะนำเมนูโปรดให้สุดหล่อ</p>
                </div>
                {/* Today's Special */}
                <div className="bg-[#4A3728] p-6 rounded-xl mb-8 border-l-4 border-[#4A3728]">
                     <h2 className="text-2xl font-bold text-white mb-2">Today&apos;s Special</h2>
                     <p className="text-white mb-4">&quot;Iced Oat Milk Hazelnut Latte&quot; ความหอมของเฮเซลนัทผสมผสานกับความนุ่มของนมโอ๊ตอย่างลงตัว</p>
                     <button 
                        onClick={() => setQuestion("ขอลอง Iced Oat Milk Hazelnut Latte ครับ")}
                        className="bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-5 rounded-full transition-colors duration-300 text-sm">
                        ถามเกี่ยวกับเมนูนี้
                     </button>
                </div>

                {/* Input Section */}
                <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg mb-8">
                    <label htmlFor="question" className="block text-white font-bold mb-6">What can I get started for you?</label>
                    <textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        rows="3"
                        placeholder="e.g., I&apos;m looking for a smooth, non-acidic coffee..."
                        disabled={isLoading || isListening} // ปิดใช้งานขณะโหลดหรือฟัง
                        // [เพิ่ม] กด Enter เพื่อส่งคำถาม (ถ้าไม่ใช้ Speech)
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isListening) {
                                e.preventDefault(); // ป้องกันการขึ้นบรรทัดใหม่
                                handleSubmit();
                            }
                        }}
                    />
                    {/* Quick Buttons */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => setQuestion("มีเมนูอะไรใหม่บ้าง?")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">มีอะไรใหม่?</button>
                        <button onClick={() => setQuestion("แนะนำกาแฟไม่เปรี้ยวหน่อย")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">กาแฟไม่เปรี้ยว</button>
                        <button onClick={() => setQuestion("เครื่องดื่มที่ไม่ใช่กาแฟมีอะไรบ้าง?")} className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition">ไม่ใช่กาแฟ</button>
                    </div>
                    {/* Submit and Listen Buttons */}
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            onClick={() => handleSubmit()} // เรียก handleSubmit โดยไม่มี argument
                            disabled={isLoading || !question.trim() || isListening} // เงื่อนไขปิดใช้งาน
                            className="w-full bg-green-800 hover:bg-green-900 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-md transform hover:scale-105 disabled:bg-gray-400 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Brewing your answer...' : '✨ Ask Barista'}
                        </button>
                        <button
                            onClick={handleListen} // เรียกฟังก์ชันเริ่มฟัง
                            disabled={isLoading || isListening} // ปิดใช้งานขณะโหลดหรือฟังอยู่
                            className={`p-3 rounded-full transition-colors duration-300 ${isListening ? 'bg-red-600 animate-pulse' : 'bg-white/20 hover:bg-white/30'} disabled:bg-gray-400 disabled:cursor-not-allowed`}
                            title="สั่งงานด้วยเสียง"
                        >
                            {/* Microphone Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Recommendation Section */}
                <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg min-h-[100px] mb-8">
                    {/* AI Answer Display */}
                    <div className="flex items-start space-x-4">
                         <div className="bg-green-800 rounded-full p-2 flex-shrink-0">
                            {/* Chat Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8z" />
                            </svg>
                        </div>
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-white mb-2">Here&apos;s my recommendation:</h2>
                            {/* แสดงข้อความคำตอบ (อาจมี Markdown ถ้า AI ใส่มา) */}
                            <div className="text-white whitespace-pre-wrap prose prose-invert">{answer}</div>
                        </div>
                    </div>
                    {/* Display Recommended Menus */}
                    {/* ตรวจสอบ recommendedMenus ก่อน map */}
                    {Array.isArray(recommendedMenus) && recommendedMenus.length > 0 && (
                        <div className="mt-6 border-t border-white/20 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Just for you:</h3>
                            <div className="space-y-3">
                                {recommendedMenus.map((menu, index) => (
                                    // ใช้ menu.menuId ที่ "สะอาด" แล้วเป็น key
                                    <div key={menu.menuId || index} className="bg-white/10 p-4 rounded-lg border border-white/20 flex items-center justify-between transition hover:shadow-md hover:border-green-500">
                                        {/* แสดงข้อมูลเมนู */}
                                        <div>
                                            {/* ใช้ menuName ที่ "สะอาด" แล้ว */}
                                            <p className="font-bold text-white">{menu.menuName || 'Unknown Menu'}</p>
                                            {/* ใช้ menuPrice ที่ "สะอาด" แล้ว */}
                                            <p className="text-sm text-gray-300">{typeof menu.menuPrice === 'number' ? `${menu.menuPrice.toFixed(2)} บาท` : 'Price unavailable'}</p>
                                        </div>
                                        {/* ปุ่ม Add */}
                                        <button 
                                            // ส่ง menu object ที่ "สะอาด" แล้วไปให้ handleOrderClick
                                            onClick={() => handleOrderClick(menu)} 
                                            // ปุ่ม Add จะกดได้ต่อเมื่อมีข้อมูลครบและถูกต้อง
                                            disabled={!menu.menuId || !menu.menuName || typeof menu.menuPrice !== 'number'}
                                            className="bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-5 rounded-full transition-colors duration-300 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Summary Section */}
                <div className="bg-[#4A3728] p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Your Order</h2>
                    {/* แสดง Loading ขณะรอโหลดตะกร้าครั้งแรก */}
                    {isInitialMount.current ? (
                         <p className="text-center text-gray-300 py-4">กำลังโหลดรายการในตะกร้า...</p>
                    // ตรวจสอบ cartItems ก่อนแสดงผล
                    ) : Array.isArray(cartItems) && cartItems.length > 0 ? (
                        <>
                            {/* รายการสินค้าในตะกร้า */}
                            <div className="space-y-3 mb-4">
                                {cartItems.map(item => (
                                    <div key={item.menuId} className="flex justify-between items-center">
                                        {/* ใช้ ?? fallback เผื่อข้อมูลไม่ครบ */}
                                        <p className="text-white">{item.menuName ?? 'Unknown Item'} <span className="text-sm text-gray-300">x {item.quantity ?? 0}</span></p>
                                        <p className="font-semibold text-white">{((item.menuPrice ?? 0) * (item.quantity ?? 0)).toFixed(2)} บาท</p>
                                    </div>
                                ))}
                            </div>
                            {/* สรุปยอดรวม */}
                            <div className="border-t border-white/20 pt-4 flex justify-between items-center">
                                <p className="text-lg font-bold text-white">Total</p>
                                <p className="text-lg font-bold text-white">{totalPrice.toFixed(2)} บาท</p>
                            </div>
                            {/* ปุ่ม Actions */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                {/* ปุ่มสั่งเพิ่ม */}
                                <button onClick={() => document.getElementById('question')?.focus()} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full transition">สั่งเพิ่มกับ AI</button>
                                {/* ปุ่มไปหน้า Checkout */}
                                {/* เอา legacyBehavior ออก */}
                                <Link href="/basket" className="w-full">
                                    <button className="w-full bg-green-800 hover:bg-green-900 text-white font-bold py-3 rounded-full transition">Checkout</button>
                                </Link>
                            </div>
                        </>
                    ) : (
                        // ถ้าตะกร้าว่าง
                        <p className="text-center text-gray-300 py-4">ตะกร้าของคุณยังว่างอยู่</p>
                    )}
                </div>
            </div>
        </div>
    );
}

