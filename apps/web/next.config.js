import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static file serving için gerekli ayarlar
  trailingSlash: false,
  // Development mode için optimize edilmiş ayarlar
  experimental: {
    // Server components için optimize edilmiş ayarlar
    serverComponentsExternalPackages: [],
  },
  // Webpack konfigürasyonu
  webpack: (config, { dev, isServer }) => {
    // Development mode için optimize edilmiş ayarlar
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
