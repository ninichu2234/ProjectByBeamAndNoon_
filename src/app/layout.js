import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "../component/Navbar";
import { UserProvider } from "./context/UserContext"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  itle: "My Café",
  description: "สั่งเครื่องดื่มและขนมง่ายๆ แค่คุยกับ AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <Navbar/>
          {children}  
        </UserProvider>
      </body>
    </html>
    );
}