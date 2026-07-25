import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  
  async redirects() {
    return [
      { source:"/apollo", destination:"/vs-apollo", permanent:true },
      { source:"/pricing", destination:"/dashboard/pricing", permanent:false },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/",
        destination: "/salevrix-landing.html",
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key:"X-Frame-Options", value:"DENY" },
          { key:"X-Content-Type-Options", value:"nosniff" },
        ],
      },
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