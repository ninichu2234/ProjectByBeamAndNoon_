"use client";

import {useState, useEffect} from "react";
import {supabase} from "../lib/supabaseClient";

export default function CMS(){
const [posts, setPosts]=useState([]);
const [title, setTitle]= useState("");
const [description, setDescription]= useState(""); //เป็น string
const [errors, setErrors] = useState({});

function formvalidation(title){
    const errors = {};
    if (title.length < 3 || title.length > 100) {
    errors.title = "Title Must be between 3 and 100 characters";
}
setErrors(errors);
return Object.keys(errors).length === 0;
}

useEffect(()=>{
    fetchPosts();
}, []);

async function fetchPosts() {
  const {data} = await supabase
  .from("posts")
  .select("*")
  .order("id", {ascending: false}); //น้อยไปมาก
  setPosts(data);
}

async function addPosts() {
if (!formvalidation(title)) return;
await supabase.from("posts").insert([{ title, description}]);
setTitle("");
setDescription("");
fetchPosts();
}
async function deletePosts() {
    await supabase.from("posts").delete().eq("id", id);
    fetchPosts ();
}


return (
    <>
    <div className="mx-10">
        <h1 className="flex justify-center text-4xl font-bold my-5">
            Post From
        </h1> 

        <div className="flex flex-col gap-2 justify-center">
        <label>Post Title</label>
        <input 
        className="border border-gray-500 rounded-lg px-2 py-1"
        value={title} 
        onChange={(e) => setTitle(e.target.value)} />

        <label>Post Description</label>
        <input 
        className="border border-gray-500 rounded-lg px-2 py-1"
        value={description} 
        onChange={(e) => setDescription(e.target.value)} />
        {errors.title && <p className="text-read-500">{errors.title}</p>}
    </div>

    <button
    className="border-2 border-gray-500 rounded-lg px-2 py-1 cursor-pointer hover:bg-gray-300 my-5"
    onClick={addPosts}>
        Add Posts
    </button>
    </div>
        
    


 <h1 className="flex justify-center text-4xl font-bold my-5">Post Management</h1>
       <div className="grid grid-cols-3 gap-4 mx-10"> 
        {posts.map((post)=>(
            
         <div key={post.id}
         className="border-2 border-gray-500 shadow-lg p-5 rounded-lg">
           <div className="text-xl font-bold my-5">{post.title}</div>
           <div className="text-black line-clamp-2">{post.description}</div>
           <button
           className="border-2 border-red-500 py-1 px-1 cursor-pointer
           hover:bg-fray-300 rounded-lg mt-2 "
           onClick={() => deletePosts(post.id)}>
            Delete
           </button>
         </div>
         
       
       ))}
       </div>
    </>
    );
        }
    
    