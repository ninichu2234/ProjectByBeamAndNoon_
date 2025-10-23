/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co', // สำหรับรูปสำรอง
            },
            {
                protocol: 'https',
                hostname: 'rcrntadwwvhyojmjrmzh.supabase.co', // << ใส่ hostname ของ Supabase Storage ของคุณ
            },
            // เพิ่ม hostname อื่นๆ ที่คุณใช้ได้ที่นี่
        ],
    },
};

export default nextConfig;