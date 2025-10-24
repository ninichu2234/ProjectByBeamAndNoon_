// 1. ✨ ต้องมี "use client" และ Import Hooks ✨
"use client";
import Link from 'next/link';
import Image from 'next/image';
// ‼️ แก้ไข: เอา useEffect และ useRef กลับมา ‼️
import { useState, useEffect, useRef } from 'react'; 

// 4. ✨ Component "How It Works" (ฉบับ "ไฮบริด") ✨
const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(1);
  const timerRef = useRef(null); // ‼️ เพิ่ม useRef เพื่อเก็บ ID ของ timer ‼️

  const steps = [
    {
      id: 1,
      title: '1. คุยกับ AI หรือเลือกเมนู',
      description: 'บอก AI ว่าคุณอยากดื่มอะไร เช่น "ขอกาแฟนมที่ไม่หวาน" หรือเลือกดูเมนูทั้งหมดด้วยตัวเอง',
      // ‼️ (สำคัญ) คุณต้องเอารูปจริง (800x600) ไปอัปโหลดที่ Supabase แล้วเอา URL มาใส่ตรงนี้
      imageUrl: 'https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/step-1.png'
    },
    {
      id: 2,
      title: '2. ตรวจสอบและปรับแต่ง',
      description: 'AI จะเสนอเมนูที่ใช่ให้คุณ คุณสามารถเพิ่ม/ลด ความหวาน, เปลี่ยนเมล็ดกาแฟ, หรือเพิ่มท็อปปิ้งได้ในตะกร้า',
      // ‼️ (สำคัญ) คุณต้องเอารูปจริง (800x600) ไปอัปโหลดที่ Supabase แล้วเอา URL มาใส่ตรงนี้
      imageUrl: 'https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/step-2.png'
    },
    {
      id: 3,
      title: '3. ชำระเงิน & รอรับที่โต๊ะ',
      description: 'ชำระเงินออนไลน์ง่ายๆ แล้วนั่งรอสบายๆ ที่โต๊ะของคุณ บาริสต้าจะนำออเดอร์ไปเสิร์ฟให้ทันที',
      // ‼️ (สำคัญ) คุณต้องเอารูปจริง (800x600) ไปอัปโหลดที่ Supabase แล้วเอา URL มาใส่ตรงนี้
      imageUrl: 'https://rcrntadwwvhyojmjrmzh.supabase.co/storage/v1/object/public/pic-other/step-3.png'
    }
  ];

  // ‼️ เพิ่ม: ฟังก์ชันสำหรับเริ่ม/รีสตาร์ท timer ‼️
  const startTimer = () => {
    // ล้าง timer เก่า (ถ้ามี)
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // เริ่ม timer ใหม่
    timerRef.current = setInterval(() => {
      setActiveStep((prevStep) => {
        return (prevStep % 3) + 1; // วนลูป 1 -> 2 -> 3 -> 1
      });
    }, 4000); // 4 วินาที
  };

  // ‼️ เพิ่ม: ฟังก์ชันสำหรับจัดการการคลิก ‼️
  const handleStepClick = (stepId) => {
    setActiveStep(stepId);
    startTimer(); // ‼️ รีเซ็ต timer ทุกครั้งที่คลิก ‼️
  };

  // ‼️ เพิ่ม: เริ่ม timer เมื่อโหลดหน้า ‼️
  useEffect(() => {
    startTimer(); // เริ่ม timer ตอนโหลด

    // Cleanup function: หยุด timer เมื่อ component หายไป
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []); // [] หมายถึงให้ทำงานแค่ครั้งเดียวตอนโหลด


  return (
    <section className="bg-white py-20 md:py-24">
      <div className="container mx-auto px-6">
        {/* --- หัวข้อของ Section --- */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">ใช้งานง่ายๆ ใน 3 ขั้นตอน</h2>
          <p className="mt-3 text-gray-600 text-lg">
            สั่งเครื่องดื่มแก้วโปรดของคุณได้ง่ายกว่าที่เคย
          </p>
        </div>

        {/* --- Layout 2 คอลัมน์ (Text ซ้าย, Image ขวา) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* คอลัมน์ซ้าย: Text Steps (ตอนนี้ "คลิกได้") */}
          <div className="space-y-6">
            {steps.map((step) => (
              <div
                key={step.id}
                // ‼️ แก้ไข: เรียกใช้ handleStepClick ‼️
                onClick={() => handleStepClick(step.id)} 
                // (คง cursor-pointer และ hover: ไว้)
                className={`p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                  activeStep === step.id
                    ? 'bg-amber-50 border-amber-500 shadow-lg' // สไตล์ตอน Active
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100' // สไตล์ปกติ (คลิกได้)
                }`}
              >
                <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          {/* คอลัมน์ขวา: Image (สลับตาม Active) */}
          <div className="relative w-full h-80 md:h-96"> {/* Container สำหรับรูป */}
            {steps.map((step) => (
              <Image
                key={step.id}
                src={step.imageUrl}
                alt={step.title}
                fill={true}
                className={`absolute inset-0 w-full h-full object-cover rounded-lg shadow-md transition-all duration-500 ease-in-out ${
                  activeStep === step.id
                    ? 'opacity-100 scale-100' // โชว์
                    : 'opacity-0 scale-95 pointer-events-none' // ซ่อน
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <main>
      {/* ======================================= */}
      {/* Section 1: Hero Section (ส่วนต้อนรับ)    */}
      {/* ======================================= */}
      <section className="relative flex items-center justify-center h-screen bg-gray-800">
        {/* --- ส่วน Background --- */}
        
        {/* 2. ✨ แก้ไข Section 1 Image ✨ */}
        {/* (อย่าลืมใส่รูปของคุณใน public/images/cafe-hero-bg.jpg) */}
       <Image
          src="/images/cafe-hero-bg.jpg"
          alt="Cafe ambience"
          fill={true} 
          priority={true} 
          className="absolute z-0 w-full h-full object-cover"
      />
        <div className="absolute inset-0 bg-black/60 z-10"></div> {/* Overlay สีดำโปร่งแสง */}

        {/* --- ส่วนเนื้อหา --- */}
        <div className="relative z-20 text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            สั่งกาแฟ... <span className="text-amber-400">ในแบบของคุณ</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-200">
            ให้ AI ช่วยแนะนำเมนูที่ใช่สำหรับคุณ หรือเลือกดูเมนูทั้งหมดด้วยตัวคุณเอง
          </p>

          {/* --- ปุ่ม CTA คู่ --- */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/chat">
              <button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105">
                ✨ คุยกับ AI แนะนำเมนู
              </button>
            </Link>
            <Link href="/menu-page">
              <button className="w-full sm:w-auto bg-transparent hover:bg-white/20 text-white font-semibold py-3 px-8 border-2 border-white rounded-full transition-all duration-300">
                ดูเมนูทั้งหมด
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* Section 2: Reassurance Section (ส่วนอธิบาย)      */}
      {/* ================================================= */}
      <section className="bg-gray-50 py-20 md:py-24">
        <div className="container mx-auto px-6">
          {/* --- หัวข้อของ Section --- */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">ไม่ต้องกังวล เราช่วยได้</h2>
            <p className="mt-3 text-gray-600 text-lg">
              ไม่ว่าคุณจะอยากลองอะไรใหม่ๆ หรือแค่อยากได้กาแฟที่ถูกใจ
            </p>
          </div>
          
          {/* --- Layout 2 คอลัมน์ --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* คอลัมน์ซ้าย: ปัญหา */}
            <div className="text-center md:text-left">
              {/* 3. ✨ แก้ไข Section 2 (ซ้าย) Image ✨ */}
              {/* ‼️ (สำคัญ) คุณต้องเอารูปจริง (600x400) จาก Supabase มาใส่แทน placehold */}
              <Image 
                src="https://placehold.co/600x400/EEE/777?text=รูปคนเลือกเมนูไม่ถูก" 
                alt="เลือกเมนูไม่ถูก"
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-lg shadow-md mb-6"
              />
              <h3 className="text-2xl font-bold text-gray-800">เลือกไม่ถูกใช่ไหม?</h3>
              <p className="mt-2 text-gray-600">
                เมนูเยอะไปหมด? อยากลองอะไรใหม่ๆ แต่ไม่รู้จะเริ่มยังไง? ปัญหานี้จะหมดไป
              </p>
            </div>

            {/* คอลัมน์ขวา: ทางออก */}
            <div className="text-center md:text-left">
               {/* 3. ✨ แก้ไข Section 2 (ขวา) Image ✨ */}
               {/* ‼️ (สำคัญ) คุณต้องเอารูปจริง (600x400) จาก Supabase มาใส่แทน placehold */}
               <Image 
                src="https://placehold.co/600x400/EEE/777?text=รูปตัวอย่างแชทกับ+AI" 
                alt="ตัวอย่างแชทกับ AI"
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-lg shadow-md mb-6"
              />
              <h3 className="text-2xl font-bold text-amber-600">ให้เราช่วยแนะนำ!</h3>
              <p className="mt-2 text-gray-600">
                แค่บอกความรู้สึกของคุณ AI ของเราพร้อมช่วยเลือกเครื่องดื่มที่ใช่ที่สุดสำหรับคุณ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ✨ เรียกใช้ Section ใหม่ที่นี่ ✨ */}
      <HowItWorksSection />

    </main>
  );
}

