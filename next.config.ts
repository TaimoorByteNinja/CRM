import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable static exports for Electron
  output: 'export',
  trailingSlash: true,
  
  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Configure for Electron environment
  experimental: {
    // Enable if needed for Electron
    esmExternals: false,
  },
  
  // Handle images and static assets
  images: {
    unoptimized: true, // Required for static export
  },
  
  // Ensure proper handling of environment variables
  webpack: (config, { isServer }) => {
    // Ensure environment variables are available in client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
}

export default nextConfig
