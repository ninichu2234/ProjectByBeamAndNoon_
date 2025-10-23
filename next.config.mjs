/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com', // <-- This line fixes the error
        },
        {
          protocol: 'https',
          hostname: 'placehold.co',
        },
        {
          protocol: 'https',
          hostname: 'rcrntadwwvhyojmjrmzh.supabase.co',
        },
      ],
    },
  };
  
  export default nextConfig;