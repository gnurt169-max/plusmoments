import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
      '@heroicons/react',
    ],
  },
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
      { source: '/lien-he', destination: '/contact' },
      // Google Ads Dedicated Landing Pages & Conversion Thank You Pages
      { source: '/thank-you', destination: '/cam-on' },
      { source: '/dat-lich-thanh-cong', destination: '/cam-on' },
      { source: '/khuyen-mai', destination: '/uu-dai' },
      { source: '/landing-page', destination: '/uu-dai' },
      { source: '/lp', destination: '/uu-dai' },
      { source: '/lp/:slug*', destination: '/uu-dai' },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      const emptyPolyfillPath = path.resolve(__dirname, 'src/lib/empty-polyfill.js');
      const polyfillModulePath = path.resolve(
        __dirname,
        'node_modules/next/dist/build/polyfills/polyfill-module.js'
      );

      config.resolve.alias = {
        ...config.resolve.alias,
        'next/dist/build/polyfills/polyfill-module': emptyPolyfillPath,
        'next/dist/build/polyfills/polyfill-module.js': emptyPolyfillPath,
        [polyfillModulePath]: emptyPolyfillPath,
      };
    }
    return config;
  },
};

export default nextConfig;

