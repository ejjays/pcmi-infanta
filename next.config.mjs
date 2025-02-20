import withPWA from 'next-pwa';

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
    handler: 'NetworkFirst',
    options: {
      cacheName: CACHE_NAME,
      networkTimeoutSeconds: 10,
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