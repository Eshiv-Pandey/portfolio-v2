import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [360, 414, 640, 768, 1024, 1280],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2678400,
    qualities: [60, 70, 75, 90, 100],
    remotePatterns: [
      // Medium post thumbnails (writing section)
      {
        protocol: "https",
        hostname: "miro.medium.com",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "cdn-images-1.medium.com",
        port: "",
        pathname: "/**",
        search: "",
      },
      // GitHub avatars / profile images. No `search` constraint: avatar URLs
      // always carry a query string (?v=4, ?s=200, …), and `search: ""` would
      // require none and reject them.
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
        port: "",
        pathname: "/eshiv-pandey.png",
        search: "",
      },
    ],
  },
};

export default nextConfig;
