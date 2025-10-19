// หน้านี้ต้องเป็น Client Component เพื่อตรวจสอบสถานะการล็อกอิน
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // import Supabase client ของเรา

// --- ส่วนที่ 1: Component สำหรับ "สมาชิกที่ล็อกอินแล้ว" ---
const MemberDashboard = ({ user, profile, onLogout }) => {
    // (ข้อมูลจำลองสำหรับประวัติการสั่งซื้อ)
    const mockOrderHistory = [
        { id: '#A-1025', date: '19 ต.ค. 2568', items: 'Dirty Coffee, ครัวซองต์', total: 165 },
        { id: '#A-1011', date: '18 ต.ค. 2568', items: 'Americano น้ำส้ม', total: 80 },
    ];

    return (
        <div className="container mx-auto max-w-4xl p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    {/* ถ้ามีชื่อจาก Google จะแสดงชื่อ, ถ้าไม่มีจะแสดงอีเมล */}
                    สวัสดี, <span className="text-amber-600">{profile.fullName || user.email}!</span>
                </h1>
                <button
                    onClick={onLogout}
                    className="text-sm text-red-600 hover:text-red-800 font-semibold py-2 px-4 rounded-lg bg-red-100 hover:bg-red-200"
                >
                    ออกจากระบบ
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* --- คอลัมน์ซ้าย: โปรไฟล์และคะแนน --- */}
                <aside className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">คะแนนสะสม</h2>
                        <p className="text-5xl font-bold text-amber-500">
                            ⭐ {profile.loyaltyPoints}
                        </p>
                        <p className="text-gray-500 mt-1">คะแนน</p>
                    </div>
                    {/* (เราสามารถเพิ่มการ์ด "สิทธิพิเศษ" ที่นี่โดยอิงจากรูป Mezzo) */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">แลกคะแนน</h2>
                        <ul className="space-y-3 text-gray-700">
                            <li><strong>40 คะแนน:</strong> แลกเครื่องดื่ม ร้อน/เย็น (เล็ก)</li>
                            <li><strong>50 คะแนน:</strong> แลกเครื่องดื่มปั่น (เล็ก)</li>
                            <li><strong>60 คะแนน:</strong> แลกเครื่องดื่มปั่น (ใหญ่)</li>
                        </ul>
                    </div>
                </aside>
                
                {/* --- คอลัมน์ขวา: ประวัติการสั่งซื้อ --- */}
                <main className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-5">ประวัติการสั่งซื้อ</h2>
                        <div className="space-y-4">
                            {mockOrderHistory.length === 0 ? (
                                <p className="text-gray-500">คุณยังไม่มีประวัติการสั่งซื้อ</p>
                            ) : (
                                mockOrderHistory.map((order) => (
                                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                                        <p className="font-bold text-gray-800">{order.id} - <span className="font-normal text-gray-500">{order.date}</span></p>
                                        <p className="text-gray-600 text-sm mt-1">{order.items}</p>
                                        <p className="text-right font-bold text-lg text-amber-600 mt-1">{order.total} ฿</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

// --- ส่วนที่ 2: Component สำหรับ "ลูกค้าทั่วไป" (ยังไม่ล็อกอิน) ---
const GuestLandingPage = ({ onLogin }) => {
    return (
        <div className="container mx-auto max-w-3xl p-4 md:p-8 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-4">
                สมัครสมาชิก MyCafe ฟรี!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                สะสมคะแนนจากทุกยอดการสั่งซื้อ เพื่อแลกรับเครื่องดื่มและสิทธิพิเศษมากมาย
            </p>

            {/* --- ส่วนแสดงสิทธิประโยชน์ (อิงจากรูป Mezzo) --- */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-amber-200 mb-8">
                <div className="mb-4">
                    <span className="inline-block bg-amber-500 text-white text-2xl font-bold px-6 py-2 rounded-full shadow">
                        ทุก 25 บาท = 1 คะแนน
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-bold text-amber-600">40 คะแนน</h3>
                        <p className="text-sm text-gray-700">แลกเครื่องดื่ม ร้อน/เย็น (เล็ก)</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-bold text-amber-600">50 คะแนน</h3>
                        <p className="text-sm text-gray-700">แลกเครื่องดื่มปั่น (เล็ก)</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-bold text-amber-600">60 คะแนน</h3>
                        <p className="text-sm text-gray-700">แลกเครื่องดื่มปั่น (ใหญ่)</p>
                    </div>
                </div>
            </div>

            {/* --- ปุ่ม Call to Action (CTA) --- */}
            <button
                onClick={onLogin}
                className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
                {/* (เราสามารถเพิ่มไอคอน Google G ได้ทีหลัง) */}
                สมัคร / เข้าสู่ระบบด้วย Google
            </button>
            <p className="text-gray-500 text-sm mt-4">
                สมัครสมาชิกง่ายๆ ใน 10 วินาที ไม่ต้องใช้รหัสผ่าน
            </p>
        </div>
    );
};


// --- ส่วนที่ 3: Component หลัก (ตัวควบคุม) ---
export default function MemberPage() {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. ตรวจสอบ session ปัจจุบันทันทีเมื่อหน้าโหลด
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                await fetchProfile(session.user);
            }
            setLoading(false);
        };

        fetchSession();

        // 2. คอยดักฟังการเปลี่ยนแปลงสถานะ (เช่น ล็อกอินสำเร็จ, ล็อกเอาท์)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                if (session) {
                    await fetchProfile(session.user);
                } else {
                    setProfile(null); // เคลียร์โปรไฟล์เมื่อล็อกเอาท์
                }
            }
        );

        // คืนค่าเพื่อยกเลิกการดักฟังเมื่อ component ถูกปิด
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // ฟังก์ชันสำหรับดึงข้อมูลโปรไฟล์ (คะแนนสะสม) จากตาราง profiles
    const fetchProfile = async (user) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error.message);
        }
    };

    // ฟังก์ชันสำหรับการล็อกอิน (เรียกใช้ Google Auth)
    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin, // ให้ Google ส่งกลับมาที่หน้าปัจจุบัน
            },
        });
    };

    // ฟังก์ชันสำหรับการล็อกเอาท์
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    // --- แสดงผลตามสถานะ ---
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
                // ถ้าล็อกอินแล้ว และมีโปรไฟล์ -> แสดง Dashboard
                <MemberDashboard user={session.user} profile={profile} onLogout={handleLogout} />
            ) : (
                // ถ้ายังไม่ล็อกอิน -> แสดงหน้าเชิญชวน
                <GuestLandingPage onLogin={handleLogin} />
            )}
        </div>
    );
}