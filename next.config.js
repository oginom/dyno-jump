/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: 'build',
  assetPrefix: '/dyno-jump',
  basePath: '/dyno-jump',
  output: 'export',
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig
