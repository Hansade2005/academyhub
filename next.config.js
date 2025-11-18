/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
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