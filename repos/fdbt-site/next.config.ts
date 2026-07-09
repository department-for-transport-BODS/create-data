import { NextConfig } from 'next';

const nextConfig: NextConfig = {
    poweredByHeader: false,
    sassOptions: {
        quietDeps: true,
        loadPaths: ['node_modules'],
    },
    turbopack: {
        root: process.cwd(),
    },
};

export default nextConfig;
