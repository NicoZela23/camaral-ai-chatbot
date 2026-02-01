/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        stream: false,
        util: false,
      };

      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("chromadb");
      } else {
        config.externals = [config.externals, "chromadb"];
      }
    }

    return config;
  },
  serverExternalPackages: ["chromadb"],
};

module.exports = nextConfig;
