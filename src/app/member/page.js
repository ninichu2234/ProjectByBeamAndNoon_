"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import NextImage from 'next/image';

// --------------------------------------------------------------------------
// (ส่วนที่ 1: MemberDashboard - "ไม่ต้องแก้" - ถูกต้องแล้ว)
// --------------------------------------------------------------------------
const MemberDashboard = ({ user, profile, orders, rewards, onLogout, onRedeem }) => { 
    return (
        <div className="container mx-auto max-w-4xl p-4 md:p-8">
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
                    {/* (กล่องแต้ม) */}
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Loyalty Points</h2>
                        <p className="text-5xl font-bold text-amber-500">
                            ⭐ {profile?.loyaltyPoints || 0}
                        </p>
                        <p className="text-gray-500 mt-1">Point</p>
                    </div>

                    {/* (กล่องแลกแต้ม) */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">🎁 Redeem Rewards</h2>
                        <div className="space-y-4">
                            {rewards.length === 0 ? (
                                <p className="text-gray-500 text-center py-2">No rewards available right now.</p>
                            ) : (
                                rewards.map((reward) => { 
                                    // ‼️ [แก้บั๊กเล็กน้อย] (เช็ค profile?.loyaltyPoints) ‼️
                                    const canRedeem = (profile?.loyaltyPoints || 0) >= reward.points_needed;
                                return ( 
                                        <div key={reward.reward_id} className="border-t border-gray-100 pt-4">
                                            <h3 className="font-bold text-gray-800">{reward.name}</h3>
                                            <p className="text-sm text-gray-500 mb-2">{reward.description}</p>
                                            <p className="font-bold text-amber-600 text-lg mb-3">{reward.points_needed} Points</p>
                                            <button 
                                                onClick={() => onRedeem(reward)}
                                                disabled={!canRedeem} 
                                                className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                                                    canRedeem
                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        > 
                                            {canRedeem ? 'Redeem Now' : 'Not Enough Points'}
                                        </button>                                     
                                    </div>
                                )
                            }))}
                        </div>
                    </div>
                 </aside>

            {/* (ส่วน Order History) */}
            <main className="md:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-5">Order History</h2>
                    <div className="space-y-4">
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

// --------------------------------------------------------------------------
// (ส่วนที่ 2: GuestLandingPage - "ไม่ต้องแก้" - ถูกต้องแล้ว)
// --------------------------------------------------------------------------
const GuestLandingPage = ({ onLogin }) => {
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

// --------------------------------------------------------------------------
// (ส่วนที่ 3: MemberPage Controller - ‼️ "แก้ไข" ‼️ - แก้บั๊ก "Checking status..." + "Syntax Error")
// --------------------------------------------------------------------------
export default function MemberPage() {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);  
    const [orders, setOrders] = useState([]);
    const [rewards, setRewards] = useState([]); 
    const [loading, setLoading] = useState(true); // (สำคัญ: เริ่มที่ "true")

    // ‼️ [แก้ไข] "useEffect" (เวอร์ชันใหม่) ‼️
    // (นี่คือ "วิธีแก้" บั๊ก "Checking status..." ค้าง... โดยการ "รื้อ" ตรรกะ)
    useEffect(() => {
        console.log("MemberPage: 🔄 (เวอร์ชัน 7) กำลังตั้งค่า onAuthStateChange...");

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log(`MemberPage: 📞 Auth Event: ${event}`, session);

                // (ถ้า "เพิ่งล็อกอิน" หรือ "โหลดหน้าครั้งแรก" (ที่ล็อกอินแล้ว))
                // (เพิ่ม 'TOKEN_REFRESHED' เผื่อ)
                if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    if (session) {
                        console.log("MemberPage: ✅ เจอ Session!", session.user.id);
                        setSession(session);
                        
                        try {
                            console.log("MemberPage: ⏳ กำลังดึงข้อมูล (Profile, Orders, Rewards)...");
                            
                            // (เราจะ "รอ" (await) ... ให้ "ทุกอย่าง" เสร็จ...)
                            
                            // (1) ดึง Profile (ด้วย "Retry" Logic... เพราะ "Race Condition")
                            await fetchProfile(session.user);
                            
                            // (2) ดึง Orders
                            await fetchOrders(session.user);
                            
                            // (3) ดึง Rewards
                            await fetchRewards();

                            // ‼️ [แก้ไข Syntax] (แก้ " " ซ้อน " " ) ‼️
                            console.log("MemberPage: ✅ ดึงข้อมูล 'สำเร็จ' (ทุกอย่าง)");

                        } catch (error) {
                            console.error("MemberPage: ⛔️ Error ตอนดึงข้อมูล", error);
                            setProfile(null); // (ถ้า "พัง"... ก็ "เคลียร์")
                            setOrders([]);
                            setRewards([]);
                        } finally {
                            // (ไม่ว่า "สำเร็จ" หรือ "พัง"... "จบ" การโหลด)
                            console.log("MemberPage: 🏁 (ทุกอย่าง) จบการทำงาน, setLoading(false)");
                            setLoading(false); // ‼️ "ปิด" หน้า Checking status...
                        }

                    } else {
                        // (ถ้า 'INITIAL_SESSION' ทำงาน... แต่ "ไม่มี" session (ยังไม่ล็อกอิน))
                        console.log("MemberPage: ⛔️ (ครั้งแรก) ไม่เจอ Session (null)");
                        setSession(null);
                        setProfile(null);
                        setOrders([]);
                        setRewards([]);
                        setLoading(false); // ‼️ "ปิด" หน้า Checking status...
                    }

                // (ถ้า "ล็อกเอาท์")
                } else if (event === 'SIGNED_OUT') {
                    console.log("MemberPage: 🚪 (ล็อกเอาท์)");
                    setSession(null);
                    setProfile(null);
                    setOrders([]);
                    setRewards([]);
                    setLoading(false); // ‼️ "ปิด" หน้า Checking status...
                }
            }
        );

        // (Cleanup listener ตอน unmount)
        return () => {
            console.log("MemberPage: 🧹 (Cleanup) ถอด listener");
            authListener?.subscription.unsubscribe();
        };

    }, []); // (สำคัญ: ให้ useEffect นี้ทำงาน "แค่ครั้งเดียว" ตอนเริ่ม)


    // ‼️ [แก้ไข] "fetchProfile" (เวอร์ชัน "Retry" ... และ "แก้ Syntax Error" แล้ว) ‼️
    // (นี่คือ "วิธีแก้" บั๊ก "Race Condition" (ที่ต้องรีเฟรช))
    
    // (ฟังก์ชันสำหรับ "รอ" (Wait) ... เราจะใช้ใน fetchProfile)
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchProfile = async (user) => {
        try {
            console.log("MemberPage: (รอบ 1) กำลังดึง Profile...", user.id);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            // (เช็ค "Race Condition" (หาไม่เจอ))
            if (error && error.code === 'PGRST116') {
                // "หาไม่เจอ!" (Race condition)
                
                // ‼️ [แก้ไข Syntax] (แก้ " " ซ้อน " " ) ‼️
                console.log("MemberPage: ⏳ (รอบ 1) ไม่เจอ Profile (Trigger ช้า)... กำลัง 'รอ' 2 วินาที แล้ว 'ลองใหม่'...");
                
                // "รอ" 2 วินาที (เพื่อให้ Trigger (หลังบ้าน) ทำงานเสร็จ)
                await sleep(2000); 

                // "ลองใหม่" (Retry) - รอบที่ 2
                console.log("MemberPage: (รอบ 2) กำลังดึง Profile...", user.id);
                const { data: retryData, error: retryError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (retryError) {
                    // "ถ้า "ลองใหม่" แล้วยัง "พัง" ... ค่อย "ยอมแพ้" (โยน Error)
                    console.error("MemberPage: ⛔️ (รอบ 2) ยัง Error!", retryError.message);
                    throw retryError; 
                }

                // (ถ้า "ลองใหม่" แล้ว "สำเร็จ")
                console.log("MemberPage: ✅ (รอบ 2) เจอ Profile!", retryData);
                setProfile(retryData);

            } else if (error) {
                // (ถ้าเป็น Error "อื่นๆ" ... ที่ "ไม่ใช่" Race Condition)
                throw error; // "ยอมแพ้" (โยน Error)
            
            } else if (data) {
                // (ถ้า "สำเร็จ" ตั้งแต่ "รอบแรก")
                console.log("MemberPage: ✅ (รอบ 1) เจอ Profile!", data);
                setProfile(data);
            
            } else {
                // (ไม่ Error แต่ Data ว่างเปล่า)
                console.log("MemberPage: ⛔️ ไม่เจอ Profile (data is null)");
                setProfile(null);
                throw new Error("Profile data was null, but no error was thrown."); // (โยน Error ถ้าหาไม่เจอ)
            }
        } catch (error) {
            console.error('MemberPage: ⛔️ Error ร้ายแรงใน fetchProfile:', error.message);
            setProfile(null); // (เคลียร์ profile ถ้าพัง)
            throw error; // (สำคัญ: "โยน" Error ออกไปให้ useEffect "จับ")
        }
    };


    // (fetchOrders "เหมือนเดิม" ... ไม่ต้องแก้)
    const fetchOrders = async (user) => {
        try {
            console.log("MemberPage: กำลังดึง Orders ของ user...", user.id);
            const { data, error } = await supabase
                .from('order') 
                .select('*') 
                .eq('userId', user.id) 
                .order('orderDateTime', { ascending: false }); 

            if (error) throw error;
            console.log("MemberPage: ✅ เจอ Orders!", data);
            setOrders(data || []); 

        } catch (error) {
            console.error('MemberPage: ⛔️ Error fetching orders:', error.message);
            setOrders([]); 
        }
    };

    // (fetchRewards "เหมือนเดิม" ... (บั๊กแก้ไปแล้ว))
    const fetchRewards = async () => {
        try {
            console.log("MemberPage: กำลังดึง Rewards...");
            const { data, error } = await supabase
                .from('rewards') 
                .select('*') 
                .eq('is_active', true) 
                .order('points_needed', { ascending: true }); // (แก้บั๊ก .order() ให้แล้ว)

            if (error) throw error; 
            console.log("MemberPage: ✅ เจอ Rewards!", data); 
            setRewards(data || []);

        } catch (error) {
            console.error('MemberPage: ⛔️ Error fetching rewards:', error.message);
            setRewards([]); 
        }
    };

    // (handleLogin "เหมือนเดิม" ... ไม่ต้องแก้)
    const handleLogin = async () => {
        console.log("MemberPage: กำลังพยายามล็อกอินด้วย Google...");
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/member`,
            },
        });
    };

    // (handleLogout "เหมือนเดิม" ... ไม่ต้องแก้)
    const handleLogout = async () => {
        console.log("MemberPage: กำลังล็อกเอาท์...");
        await supabase.auth.signOut();
    }; 
    
    // (handleRedeem "เหมือนเดิม" ... (อัปเกรดแล้ว))
    const handleRedeem = async (reward) => { 
        // ‼️ [แก้บั๊กเล็กน้อย] (เช็ค profile?.loyaltyPoints) ‼️
        if (!profile || (profile?.loyaltyPoints || 0) < reward.points_needed) { 
            alert('แลกแต้มไม่สำเร็จ: คุณมีแต้มไม่พอครับ!'); 
            return; 
        } 
        if (!session) { 
            alert('กรุณาล็อกอินก่อนแลกแต้มครับ'); 
            return;
        }
        if (!confirm(`คุณต้องการใช้ ${reward.points_needed} แต้ม เพื่อแลก "${reward.name}" ใช่ไหม?`)) {
            return;
        }

        try {
            console.log(`MemberPage: กำลังเรียก 'redeem_reward' (Reward: ${reward.reward_id}, User: ${session.user.id})...`);
            const { data, error } = await supabase.rpc('redeem_reward', {
                reward_id_to_redeem: reward.reward_id,
                user_id_to_check: session.user.id
            });

            if (error) {
                throw new Error(error.message);
            }
            console.log('MemberPage: ✅ แลกแต้มสำเร็จ!', data);
            alert('ยินดีด้วย! แลกของรางวัลสำเร็จ!'); 
            
            // (อัปเดตแต้มที่หน้าจอ "ทันที" (Optimistic Update))
            setProfile(prevProfile => ({
              ...prevProfile,
              loyaltyPoints: prevProfile.loyaltyPoints - reward.points_needed
            }));

        } catch (e) {
            console.error('MemberPage: ⛔️ แลกแต้มไม่สำเร็จ:', e.message);
             alert(`แลกแต้มไม่สำเร็จ: ${e.message}`);
        }
     };

    // (Loading UI "เหมือนเดิม" ... ไม่ต้องแก้)
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-lg">Checking status...</p>
            </div>
        );
    }

    // (Return JSX "เหมือนเดิม" ... (แต่แก้บั๊ก 'profile' null))
    return (
        <div className="bg-gray-50 min-h-screen py-8">
            {/* ‼️ [แก้บั๊ก] (เพิ่มการ "เช็ค" profile ที่นี่... เผื่อ 'session' จริง แต่ 'profile' พัง) ‼️ */}
            {session && profile ? (
                <MemberDashboard 
                user={session.user} 
                profile={profile} 
                orders={orders}  
                rewards={rewards}
                onLogout={handleLogout}
                onRedeem={handleRedeem} 
                />
            ) : (
                <GuestLandingPage onLogin={handleLogin} />
            )}
        </div>
    );
}