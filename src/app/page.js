import Image from "next/image";
import Navbar from "../component/Navbar";
import AboutUsSection from "../component/AboutUsSection";

export default function Home() {
  return (  
  <div class="font-kanit antialiased bg-gray-50 text-gray-900"> 
  <Navbar/> 
  <AboutUsSection/>
  

  <section class="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
    <div class="container mx-auto px-6">
      <div class="max-w-4xl mx-auto text-center">
       
        <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          ยินดีต้อนรับสู่
          <span class="text-blue-600">เว็บไซต์ของเรา</span>
        </h1>


        <p class="text-xl text-gray-600 mb-8 leading-relaxed">
          เรามีบริการที่ครบครันและทีมงานมืออาชีพ
          พร้อมให้บริการคุณด้วยความใส่ใจและคุณภาพสูงสุด
        </p>


        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            class="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <span>เริ่มต้นเลย</span>
            <i class="fas fa-arrow-right"></i>
          </button>
          <button
            class="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <i class="fas fa-play"></i>
            <span>ดูวิดีโอ</span>
          </button>
        </div>
      </div>
    </div>
  </section>


  
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-6">

      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">ค่านิยมของเรา</h2>
        <p class="text-xl text-gray-600">สิ่งที่เรายึดถือและปฏิบัติ</p>
      </div>


      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

        <div
          class="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
        >
          <div
            class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <i class="fas fa-heart text-blue-600 text-2xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">ความใส่ใจ</h3>
          <p class="text-gray-600 leading-relaxed">
            เรามุ่งมั่นในการให้บริการด้วยความใส่ใจและเข้าใจความต้องการของลูกค้า
          </p>
        </div>


        <div
          class="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
        >
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <i class="fas fa-star text-green-600 text-2xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">คุณภาพ</h3>
          <p class="text-gray-600 leading-relaxed">
            เรามุ่งมั่นในการส่งมอบผลงานที่มีคุณภาพสูงสุดและตรงตามความต้องการ
          </p>
        </div>


        <div
          class="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
        >
          <div
            class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <i class="fas fa-lightbulb text-purple-600 text-2xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">นวัตกรรม</h3>
          <p class="text-gray-600 leading-relaxed">
            เราพัฒนาและปรับปรุงบริการอย่างต่อเนื่องด้วยเทคโนโลยีที่ทันสมัย
          </p>
        </div>
      </div>
    </div>
  </section>


  <section class="py-16 bg-blue-600 text-white">
    <div class="container mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold mb-4">พร้อมเริ่มต้นแล้วหรือยัง?</h2>
      <p class="text-blue-100 mb-8 max-w-2xl mx-auto">
        ติดต่อเราวันนี้เพื่อรับคำปรึกษาฟรี หรือสอบถามข้อมูลเพิ่มเติม
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          class="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center gap-2"
        >
          <i class="fas fa-phone"></i>
          <span>โทรเลย</span>
        </button>
        <button
          class="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300 flex items-center justify-center gap-2"
        >
          <i class="fas fa-envelope"></i>
          <span>ส่งอีเมล</span>
        </button>
      </div>
    </div>
  </section>


  <footer class="bg-gray-900 text-white py-12">
    <div class="container mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
       
        <div class="md:col-span-2">
          <div class="text-2xl font-bold mb-4">
            <span class="text-blue-400">Your</span>Brand
          </div>
          <p class="text-gray-400 mb-4 leading-relaxed">
            บริษัทที่ให้บริการครบครันด้วยทีมงานมืออาชีพ
            พร้อมให้คำปรึกษาและบริการที่ดีที่สุด
          </p>
          <div class="flex space-x-4">
            <a
              href="#"
              class="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <i class="fab fa-facebook text-xl"></i>
            </a>
            <a
              href="#"
              class="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <i class="fab fa-twitter text-xl"></i>
            </a>
            <a
              href="#"
              class="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <i class="fab fa-instagram text-xl"></i>
            </a>
          </div>
        </div>


        <div>
          <h3 class="text-lg font-semibold mb-4">ลิงก์ด่วน</h3>
          <ul class="space-y-2">
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-white transition-colors duration-300"
                >หน้าแรก</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-white transition-colors duration-300"
                >บริการ</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-white transition-colors duration-300"
                >เกี่ยวกับเรา</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-white transition-colors duration-300"
                >ติดต่อ</a
              >
            </li>
          </ul>
        </div>


        <div>
          <h3 class="text-lg font-semibold mb-4">ติดต่อเรา</h3>
          <ul class="space-y-2 text-gray-400">
            <li class="flex items-center gap-2">
              <i class="fas fa-phone"></i>
              <span>02-123-4567</span>
            </li>
            <li class="flex items-center gap-2">
              <i class="fas fa-envelope"></i>
              <span>info@yourbrand.com</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fas fa-map-marker-alt mt-1"></i>
              <span>123 ถนนสุขุมวิท กรุงเทพฯ 10110</span>
            </li>
          </ul>
        </div>
      </div>


      <div
        class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
      >
        <p>&copy; 2024 YourBrand. สงวนลิขสิทธิ์ทั้งหมด</p>
      </div>
    </div>
  </footer>
</div>
);
}

