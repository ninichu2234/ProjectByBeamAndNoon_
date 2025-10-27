// src/app/page.js
// ‼️ ห้ามมี "use client" ในไฟล์นี้ ‼️

import React, { Suspense } from 'react';
import { supabase } from './lib/supabaseClient'; // 👈 Import Supabase ที่นี่
import HomePageClient from '../component/HomePageClient'; // 👈 Import Client Component ที่เราจะสร้าง


// Component "How It Works" (เหมือนเดิม)
const HowItWorksSection = () => {
    const [activeStep, setActiveStep] = useState(1);
    const timerRef = useRef(null);
    const steps = [ { id: 1, title: '1. คุยกับ AI หรือเลือกเมนู', description: 'บอก AI ว่าคุณอยากดื่มอะไร...', imageUrl: 'https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/step-1.png' }, { id: 2, title: '2. ตรวจสอบและปรับแต่ง', description: 'AI จะเสนอเมนูที่ใช่ให้คุณ...', imageUrl: 'https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/step-2.png' }, { id: 3, title: '3. ชำระเงิน & รอรับที่โต๊ะ', description: 'ชำระเงินออนไลน์ง่ายๆ...', imageUrl: 'https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/step-3.png' } ];
    const startTimer = () => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = setInterval(() => { setActiveStep((prevStep) => (prevStep % 3) + 1); }, 4000); };
    const handleStepClick = (stepId) => { setActiveStep(stepId); startTimer(); };
    useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

    return ( <section className="bg-white py-20 md:py-24 rounded-xl"> <div className="container mx-auto px-6"> <div className="text-center mb-16"> <h2 className="text-3xl md:text-4xl font-bold text-gray-800">ใช้งานง่ายๆ ใน 3 ขั้นตอน</h2> <p className="mt-3 text-gray-600 text-lg"> สั่งเครื่องดื่มแก้วโปรดของคุณได้ง่ายกว่าที่เคย </p> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"> <div className="space-y-6"> {steps.map((step) => ( <div key={step.id} onClick={() => handleStepClick(step.id)} className={`p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer ${activeStep === step.id ? 'bg-amber-50 border-amber-500 shadow-lg' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`} > <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3> <p className="mt-2 text-gray-600">{step.description}</p> </div> ))} </div> <div className="relative w-full h-80 md:h-96"> {steps.map((step) => ( <NextImage key={step.id} src={step.imageUrl} alt={step.title} fill={true} sizes="(max-width: 768px) 100vw, 50vw" className={`absolute inset-0 w-full h-full object-cover rounded-lg shadow-md transition-all duration-500 ease-in-out ${activeStep === step.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`} /> ))} </div> </div> </div> </section> );
};

