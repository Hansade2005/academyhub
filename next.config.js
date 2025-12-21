/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: 'api.a0.dev',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf.js-extract', 'canvas'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }

    // Mark pdf.js-extract as external for server-side only
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'pdf.js-extract': 'pdf.js-extract',
        'canvas': 'canvas',
      });
    }

    return config;
  },
}

module.exports = nextConfig