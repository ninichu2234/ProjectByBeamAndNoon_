// src/app/member/page.js
// ‼️ ฉบับแก้ไข "กันเหนียว" (Robust) ‼️

"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; 

// --- (ส่วน MemberDashboard และ GuestLandingPage เหมือนเดิม) ---
const MemberDashboard = ({ user, profile, onLogout }) => {
    // ... (โค้ดเหมือนเดิม) ...
    const mockOrderHistory = [];
    return (
        <div className="container mx-auto max-w-4xl p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    สวัสดี, <span className="text-amber-600">{profile?.fullName || user.email}!</span>
                </h1>
                <button onClick={onLogout} className="text-sm text-red-600 hover:text-red-800 font-semibold py-2 px-4 rounded-lg bg-red-100 hover:bg-red-200">
                    ออกจากระบบ
                </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <aside className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">คะแนนสะสม</h2>
                        <p className="text-5xl font-bold text-amber-500">
                            ⭐ {profile?.loyaltyPoints || 0}
                        </p>
                        <p className="text-gray-500 mt-1">คะแนน</p>
                    </div>
                </aside>
                <main className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-5">ประวัติการสั่งซื้อ</h2>
                        <div className="space-y-4">
                            {mockOrderHistory.map((order) => (
                                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                                    <p className="font-bold text-gray-800">{order.id} - <span className="font-normal text-gray-500">{order.date}</span></p>
                                    <p className="text-gray-600 text-sm mt-1">{order.items}</p>
                                    <p className="text-right font-bold text-lg text-amber-600 mt-1">{order.total} ฿</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
const GuestLandingPage = ({ onLogin }) => { 
    // ... (โค้ดเหมือนเดิม) ...
    return (
        <div className="container mx-auto max-w-3xl p-4 md:p-8 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-4">
                สมัครสมาชิก MyCafe ฟรี!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                สะสมคะแนนจากทุกยอดการสั่งซื้อ เพื่อแลกรับเครื่องดื่มและสิทธิพิเศษมากมาย
            </p>
            <div className="bg-white p-6 rounded-xl shadow-md border border-amber-200 mb-8">
                <div className="mb-4">
                    <span className="inline-block bg-amber-500 text-white text-2xl font-bold px-6 py-2 rounded-full shadow">
                        ทุก 25 บาท = 1 คะแนน
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div className="p-4 bg-gray-50 rounded-lg"><h3 className="font-bold text-amber-600">40 คะแนน</h3><p className="text-sm text-gray-700">แลกเครื่องดื่ม ร้อน/เย็น (เล็ก)</p></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><h3 className="font-bold text-amber-600">50 คะแนน</h3><p className="text-sm text-gray-700">แลกเครื่องดื่มปั่น (เล็ก)</p></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><h3 className="font-bold text-amber-600">60 คะแนน</h3><p className="text-sm text-gray-700">แลกเครื่องดื่มปั่น (ใหญ่)</p></div>
                </div>
            </div>
            <button onClick={onLogin} className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                สมัคร / เข้าสู่ระบบด้วย Google
            </button>
            <p className="text-gray-500 text-sm mt-4">สมัครสมาชิกง่ายๆ ใน 10 วินาที ไม่ต้องใช้รหัสผ่าน</p>
        </div>
    );
};
// --- (จบส่วน Component ย่อย) ---


// --- ส่วนที่ 3: Component หลัก (ตัวควบคุม) ---
export default function MemberPage() {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // (ส่วน fetchSession เหมือนเดิม)
        const fetchSession = async () => {
            try { 
                console.log("MemberPage: กำลังตรวจสอบ session...");
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                if (session) {
                    console.log("MemberPage: ✅ เจอ Session!", session.user.id);
                    await fetchProfile(session.user);
                } else {
                    console.log("MemberPage: ⛔️ ไม่เจอ Session (null)");
                }
            } catch (error) { 
                console.error("MemberPage: ⛔️ เกิด Error ใน fetchSession:", error);
            } finally { 
                console.log("MemberPage: 🏁 fetchSession จบการทำงาน, setLoading(false)");
                setLoading(false); 
            }
        };
        fetchSession();

        // ‼️‼️ นี่คือส่วนที่แก้ไข ‼️‼️
        // เพิ่ม try...finally... ให้นักดักฟัง
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                console.log("MemberPage: 🔄 สถานะ Auth เปลี่ยนแปลง!", session);
                setSession(session);
                if (session) {
                    setLoading(true); // กลับไปหน้า loading แป๊บนึง
                    try {
                        await fetchProfile(session.user);
                    } catch (error) {
                        console.error("MemberPage: ⛔️ Error ตอนดึง profile ใน onAuthStateChange", error);
                    } finally {
                        setLoading(false); // ‼️‼️ รับประกันว่า loading จะหายไปเสมอ ‼️‼️
                    }
                } else {
                    setProfile(null); 
                }
            }
        );
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []); // ‼️ แก้ไข: เอา [] ว่างๆ กลับมา

    // (ฟังก์ชัน fetchProfile เหมือนเดิม)
    const fetchProfile = async (user) => {
        try {
            console.log("MemberPage: กำลังดึง Profile ของ user...", user.id);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (error) throw error;
            if (data) {
                console.log("MemberPage: ✅ เจอ Profile!", data);
                setProfile(data);
            } else {
                console.log("MemberPage: ⛔️ ไม่เจอ Profile (data is null)");
                setProfile(null);
            }
        } catch (error) {
            console.error('MemberPage: ⛔️ Error fetching profile:', error.message);
            setProfile(null);
        }
    };

    // (ฟังก์ชัน handleLogin และ handleLogout เหมือนเดิม)
    const handleLogin = async () => {
        console.log("MemberPage: กำลังพยายามล็อกอินด้วย Google...");
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/member`, 
            },
        });
    };
    const handleLogout = async () => {
        console.log("MemberPage: กำลังล็อกเอาท์...");
        await supabase.auth.signOut();
    };

    // (ส่วน return เหมือนเดิม)
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-lg">กำลังตรวจสอบสถานะ...</p>
            </div>
        );
    }
    return (
        <div className="bg-gray-50 min-h-screen py-8">
            {session && profile ? (
                <MemberDashboard user={session.user} profile={profile} onLogout={handleLogout} />
            ) : (
                <GuestLandingPage onLogin={handleLogin} />
            )}
        </div>
    );
}