/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://aiwatch.vercel.app',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://aiwatch.vercel.app',
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  // Optimize for production
  swcMinify: true,
  compress: true,
  // Handle static assets
  trailingSlash: false,
  // Disable x-powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;