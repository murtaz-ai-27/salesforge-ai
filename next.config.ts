import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance
  compress: true,
  poweredByHeader: false,

  // Images
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol:"https", hostname:"lh3.googleusercontent.com" },
      { protocol:"https", hostname:"avatars.githubusercontent.com" },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key:"X-Frame-Options", value:"DENY" },
          { key:"X-Content-Type-Options", value:"nosniff" },
          { key:"Referrer-Policy", value:"strict-origin-when-cross-origin" },
          { key:"Permissions-Policy", value:"camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      { source:"/apollo", destination:"/vs-apollo", permanent:true },
      { source:"/pricing", destination:"/dashboard/pricing", permanent:false },
    ];
  },
};

export default nextConfig;
