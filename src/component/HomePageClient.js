// src/app/component/HomePageClient.js

"use client"; 

import Link from 'next/link';
import NextImage from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../app/lib/supabaseClient'; 


const ClockIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 flex-shrink-0 text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> );
const TruckIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 flex-shrink-0 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5m4.125-1.125A2.25 2.25 0 0 0 18 15.75l-4.125-1.125A2.25 2.25 0 0 0 11.25 15.75v-1.5m3.375 0V9.75M15 12H9V5.25A2.25 2.25 0 0 0 6.75 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V15.75l-4.125-1.125Z" /></svg> );
const CheckBadgeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 flex-shrink-0 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg> );
const XCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> );

// ฟังก์ชันดึงข้อมูลรูปภาพ (Client-side)
const getFolderName = (category) => { 
    switch(category){ 
        case 'Coffee': case 'Tea': case 'Milk': case 'Refreshers': return 'Drink'; 
        case 'Bakery': case 'Cake': case 'Dessert': return 'Bakery'; 
        case 'Other': return 'Other'; 
        default: return category;
    } 
};

// Component "เมนูแนะนำทั่วไป" 
const RecommendedSection = ({ items }) => {
   
    if (!items || items.length === 0) return null; 
    return (
        <section className="py-20 md:py-24 mb-12">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#2c8160]">
                        Recommended menu
                    </h2>
                    <p className="mt-3 text-gray-600 text-lg">
                        
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {items.map(item => (
                        <Link key={item.menuId} href={`/menuDetail/${item.menuId}`} passHref>
                            <div className="group block bg-[#4A3728] rounded-lg shadow-md border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                <div className="relative w-full h-48">
                                    <NextImage
                                        src={item.publicImageUrl || 'https://placehold.co/300x200/DDD/333?text=N/A'}
                                        alt={item.menuName}
                                        fill={true}
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-white truncate">{item.menuName}</h3>
                                    <p className="text-sm text-white mt-1 line-clamp-2">{item.menuDescription || ' '}</p>
                                    <p className="text-md font-bold text-white mt-2">{item.menuPrice} ฿</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};


const HistoryRecsSection = ({ items, isLoading }) => {
    // ‼️ 1. สร้าง Refs 
    const scrollContainerRef = useRef(null);
    const intervalRef = useRef(null); // Ref สำหรับเก็บ ID ของ interval

    // ‼️ 2. สร้างฟังก์ชันหยุดเลื่อน 
    const stopScrolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // ‼️ 3. สร้างฟังก์ชันเริ่มเลื่อน 
    const startScrolling = useCallback(() => {
        stopScrolling(); // เคลียร์ interval เก่า (ถ้ามี)
        const container = scrollContainerRef.current;
        if (!container) return;

        intervalRef.current = setInterval(() => {
            const scrollAmount = 280; // = w-64 (256px) + space-x-6 (24px)
            let newScrollLeft = container.scrollLeft + scrollAmount;

          
            if (newScrollLeft >= (container.scrollWidth - container.clientWidth)) {
                // วนกลับไปจุดเริ่มต้น
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                // เลื่อนไปทีละ 1 การ์ด
                container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
            }
        }, 3000); // เลื่อนทุก 3 วินาที
    }, [stopScrolling]); // ‼️ useCallback ขึ้นกับ stopScrolling

    // 4. Effect สำหรับจัดการการเลื่อน  
    useEffect(() => {
        const container = scrollContainerRef.current;
        
        // เริ่มทำงานต่อเมื่อ: ไม่โหลด, มี items, และ container พร้อม
        if (!isLoading && items && items.length > 0 && container) {
            startScrolling();
            
          
            container.addEventListener('mouseenter', stopScrolling); // หยุดเมื่อเมาส์ชี้
            container.addEventListener('mouseleave', startScrolling); // เลื่อนต่อเมื่อเมาส์ออก
            
            // หยุดเมื่อผู้ใช้แตะ (สำหรับมือถือ)
            container.addEventListener('touchstart', stopScrolling, { passive: true });
            // เริ่มใหม่เมื่อปล่อย (ทางเลือก)
            // container.addEventListener('touchend', startScrolling, { passive: true });

            // Cleanup function
            return () => {
                stopScrolling();
                if (container) {
                    container.removeEventListener('mouseenter', stopScrolling);
                    container.removeEventListener('mouseleave', startScrolling);
                    container.removeEventListener('touchstart', stopScrolling);
                    // container.removeEventListener('touchend', startScrolling);
                }
            };
        }

        // Cleanup กรณี items หาย หรือ isLoading
        return () => stopScrolling();

    }, [isLoading, items, startScrolling, stopScrolling]); // ‼️ Dependencies

    
    // UI สำหรับ Skeleton Card (ตอนกำลังโหลด)
    const SkeletonCard = () => (
        
        <div className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse">
            <div className="w-full h-40 bg-gray-300"></div>
            <div className="p-4">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4 mt-2"></div>
            </div>
        </div>
    );

    if (!isLoading && (!items || items.length === 0)) return null; 

    return (
        <section className="pt-12 pb-20 md:pt-16 md:pb-24 mb-12 bg-gray-50 rounded-xl">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#2c8160]">
                        Your favorite menu
                    </h2>
                    
                </div>
                
                
                <div 
                    ref={scrollContainerRef}
                    className="flex space-x-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-amber-100 scroll-smooth"
                    // scroll-snap-type-x-mandatory ช่วยให้การเลื่อน (manual) เข้าล็อคง่ายขึ้น
                    style={{ scrollSnapType: 'x mandatory' }} 
                >
                    {isLoading ? (
                        <> <SkeletonCard /> <SkeletonCard /> <SkeletonCard /> <SkeletonCard /> </>
                    ) : (
                        items.map(item => (
                            <Link key={item.menuId} href={`/menuDetail/${item.menuId}`} passHref>
                               
                                <div className="flex-shrink-0 w-64 group block bg-[#4A3728] rounded-lg shadow-md border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 scroll-snap-align-start">
                                    <div className="relative w-full h-40">
                                        <NextImage
                                            src={item.publicImageUrl || 'https://placehold.co/300x200/DDD/333?text=N/A'}
                                            alt={item.menuName}
                                            fill={true}
                                            sizes="256px"
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-white truncate">{item.menuName}</h3>
                                        <p className="text-md font-bold text-white mt-2">{item.menuPrice} ฿</p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};


// Component "How It Works" (UI + Logic)
const HowItWorksSection = () => {
    // ... (โค้ดเหมือนเดิม) ...
    const [activeStep, setActiveStep] = useState(1);
    const timerRef = useRef(null);
    const steps = [ { id: 1, title: '1. คุยกับ AI หรือเลือกเมนู', description: 'บอก AI ว่าคุณอยากดื่มอะไร...', imageUrl: 'https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/step-1.png' }, { id: 2, title: '2. ตรวจสอบและปรับแต่ง', description: 'AI จะเสนอเมนูที่ใช่ให้คุณ...', imageUrl: 'https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/step-2.png' }, { id: 3, title: '3. ชำระเงิน & รอรับที่โต๊ะ', description: 'ชำระเงินออนไลน์ง่ายๆ...', imageUrl: 'https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/step-3.png' } ];
    const startTimer = () => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = setInterval(() => { setActiveStep((prevStep) => (prevStep % 3) + 1); }, 4000); };
    const handleStepClick = (stepId) => { setActiveStep(stepId); startTimer(); };
    useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

    return ( <section className="bg-white py-20 md:py-24 rounded-xl"> <div className="container mx-auto px-6"> <div className="text-center mb-16"> <h2 className="text-3xl md:text-4xl font-bold text-gray-800">ใช้งานง่ายๆ ใน 3 ขั้นตอน</h2> <p className="mt-3 text-gray-600 text-lg"> สั่งเครื่องดื่มแก้วโปรดของคุณได้ง่ายกว่าที่เคย </p> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"> <div className="space-y-6"> {steps.map((step) => ( <div key={step.id} onClick={() => handleStepClick(step.id)} className={`p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer ${activeStep === step.id ? 'bg-amber-50 border-amber-500 shadow-lg' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`} > <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3> <p className="mt-2 text-gray-600">{step.description}</p> </div> ))} </div> <div className="relative w-full h-80 md:h-96"> {steps.map((step) => ( <NextImage key={step.id} src={step.imageUrl} alt={step.title} fill={true} sizes="(max-width: 768px) 100vw, 50vw" className={`absolute inset-0 w-full h-full object-cover rounded-lg shadow-md transition-all duration-500 ease-in-out ${activeStep === step.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`} /> ))} </div> </div> </div> </section> );
};

// Component "Order Status" (UI + Logic)
const OrderStatusBanner = ({ orderData, onDismiss }) => {
    // ... (โค้ดเหมือนเดิม) ...
    if (!orderData || orderData.id == null || !orderData.orderStatus) return null;
    const displayId = String(orderData.id).substring(0, 8); 
    const getStatusInfo = (status) => {
         switch (status) {
            case 'กำลังเตรียม': return { text: `ออเดอร์ (${displayId}) กำลังเตรียม`, icon: <ClockIcon />, bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-400' };
            case 'กำลังจัดส่ง': return { text: `ออเดอร์ (${displayId}) กำลังนำไปเสิร์ฟ`, icon: <TruckIcon />, bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-400' };
            case 'จัดส่งแล้ว': return { text: `ออเดอร์ (${displayId}) จัดส่งเรียบร้อย`, icon: <CheckBadgeIcon />, bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-400' };
            default: return { text: `ออเดอร์ (${displayId}) สถานะ: ${status}`, icon: null, bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-400' };
        }
    };
    const { text, icon, bgColor, textColor, borderColor } = getStatusInfo(orderData.orderStatus);
    return ( <div className={`w-full p-4 rounded-lg shadow-md border-l-4 mb-6 flex items-center justify-between ${bgColor} ${borderColor} ${textColor}`}> <div className="flex items-center min-w-0"> {icon} <span className="font-medium flex-grow mr-2 truncate">{text}</span> </div> <button onClick={onDismiss} className={`ml-4 p-1.5 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors flex-shrink-0 ${textColor}`} aria-label="Dismiss order status" > <XCircleIcon /> </button> </div> );
};


// ‼️ นี่คือ Component หลัก (Client Component) ‼️
export default function HomePageClient({ recommendations }) {
    // ... (States ทั้งหมดเหมือนเดิม) ...
    const [orderData, setOrderData] = useState(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false); 
    const searchParams = useSearchParams();
    const router = useRouter(); 
    const [currentUser, setCurrentUser] = useState(null);
    const [historyRecs, setHistoryRecs] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true); 

    // Effect (1): ดึงข้อมูล User (เหมือนเดิม)
    useEffect(() => {
        // ... (โค้ดเหมือนเดิม) ...
        const fetchUser = async () => {
            if (supabase) {
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUser(user);
                 console.log("Home(Client): Current user:", user ? user.id : 'Guest');
                 if (!user) {
                     setIsLoadingHistory(false); 
                 }
            }
        };
        fetchUser();
    }, []); 

    // Effect (2): ดึงประวัติการสั่ง (AI Logic) (เหมือนเดิม)
    useEffect(() => {
        // ... (โค้ดเหมือนเดิม) ...
        const fetchHistoryRecommendations = async (userId) => {
            console.log("Home(Client): Fetching history recs for user:", userId);
            setIsLoadingHistory(true);
            setHistoryRecs([]);
            try {
                // 1. ดึง Order ID
                const { data: userOrders, error: orderError } = await supabase.from('order').select('orderId').eq('userId', userId); 
                if (orderError) throw orderError;
                if (!userOrders || userOrders.length === 0) {
                    console.log("Home(Client): No order history found for this user.");
                    setIsLoadingHistory(false);
                    return; 
                }
                const orderIds = userOrders.map(o => o.orderId);

                // 2. ดึงเมนู
                const { data: details, error: detailsError } = await supabase.from('orderDetails').select('menuId').in('orderId', orderIds);
                if (detailsError) throw detailsError;
                
                // 3. นับ
                const menuCounts = details.reduce((acc, detail) => {
                    acc[detail.menuId] = (acc[detail.menuId] || 0) + 1;
                    return acc;
                }, {});

                // 4. เรียง
                const sortedMenuIds = Object.entries(menuCounts).sort(([, countA], [, countB]) => countB - countA).map(([menuId]) => menuId).slice(0, 6); 
                if (sortedMenuIds.length === 0) {
                    setIsLoadingHistory(false); 
                    return; 
                }

                // 5. ดึงข้อมูลเมนู
                const { data: menuItems, error: itemsError } = await supabase.from('menuItems').select('*').in('menuId', sortedMenuIds);
                if (itemsError) throw itemsError;

                // 6. เพิ่ม Image URL
                const itemsWithImages = menuItems.map(item => {
                    if (item.menuImage && item.menuCategory) {
                        const folderName = getFolderName(item.menuCategory);
                        const imagePath = `${folderName}/${item.menuImage}`;
                        const { data } = supabase.storage.from('menu-images').getPublicUrl(imagePath);
                        return { ...item, publicImageUrl: data?.publicUrl || '' };
                    }
                    return { ...item, publicImageUrl: '' };
                });
                
                // 7. เรียงอีกครั้ง
                const sortedItems = sortedMenuIds.map(id => itemsWithImages.find(item => String(item.menuId) === String(id))).filter(Boolean); 

                console.log("Home(Client): Fetched history recs:", sortedItems);
                setHistoryRecs(sortedItems);

            } catch (error) {
                console.error("Home(Client): Error fetching history recs:", error.message);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        if (currentUser && currentUser.id) {
            fetchHistoryRecommendations(currentUser.id);
        }
    }, [currentUser]); 


    // Effect (3): จัดการ Order Status (Realtime) (เหมือนเดิม)
    const handleDismissStatus = useCallback(() => {
        // ... (โค้ดเหมือนเดิม) ...
        setOrderData(null);
        router.push('/', undefined, { shallow: true });
        console.log("Home(Client): Dismissed status and removed orderId from URL.");
    }, [router]);

    useEffect(() => {
        // ... (โค้ดเหมือนเดิม) ...
        const orderIdFromUrl = searchParams.get('orderId');
        let channel = null; 
        const setupSubscription = async () => {
            if (orderIdFromUrl && supabase) {
                setIsLoadingStatus(true); 
                setOrderData(null); 
                console.log("Home(Client): Found orderId, setting up Supabase subscription for:", orderIdFromUrl);
                try {
                    // 1. Fetch
                    const { data: initialData, error: initialError } = await supabase.from('order').select('orderId, orderStatus').eq('orderId', orderIdFromUrl).maybeSingle(); 
                    if (initialError) {
                         console.error("Home(Client): Error fetching initial order status:", initialError);
                         setIsLoadingStatus(false);
                         return;
                    }
                    if (initialData) {
                         console.log("Home(Client): Initial order data fetched:", initialData);
                         setOrderData({ id: initialData.orderId, orderStatus: initialData.orderStatus });
                    } else {
                         console.log("Home(Client): No initial order data found for this ID.");
                         handleDismissStatus(); 
                    }
                     setIsLoadingStatus(false); 
                    // 2. Subscribe
                    channel = supabase.channel(`order_status_${orderIdFromUrl}`)
                        .on(
                            'postgres_changes',
                            { event: 'UPDATE', schema: 'public', table: 'order', filter: `orderId=eq.${orderIdFromUrl}` },
                            (payload) => {
                                console.log('Home(Client): Realtime UPDATE received:', payload);
                                if (payload.new && payload.new.orderStatus) {
                                    setOrderData({ id: payload.new.orderId, orderStatus: payload.new.orderStatus });
                                     if (payload.new.orderStatus === 'จัดส่งแล้ว') {
                                         setTimeout(() => handleDismissStatus(), 10000);
                                     }
                                }
                            }
                        )
                        .subscribe((status, err) => {
                             if (status === 'SUBSCRIBED') console.log('Home(Client): Successfully subscribed to order status updates!');
                             if (err) console.error('Home(Client): Supabase subscription error:', err);
                        });
                } catch (error) {
                    console.error("Home(Client): Error setting up subscription:", error);
                    setIsLoadingStatus(false);
                }
            } else {
                setOrderData(null); 
                setIsLoadingStatus(false);
            }
        };
        setupSubscription();
        // Cleanup
        return () => {
            if (channel) {
                console.log("Home(Client): Unsubscribing from channel:", channel.topic);
                supabase.removeChannel(channel).catch(error => {
                     console.error("Home(Client): Error removing channel:", error);
                });
            }
        };
    }, [searchParams, handleDismissStatus]);


    // UI หลัก (เหมือนเดิม)
    return (
        <main className="container mx-auto px-4 pt-4 sm:pt-6">
            
            {isLoadingStatus ? (
                 <div className="w-full p-4 rounded-lg shadow-md border-l-4 mb-6 bg-gray-100 border-gray-400 text-gray-600 animate-pulse">
                     กำลังตรวจสอบสถานะออเดอร์...
                 </div>
            ) : (
                 <OrderStatusBanner orderData={orderData} onDismiss={handleDismissStatus} />
            )}

            <section className="relative flex items-center justify-center min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-120px)] bg-gray-800 rounded-xl overflow-hidden mb-12">
                <NextImage src="https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/picmain.jpeg" alt="Cafe ambience" fill={true} priority={true} sizes="100vw" className="absolute z-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <div className="relative z-20 text-center text-white p-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">My<span className="text-amber-400">Cafe</span> </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-200"> Suggest menu by AI for you or select on the menu </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/chat"> <button className="w-full sm:w-auto bg-[#2c8160] hover:bg-green-900 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105"> Talk with AI</button> </Link>
                        <Link href="/menu-page"> <button className="w-full sm:w-auto bg-transparent hover:bg-white/20 text-white font-semibold py-3 px-8 border-2 border-white rounded-full transition-all duration-300"> All menu </button> </Link>
                    </div>
                </div>
            </section>

            {/* "เมนูแนะนำทั่วไป" (จาก Server Prop) */}
            <RecommendedSection items={recommendations} />
            
            {/* "เมนูจากประวัติ" (จาก Client) */}
            <HistoryRecsSection items={historyRecs} isLoading={isLoadingHistory} />
            
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

            <HowItWorksSection />
        </main>
    );
}