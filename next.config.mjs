/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days image cache
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'plusmoments.vn',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/cam-nang', destination: '/blog' },
      { source: '/cam-nang/:slug*', destination: '/blog/:slug*' },
      // Google Ads Dedicated Landing Pages & Conversion Thank You Pages
      { source: '/thank-you', destination: '/cam-on' },
      { source: '/dat-lich-thanh-cong', destination: '/cam-on' },
      { source: '/khuyen-mai', destination: '/uu-dai' },
      { source: '/landing-page', destination: '/uu-dai' },
      { source: '/lp', destination: '/uu-dai' },
      { source: '/lp/:slug*', destination: '/uu-dai' },
    ];
  },
};

export default nextConfig;

