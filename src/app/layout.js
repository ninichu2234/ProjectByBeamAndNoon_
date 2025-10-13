import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. Import Navbar เข้ามาที่นี่
import Navbar from "../component/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  // (แนะนำ) เปลี่ยนชื่อเว็บตรงนี้ด้วยครับ
  title: "My Café",
  description: "สั่งเครื่องดื่มและขนมง่ายๆ แค่คุยกับ AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th"> {/* (แนะนำ) เปลี่ยนเป็น lang="th" */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 2. วาง Component Navbar ไว้ตรงนี้ */}
        <Navbar />

        {/* เนื้อหาของแต่ละหน้าจะมาแสดงต่อจาก Navbar */}
        {children}
      </body>
    </html>
  );
}