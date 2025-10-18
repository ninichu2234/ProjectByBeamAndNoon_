import { NextResponse } from "next/server";
import {supabase} from "../lib/supabaseClient";

export async function GET() {
    const { data } = await supabase
    .from("posts")
    .select("*")
    .order("id", {ascending: false}); //น้อยไปมาก
 return NextResponse.json(data);
}