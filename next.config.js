/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: 'build',
  basePath: '/dyno-jump',
  output: 'export',
  images: {
    unoptimized: true,
    path: `/dyno-jump/_next/image`,
  }
}

module.exports = nextConfig
