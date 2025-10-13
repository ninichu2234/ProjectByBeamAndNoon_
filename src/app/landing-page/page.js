
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      {/* ======================================= */}
      {/* Section 1: Hero Section (ส่วนต้อนรับ)    */}
      {/* ======================================= */}
      <section className="relative flex items-center justify-center h-screen bg-gray-800">
        {/* --- ส่วน Background --- */}
        {/* TODO: เปลี่ยนเป็นรูปภาพหรือวิดีโอของร้านคุณ */}
        {/* <video autoPlay loop muted className="absolute z-0 w-auto min-w-full min-h-full max-w-none">
          <source src="/videos/cafe-ambience.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}
        <img
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2940&auto=format&fit=crop"
          alt="Cafe ambience"
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
              <div className="bg-gray-200 h-64 rounded-lg shadow-md mb-6 flex items-center justify-center">
                {/* TODO: ใส่รูปคนกำลังเลือกเมนูเยอะๆ แล้วทำหน้างง */}
                <span className="text-gray-500">🖼️ รูปภาพ: เลือกเมนูไม่ถูก</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">เลือกไม่ถูกใช่ไหม?</h3>
              <p className="mt-2 text-gray-600">
                เมนูเยอะไปหมด? อยากลองอะไรใหม่ๆ แต่ไม่รู้จะเริ่มยังไง? ปัญหานี้จะหมดไป
              </p>
            </div>

            {/* คอลัมน์ขวา: ทางออก */}
            <div className="text-center md:text-left">
               <div className="bg-gray-200 h-64 rounded-lg shadow-md mb-6 flex items-center justify-center">
                {/* TODO: ใส่รูป Mockup หน้าจอแชทกับ AI */}
                <span className="text-gray-500">🖼️ รูปภาพ: ตัวอย่างแชทกับ AI</span>
              </div>
              <h3 className="text-2xl font-bold text-amber-600">ให้เราช่วยแนะนำ!</h3>
              <p className="mt-2 text-gray-600">
                แค่บอกความรู้สึกของคุณ AI ของเราพร้อมช่วยเลือกเครื่องดื่มที่ใช่ที่สุดสำหรับคุณ
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}