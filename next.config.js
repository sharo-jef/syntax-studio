/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? "/my-syntax" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/my-syntax/" : "",
};

module.exports = nextConfig;
