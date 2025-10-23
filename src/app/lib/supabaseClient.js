// src/lib/supabaseClient.js

// ‼️ แก้ไข: เปลี่ยนมาใช้ createBrowserClient จาก @supabase/ssr
import { createBrowserClient } from '@supabase/ssr'

// ดึงค่า URL และ Key มาจาก Environment Variables
const supabaseUrl = 'https://rcrntadwwvhyojmjrmzh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcm50YWR3d3ZoeW9qbWpybXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjU2MzAsImV4cCI6MjA3Mzc0MTYzMH0.sMK4cdz4iB95ZycKg3srZQZm_orBEq45az5pkObPGnA';

// ‼️ แก้ไข: สร้าง client ด้วย createBrowserClient()
// นี่คือ "เวอร์ชันที่ฉลาด" ที่สามารถอ่าน/เขียน "คุกกี้" session
// ใน Next.js App Router ได้

export const supabase = createBrowserClient(supabaseUrl, supabaseKey)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
