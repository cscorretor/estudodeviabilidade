import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGithubPages ? "/estudodeviabilidade" : "",
  assetPrefix: isGithubPages ? "/estudodeviabilidade/" : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? "/estudodeviabilidade" : "",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
