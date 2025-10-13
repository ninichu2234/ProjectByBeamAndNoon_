import { createClient } from "@supabase/supabase-js";

// แก้ไข 2 บรรทัดนี้ให้ถูกต้อง
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);