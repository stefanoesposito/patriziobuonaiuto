import type {NextConfig} from 'next';
const config: NextConfig = {
  images: {remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/abnzzs23/**'}]},
  async redirects() {
    return [
      {source: '/', destination: '/it', permanent: false},
      {source: '/it/index', destination: '/it', permanent: true},
      {source: '/en/index', destination: '/en', permanent: true},
      {source: '/it/cv', destination: '/it/su-di-me', permanent: true},
      {source: '/en/cv', destination: '/en/about-me', permanent: true},
      {source: '/concept/immersive-gallery', destination: '/concept/immersive-gallery.html', permanent: false},
    ];
  },
};
export default config;
