import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable experimental features for serverless PDF generation
  experimental: {
    // Allow importing from parent directory (node library)
    externalDir: true,
  },

  // Configure webpack for @resvg/resvg-js native module and .ts extension handling
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark native modules as external on server
      config.externals = config.externals || [];
      config.externals.push({
        '@resvg/resvg-js': '@resvg/resvg-js',
      });
    }

    // Handle .ts imports from node library (which uses explicit .ts extensions)
    config.resolve = config.resolve || {};
    config.resolve.extensionAlias = {
      '.ts': ['.ts', '.tsx', '.js', '.jsx'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };

    return config;
  },
};

export default nextConfig;
