import Link from "next/link"
export default function Navbar() {
    return(<header className="bg-white shadow-sm sticky top-0 z-50">
    <div className="container mx-auto px-6">
      <div className="flex items-center justify-between h-16">

        <div className="flex items-center">
          <div className="text-2xl font-bold text-gray-900">
            <span className="text-blue-600">Your</span>Money
          </div>
        </div>


        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="#"
            className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >หน้าแรก
          </Link>
          <Link
            href="#"
            className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >บริการ
            </Link>
          
          <Link
            href="/about-us"
            className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >เกี่ยวกับเรา
          </Link>
          <Link
            href="#"
            className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >ติดต่อ
          </Link>
        </nav>

  
        <div className="hidden md:block">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            เริ่มต้นใช้งาน
          </button>
        </div>

      
        <button className="md:hidden text-gray-700">
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>
    </div>
  </header>
);
}