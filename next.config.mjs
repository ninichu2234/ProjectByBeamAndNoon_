/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com', 
         },
         {
          protocol: 'https',
          hostname: 'placehold.co',
        },
        {
// ‼️ นี่คือการอนุญาต Domain ของ Supabase Storage ‼️
          protocol: 'https',
          hostname: 'rcrntadwwvhyojmjrmzh.supabase.co',
// (เพิ่ม pathname เพื่อความปลอดภัยและถูกต้อง)
          pathname: '/storage/v1/object/public/**', 
        },
        
       {
              protocol: 'https',
              hostname: 'share.google',
            },
        {
              protocol: 'https',
              hostname: '**.supabase.co', // ✅ เพื่อให้โหลดรูปจาก Supabase ได้
        },
        
      ],
    },

  };
// ‼️ ใช้ export default ตามโค้ดเดิมของคุณ ‼️
export default nextConfig; 
