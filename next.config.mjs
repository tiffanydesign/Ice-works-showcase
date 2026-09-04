/** @type {import('next').NextConfig} */

// Static export for GitHub Pages. The site is served from a project page, so
// every request is prefixed with the repository name.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/Ice-works-showcase";

const nextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
