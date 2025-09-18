import {supabase} from "../lib/supabaseClient";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const { data } = await supabase
        .from("posts")
       .select("*")
       .order("id", {ascending: false}); //น้อยไปมาก
       res.status(200).json(data);
    }
}