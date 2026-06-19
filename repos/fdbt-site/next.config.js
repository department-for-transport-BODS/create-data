/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.(pdf|csv)$/,
            type: 'asset/resource',
            generator: {
                filename: 'static/chunks/[path][name].[hash][ext]'
            },
        });

        config.resolve = { ...config.resolve, symlinks: false };

        if (!isServer) {
            config.resolve.fallback.fs = false;
        }

        return config;
    },
};
  
module.exports = nextConfig

