/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mbh-storage.s3.ap-southeast-2.amazonaws.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://netflix-be-1.onrender.com/v1/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/verifications",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
