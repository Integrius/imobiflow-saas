/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'], // Para imagens do Google OAuth
    unoptimized: true, // Cloudflare Workers não suporta Image Optimization
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://imobiflow-saas-1.onrender.com',
  },
  eslint: {
    ignoreDuringBuilds: true, // Cloudflare tem limite de tempo de build
  },
}

module.exports = nextConfig
