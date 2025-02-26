/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['img.clerk.com'],
  },
  webpack: (config) => {
    // Add module resolution for @ alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    
    config.externals = [...(config.externals || []), {
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    }];
    return config;
  },
};

module.exports = withPWA(nextConfig);