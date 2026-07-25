import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  async rewrites() {
    return [
      {
        source: "/",
        destination: "/index.html",
      },
    ];
  },

  async redirects() {
    return [
      { source:"/apollo", destination:"/vs-apollo", permanent:true },
      { source:"/pricing", destination:"/dashboard/pricing", permanent:false },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol:"https", hostname:"lh3.googleusercontent.com" },
      { protocol:"https", hostname:"avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;