/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? "/syntax-studio" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/syntax-studio/" : "",
};

module.exports = nextConfig;
