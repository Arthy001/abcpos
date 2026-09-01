/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Allow all local network devices (LAN IPs, tablets, scanners, phones) to connect during development
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "192.168.1.*",
    "192.168.0.*",
    "10.0.0.*",
    "172.16.*",
    "172.20.*",
    "*.local",
    "*.lan",
  ],
};

export default nextConfig;
