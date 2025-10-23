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
        ],
    },
};

export default nextConfig;