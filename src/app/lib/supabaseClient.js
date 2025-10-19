import { createClient } from '@supabase/supabase-js'

// --- DEBUGGING ---
// ใส่ console.log เพื่อเช็คค่าตัวแปรที่อ่านได้จาก .env.local
console.log("--- DEBUG START ---");
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Supabase Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log("--- DEBUG END ---");
// -------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// เราจะเพิ่มการตรวจสอบค่าก่อนส่ง
if (!supabaseUrl) {
  console.error("ERROR: supabaseUrl is missing. Check .env.local file.");
}
if (!supabaseAnonKey) {
  console.error("ERROR: supabaseAnonKey is missing. Check .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)