import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [{
    urlPattern: /^https?.*/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'offlineCache',
      expiration: {
        maxEntries: 200,
      },
    },
  }],
  buildExcludes: [/middleware-manifest.json$/],
  scope: '/',
});

const nextConfig = {
  ...pwaConfig,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
};

export default nextConfig;