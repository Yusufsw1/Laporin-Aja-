// next.config.mjs atau next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Contoh jika pakai Cloudinary
      },
      {
        protocol: "https",
        hostname: "backend-laporin.vercel.app", // Sesuaikan dengan tempat simpan gambar kamu
      },
    ],
  },
};

export default nextConfig;
