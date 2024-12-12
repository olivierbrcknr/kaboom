const nextConfig = {
  exportPathMap: function () {
    return {
      "/": { page: "/" },
      "/rules": { page: "/rules" },
    };
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  trailingSlash: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });

    return config;
  },
};

export default nextConfig;
