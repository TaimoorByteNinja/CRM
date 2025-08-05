import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use export mode for production builds
  ...(process.env.NODE_ENV === 'production' && { output: "export" }),
  trailingSlash: true,
  images: { unoptimized: true },
  
  // Security headers for Electron app
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development'
              ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://txpufkxjnxhpnmydwdng.supabase.co wss://txpufkxjnxhpnmydwdng.supabase.co http://localhost:* ws://localhost:*"
              : "default-src 'self' 'unsafe-inline' data: blob: https://txpufkxjnxhpnmydwdng.supabase.co wss://txpufkxjnxhpnmydwdng.supabase.co"
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
