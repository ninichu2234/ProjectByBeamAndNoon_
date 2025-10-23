// src/lib/supabaseClient.js

// ‼️ แก้ไข: เปลี่ยนมาใช้ createBrowserClient จาก @supabase/ssr
import { createBrowserClient } from '@supabase/ssr'

// ดึงค่า URL และ Key มาจาก Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ‼️ แก้ไข: สร้าง client ด้วย createBrowserClient()
// นี่คือ "เวอร์ชันที่ฉลาด" ที่สามารถอ่าน/เขียน "คุกกี้" session
// ใน Next.js App Router ได้

export const supabase = createBrowserClient(supabaseUrl, supabaseKey)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
