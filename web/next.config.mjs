/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isProd ? "/am-i-cited" : "",
  assetPrefix: isProd ? "/am-i-cited/" : "",
  images: { unoptimized: true },
};
export default nextConfig;
