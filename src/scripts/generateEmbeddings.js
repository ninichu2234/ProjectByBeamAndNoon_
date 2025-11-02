// src/scripts/generateEmbeddings.js

// --- 1. Import เครื่องมือ ---
const { supabase } = require('../app/lib/supabaseClient'); // (ใช้ require เพราะนี่คือ Node.js script)
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

// --- 2. โหลด API Keys จาก .env.local ---
dotenv.config({ path: '.env.local' });

// --- 3. ตั้งค่า Clients ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

// --- 4. ฟังก์ชันหลัก ---
async function generateEmbeddings() {
    console.log("--- เริ่มกระบวนการสร้าง Embeddings ---");

    try {
        // --- 5. ดึงเมนูทั้งหมดจาก Supabase ---
        // (ต้องใช้ชื่อตารางใน "" เพราะมีตัวพิมพ์ใหญ่)
        console.log("กำลังดึงข้อมูลเมนูจาก Supabase...");
        const { data: menuItems, error } = await supabase
            .from("menuItems")
            .select("menuId, menuName, menuDescription, menuCategory, allergens")
            //.is('embedding', null); // (ทางเลือก: ถ้าจะรันซ้ำ ให้ใส่บรรทัดนี้เพื่อทำเฉพาะอันที่ยังว่าง)

        if (error) throw error;

        console.log(`พบเมนูที่ต้องทำ Embedding จำนวน ${menuItems.length} รายการ`);

        // --- 6. วน Loop ทีละเมนู ---
        for (const item of menuItems) {
            // สร้าง "เอกสาร" (Document) ที่อธิบายเมนูนี้
            const document = `เมนู: ${item.menuName}, 
                             ประเภท: ${item.menuCategory}, 
                             รายละเอียด: ${item.menuDescription || 'ไม่มี'}, 
                             สิ่งที่อาจแพ้: ${item.allergens ? item.allergens.join(', ') : 'ไม่มี'}`;
            
            console.log(`\nกำลังสร้าง Embedding สำหรับ: "${item.menuName}"...`);
            
            // --- 7. ส่งไปให้ Google สร้าง Embedding ---
            const result = await embeddingModel.embedContent(document);
            const embedding = result.embedding.values; // นี่คือ Vector (ตัวเลข 768 ตัว)

            // --- 8. อัปเดตกลับเข้า Supabase ---
            const { error: updateError } = await supabase
                .from("menuItems")
                .update({ embedding: embedding })
                .eq("menuId", item.menuId);

            if (updateError) {
                console.error(`  [X] อัปเดตล้มเหลว: ${updateError.message}`);
            } else {
                console.log(`  [✓] บันทึก Embedding สำหรับ "${item.menuName}" เรียบร้อย!`);
            }
        }

        console.log("\n--- กระบวนการสร้าง Embeddings ทั้งหมดเสร็จสมบูรณ์! ---");

    } catch (err) {
        console.error("\n--- เกิดข้อผิดพลาดร้ายแรง ---");
        console.error(err.message);
    }
}

// --- 9. สั่งให้ฟังก์ชันหลักทำงาน ---
generateEmbeddings();