// Component แสดงสถานะ (แก้ไข .substring)
const OrderStatusBanner = ({ orderData, onDismiss }) => {
    if (!orderData || orderData.id == null || !orderData.orderStatus) return null; // ‼️ เช็ค id ไม่ใช่ null/undefined ‼️

    // ‼️ แปลง ID เป็น String ก่อนใช้ substring ‼️
    const displayId = String(orderData.id).substring(0, 8); // <-- แก้ไขตรงนี้

    const getStatusInfo = (status) => {
         switch (status) {
            case 'กำลังเตรียม': return { text: `ออเดอร์ (${displayId}) กำลังเตรียม`, icon: <ClockIcon />, bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-400' };
            case 'กำลังจัดส่ง': return { text: `ออเดอร์ (${displayId}) กำลังนำไปเสิร์ฟ`, icon: <TruckIcon />, bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-400' };
            case 'จัดส่งแล้ว': return { text: `ออเดอร์ (${displayId}) จัดส่งเรียบร้อย`, icon: <CheckBadgeIcon />, bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-400' };
            // ‼️ แก้ไข default case ด้วย ‼️
            default: return { text: `ออเดอร์ (${displayId}) สถานะ: ${status}`, icon: null, bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-400' };
        }
    };
    const { text, icon, bgColor, textColor, borderColor } = getStatusInfo(orderData.orderStatus);

    return ( <div className={`w-full p-4 rounded-lg shadow-md border-l-4 mb-6 flex items-center justify-between ${bgColor} ${borderColor} ${textColor}`}> <div className="flex items-center min-w-0"> {icon} <span className="font-medium flex-grow mr-2 truncate">{text}</span> </div> <button onClick={onDismiss} className={`ml-4 p-1.5 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors flex-shrink-0 ${textColor}`} aria-label="Dismiss order status" > <XCircleIcon /> </button> </div> );
};


// Component เนื้อหาหลัก
function HomePageContent() {
    // ‼️ เปลี่ยนชื่อ State เป็น orderData ‼️
    const [orderData, setOrderData] = useState(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false); // สถานะ Loading ใหม่
    const searchParams = useSearchParams();
    const router = useRouter(); // ‼️ Hook สำหรับจัดการ URL ‼️

    // ‼️ ฟังก์ชัน Dismiss (ใช้ useCallback) ‼️
    const handleDismissStatus = useCallback(() => {
        setOrderData(null);
        // ลบ query param 'orderId' ออกจาก URL โดยไม่ Reload หน้า
        router.push('/', undefined, { shallow: true });
        console.log("Home: Dismissed status and removed orderId from URL.");
    }, [router]); // ใส่ router ใน dependency array

    // ‼️ useEffect ใหม่: สำหรับ Subscribe Supabase Realtime ‼️
    useEffect(() => {
        const orderIdFromUrl = searchParams.get('orderId');
        let channel = null; // เก็บ object ของ channel

        const setupSubscription = async () => {
            // ‼️ เพิ่ม: เช็คว่า supabase พร้อมใช้งานหรือไม่ ‼️
            if (orderIdFromUrl && supabase) {
                setIsLoadingStatus(true); // เริ่ม Loading
                setOrderData(null); // เคลียร์ State เก่าก่อน
                console.log("Home: Found orderId, setting up Supabase subscription for:", orderIdFromUrl);

                try {
                    // 1. Fetch ข้อมูลเริ่มต้นก่อน
                    const { data: initialData, error: initialError } = await supabase
                        .from('order') // ‼️ ตรวจสอบชื่อตาราง 'order' ‼️
                        .select('orderId, orderStatus') // ดึงแค่ field ที่จำเป็น
                        .eq('orderId', orderIdFromUrl) // ‼️ ใช้ 'orderId' ตาม schema ‼️
                        .maybeSingle(); // ใช้ maybeSingle เผื่อหาไม่เจอ

                    if (initialError) {
                         console.error("Home: Error fetching initial order status:", initialError);
                         setIsLoadingStatus(false);
                         return; // หยุดถ้า fetch เริ่มต้น Error
                    }

                    if (initialData) {
                         console.log("Home: Initial order data fetched:", initialData);
                         // ‼️ ใช้ initialData.orderId สำหรับ 'id' ‼️
                         setOrderData({ id: initialData.orderId, orderStatus: initialData.orderStatus });
                    } else {
                         console.log("Home: No initial order data found for this ID.");
                         handleDismissStatus();
                    }
                     setIsLoadingStatus(false); // หยุด Loading หลัง fetch เสร็จ


                    // 2. สร้าง Channel และ Subscribe การเปลี่ยนแปลง
                    channel = supabase.channel(`order_status_${orderIdFromUrl}`)
                        .on(
                            'postgres_changes',
                            {
                                event: 'UPDATE',
                                schema: 'public',
                                table: 'order',
                                filter: `orderId=eq.${orderIdFromUrl}` // ‼️ ใช้ 'orderId' ตาม schema ‼️
                            },
                            (payload) => {
                                console.log('Home: Realtime UPDATE received:', payload);
                                if (payload.new && payload.new.orderStatus) {
                                     // ‼️ ใช้ payload.new.orderId สำหรับ 'id' ‼️
                                    setOrderData({ id: payload.new.orderId, orderStatus: payload.new.orderStatus });

                                     if (payload.new.orderStatus === 'จัดส่งแล้ว') {
                                         setTimeout(() => {
                                             handleDismissStatus();
                                             console.log("Home: Auto-dismissed 'จัดส่งแล้ว' status via Realtime.");
                                         }, 10000);
                                     }
                                }
                            }
                        )
                        .subscribe((status, err) => {
                             if (status === 'SUBSCRIBED') {
                                 console.log('Home: Successfully subscribed to order status updates!');
                             }
                             if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                                 console.error('Home: Supabase channel error:', err || status);
                             }
                             if (err) {
                                 console.error('Home: Supabase subscription error:', err);
                             }
                        });

                } catch (error) {
                    console.error("Home: Error setting up subscription:", error);
                    setIsLoadingStatus(false);
                }

            } else {
                setOrderData(null);
                setIsLoadingStatus(false);
            }
        };

        setupSubscription();

        // Cleanup function: Unsubscribe
        return () => {
            if (channel) {
                console.log("Home: Unsubscribing from channel:", channel.topic);
                supabase.removeChannel(channel).catch(error => {
                     console.error("Home: Error removing channel:", error);
                });
            }
        };

    }, [searchParams, handleDismissStatus]);


    // UI หลัก (เหมือนเดิม แต่ใช้ NextImage)
    return (
        <main className="container mx-auto px-4 pt-4 sm:pt-6">
            {/* ‼️ แสดง Banner สถานะ (ใช้ orderData) ‼️ */}
            {isLoadingStatus ? (
                 <div className="w-full p-4 rounded-lg shadow-md border-l-4 mb-6 bg-gray-100 border-gray-400 text-gray-600 animate-pulse">
                     กำลังตรวจสอบสถานะออเดอร์...
                 </div>
            ) : (
                 <OrderStatusBanner orderData={orderData} onDismiss={handleDismissStatus} />
            )}


            {/* --- Section 1: Hero Section --- */}
            <section className="relative flex items-center justify-center min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-120px)] bg-gray-800 rounded-xl overflow-hidden mb-12">
                <NextImage src="https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/picmain.jpeg" alt="Cafe ambience" fill={true} priority={true} sizes="100vw" className="absolute z-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <div className="relative z-20 text-center text-white p-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">My<span className="text-amber-400">Cafe</span> </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-200"> Suggest menu by AI for you or select on the menu </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        {/* ‼️ ใช้ Link ของ Next.js ‼️ */}
                        <Link href="/chat"> <button className="w-full sm:w-auto bg-[#2c8160] hover:bg-green-900 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105"> Talk with AI</button> </Link>
                        <Link href="/menu-page"> <button className="w-full sm:w-auto bg-transparent hover:bg-white/20 text-white font-semibold py-3 px-8 border-2 border-white rounded-full transition-all duration-300"> All menu </button> </Link>
                    </div>
                </div>
            </section>

            {/* --- Section 2: Reassurance Section --- */}
            <section className="bg-gray-50 py-20 md:py-24 rounded-xl mb-12">
                <div className="px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">ไม่ต้องกังวล เราช่วยได้</h2>
                        <p className="mt-3 text-gray-600 text-lg"> ไม่ว่าคุณจะอยากลองอะไรใหม่ๆ หรือแค่อยากได้กาแฟที่ถูกใจ </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left">
                            <NextImage src="https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/4.png" alt="เลือกเมนูไม่ถูก" width={600} height={400} sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-auto object-cover rounded-lg shadow-md mb-6" />
                            <h3 className="text-2xl font-bold text-gray-800">เลือกไม่ถูกใช่ไหม?</h3>
                            <p className="mt-2 text-gray-600"> เมนูเยอะไปหมด? อยากลองอะไรใหม่ๆ แต่ไม่รู้จะเริ่มยังไง? ปัญหานี้จะหมดไป </p>
                        </div>
                        <div className="text-center md:text-left">
                            <NextImage src="https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/5.png" alt="ตัวอย่างแชทกับ AI" width={600} height={400} sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-auto object-cover rounded-lg shadow-md mb-6" />
                            <h3 className="text-2xl font-bold text-amber-600">ให้เราช่วยแนะนำ!</h3>
                            <p className="mt-2 text-gray-600"> แค่บอกความรู้สึกของคุณ AI ของเราพร้อมช่วยเลือกเครื่องดื่มที่ใช่ที่สุดสำหรับคุณ </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Section 3: How It Works --- */}
            <HowItWorksSection />
        </main>
    );
}


// ‼️ นี่คือ Page หลัก (Server Component) ‼️
export default async function Home() {
    
    // 1. ดึงข้อมูล "ทั่วไป" บน Server ก่อน
    const generalRecommendations = await getRecommendations();

    // 2. ส่งข้อมูลไปให้ Client Component
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xl font-semibold">Loading Page...</div>}>
            
            {/* * generalRecommendations ถูกดึงบน Server
              * ส่วน HistoryRecs และ OrderStatus จะถูกดึงบน Client (ข้างใน HomePageClient)
            */}
            <HomePageClient recommendations={generalRecommendations} />

        </Suspense>
    );
}