import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/800/**',
      },
      {
        protocol: 'https',
        hostname: 'www.soundhelix.com',
        pathname: '/examples/**',
      },
      {
        protocol: 'https',
        hostname: 'ieum-media-prod.s3.ap-northeast-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
