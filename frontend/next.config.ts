import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Event config is now fetched dynamically from backend API
  // No need for NEXT_PUBLIC_EVENT_* env vars
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.us-east-2.amazonaws.com',
        port: '',
        pathname: '/harrowco.fr/**',
      },
    ],
  },
};

export default nextConfig;
