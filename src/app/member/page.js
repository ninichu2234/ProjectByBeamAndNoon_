"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import NextImage from 'next/image';

// --- (ส่วน MemberDashboard และ GuestLandingPage เหมือนเดิม แต่ MemberDashboard ต้องรับ props เพิ่ม) ---
// ‼️ [แก้ไข] MemberDashboard รับ props orders เพิ่ม ‼️
const MemberDashboard = ({ user, profile, orders, onLogout }) => { 
    // ... (โค้ดแสดง profile, ปุ่ม logout เหมือนเดิม) ...

    return (
        <div className="container mx-auto max-w-4xl p-4 md:p-8">
            {/* ... (ส่วน header และ aside เหมือนเดิม) ... */}
            <header className="mb-8 flex justify-between items-center">
                 <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    Hello, <span className="text-amber-600">{profile?.fullName || user.email}!</span>
                 </h1>
                 <button onClick={onLogout} className="text-sm text-red-600 hover:text-red-800 font-semibold py-2 px-4 rounded-lg bg-red-100 hover:bg-red-200">
                    Log Out
                 </button>
            </header>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <aside className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Loyalty Points</h2>
                        <p className="text-5xl font-bold text-amber-500">
                            ⭐ {profile?.loyaltyPoints || 0}
                        </p>
                        <p className="text-gray-500 mt-1">Point</p>
                    </div>
                 </aside>

            {/* --- ส่วน Main แสดง Order History --- */}
            <main className="md:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-5">Order History</h2>
                    <div className="space-y-4">
                        {/* ‼️ [แก้ไข] เช็ค orders.length และ map ข้อมูลจริง ‼️ */}
                        {orders.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No order history yet.</p>
                        ) : (
                            orders.map((order) => (
                                <div key={order.orderId} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div>
                                        <p className="font-bold text-gray-800">
                                            #{order.orderId} -{' '}
                                            <span className="font-normal text-gray-500">
                                                {new Date(order.orderDateTime).toLocaleDateString('th-TH', {
                                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </p>
                                        <p className="text-gray-600 text-sm mt-1">
                                            Status: {order.orderStatus} ({order.paymentStatus})
                                        </p>
                                        {/* (ถ้าต้องการแสดงรายการสินค้า ต้องดึง orderDetails มาเพิ่ม) */}
                                    </div>
                                    <div className="mt-3 sm:mt-0 text-right">
                                        <p className="font-bold text-lg text-amber-600">{order.totalPrice ? `${parseFloat(order.totalPrice).toFixed(2)} ฿` : '-'}</p>
                                    </div>
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

const GuestLandingPage = ({ onLogin }) => {
    // ... (โค้ดเหมือนเดิม) ...
     return (
        <div className="container mx-auto max-w-3xl p-4 md:p-8 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-4">
                Join MyCafe for Free!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                Collect points from every order to redeem drinks and special privileges.
            </p>
            <div className="mb-8 max-w-md mx-auto"> 
                <NextImage
                    src="https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/Promotion-member.png" 
                    alt="MyCafe Rewards Program"
                    width={900}  
                    height={1200} 
                    className="w-full h-auto rounded-xl shadow-lg" 
                    priority 
                />
            </div>
            <button onClick={onLogin} className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                Sign Up / Log In with Google
            </button>
            <p className="text-gray-500 text-sm mt-4">Sign up easily in 10 seconds. No password required.</p>
        </div>
    );
};
// --- (จบส่วน Component ย่อย) ---


// --- ส่วนที่ 3: Component หลัก (ตัวควบคุม) ---
export default function MemberPage() {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    // ‼️ [เพิ่ม] State สำหรับเก็บ Order History ‼️
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // (ส่วน fetchSession เหมือนเดิม แต่จะเรียก fetchOrders ด้วย)
        const fetchSessionAndData = async () => {
            try {
                console.log("MemberPage: กำลังตรวจสอบ session...");
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                if (session) {
                    console.log("MemberPage: ✅ เจอ Session!", session.user.id);
                    // ‼️ [เพิ่ม] เรียกทั้ง fetchProfile และ fetchOrders ‼️
                    await Promise.all([
                        fetchProfile(session.user),
                        fetchOrders(session.user) // เรียกฟังก์ชันดึง Orders
                    ]);
                } else {
                    console.log("MemberPage: ⛔️ ไม่เจอ Session (null)");
                    setOrders([]); // เคลียร์ orders ถ้า logout
                }
            } catch (error) {
                console.error("MemberPage: ⛔️ เกิด Error ใน fetchSessionAndData:", error);
            } finally {
                console.log("MemberPage: 🏁 fetchSessionAndData จบการทำงาน, setLoading(false)");
                setLoading(false);
            }
        };

        fetchSessionAndData();

        // (ส่วน onAuthStateChange เหมือนเดิม แต่จะเรียก fetchOrders ด้วย)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                console.log("MemberPage: 🔄 สถานะ Auth เปลี่ยนแปลง!", session);
                setSession(session);
                if (session) {
                    setLoading(true);
                    try {
                        // ‼️ [เพิ่ม] เรียกทั้ง fetchProfile และ fetchOrders ‼️
                         await Promise.all([
                             fetchProfile(session.user),
                             fetchOrders(session.user) // เรียกฟังก์ชันดึง Orders
                         ]);
                    } catch (error) {
                        console.error("MemberPage: ⛔️ Error ตอนดึงข้อมูลใน onAuthStateChange", error);
                    } finally {
                        setLoading(false);
                    }
                } else {
                    setProfile(null);
                    setOrders([]); // เคลียร์ orders ถ้า logout
                }
            }
        );
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // (ฟังก์ชัน fetchProfile เหมือนเดิม)
    const fetchProfile = async (user) => {
        try {
            console.log("MemberPage: กำลังดึง Profile ของ user...", user.id);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (error && error.code !== 'PGRST116') throw error; // โยน error ถ้าไม่ใช่ "ไม่พบแถว"
            if (data) {
                console.log("MemberPage: ✅ เจอ Profile!", data);
                setProfile(data);
            } else {
                console.log("MemberPage: ⛔️ ไม่เจอ Profile (data is null)");
                setProfile(null); // ตั้งเป็น null ถ้าไม่เจอจริงๆ
            }
        } catch (error) {
            console.error('MemberPage: ⛔️ Error fetching profile:', error.message);
            setProfile(null); // จัดการ error โดยตั้งเป็น null
        }
    };

    // ‼️ [เพิ่ม] ฟังก์ชันสำหรับดึง Order History ‼️
    const fetchOrders = async (user) => {
        try {
            console.log("MemberPage: กำลังดึง Orders ของ user...", user.id);
            const { data, error } = await supabase
                .from('order') // ชื่อตาราง order
                .select('*') // ดึงคอลัมน์ที่ต้องการ
                .eq('userId', user.id) // กรองเฉพาะของ user คนนี้
                .order('orderDateTime', { ascending: false }); // เรียงจากใหม่สุด

            if (error) throw error;

            console.log("MemberPage: ✅ เจอ Orders!", data);
            setOrders(data || []); // ตั้งค่า state (ถ้าไม่มีข้อมูลให้เป็น array ว่าง)

        } catch (error) {
            console.error('MemberPage: ⛔️ Error fetching orders:', error.message);
            setOrders([]); // จัดการ error โดยตั้งเป็น array ว่าง
        }
    };

    // (ฟังก์ชัน handleLogin และ handleLogout เหมือนเดิม)
    const handleLogin = async () => {
        // ... (โค้ด login) ...
        console.log("MemberPage: กำลังพยายามล็อกอินด้วย Google...");
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/member`,
            },
        });
    };
    const handleLogout = async () => {
        // ... (โค้ด logout) ...
        console.log("MemberPage: กำลังล็อกเอาท์...");
        await supabase.auth.signOut();
        // ไม่ต้อง setProfile/setOrders เป็น null ที่นี่ เพราะ onAuthStateChange จะจัดการให้
    };

    // (ส่วน return เหมือนเดิม แต่ส่ง props orders เพิ่ม)
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-lg">Checking status...</p>
            </div>
        );
    }
    return (
        <div className="bg-gray-50 min-h-screen py-8">
            {session && profile ? (
                // ‼️ [แก้ไข] ส่ง props orders ให้ MemberDashboard ‼️
                <MemberDashboard user={session.user} profile={profile} orders={orders} onLogout={handleLogout} />
            ) : (
                <GuestLandingPage onLogin={handleLogin} />
            )}
        </div>
    );
}