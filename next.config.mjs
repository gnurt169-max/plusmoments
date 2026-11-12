import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion'],
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    deviceSizes: [640, 1440, 1920],
    imageSizes: [384, 640],
    formats: ['image/webp'],
    minimumCacheTTL: 31536000,
    localPatterns: [
      {
        pathname: '/uploads/**',
      },
      {
        pathname: '/images/**',
      },
    ],
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
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
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

