import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_EVENT_START_TIME: process.env.EVENT_START_TIME,
    NEXT_PUBLIC_EVENT_END_TIME: process.env.EVENT_END_TIME,
  },
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
