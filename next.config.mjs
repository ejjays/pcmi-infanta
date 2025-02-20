import withPWA from 'next-pwa';

const CACHE_NAME = 'pcmi-cache-v2-' + new Date().getTime();

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [{
  urlPattern: /^https?.*/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'offline-cache',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 30 * 24 * 60 * 60 
    },
    plugins: [
      {
        handlerDidError: async () => await caches.match('/offline'),
      },
    ],
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