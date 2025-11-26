import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_EVENT_START_TIME: process.env.EVENT_START_TIME,
    NEXT_PUBLIC_EVENT_END_TIME: process.env.EVENT_END_TIME,
  },
};

export default nextConfig;
