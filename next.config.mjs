const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  agentRules: false,
  output: 'export',
  basePath,
  assetPrefix: basePath,
};

export default nextConfig;
