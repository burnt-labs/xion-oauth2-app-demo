/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@burnt-labs/xion-types'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'unload=()',
          },
        ],
      },
    ]
  },
  webpack: (config) => {
    // Ensure TypeScript files from @burnt-labs/xion-types are not excluded
    const tsRule = config.module.rules.find(
      (rule) =>
        rule.test &&
        (rule.test.toString().includes('\\.ts') ||
          rule.test.toString().includes('\\.tsx'))
    )

    if (tsRule) {
      const originalExclude = tsRule.exclude

      tsRule.exclude = (filePath, ...args) => {
        // Always allow @burnt-labs/xion-types files
        if (filePath?.includes('@burnt-labs/xion-types') || filePath?.includes('xion-types')) {
          return false
        }

        // Apply original exclude logic
        if (!originalExclude) {
          return filePath?.includes('node_modules') ?? false
        }

        if (typeof originalExclude === 'function') {
          return originalExclude(filePath, ...args)
        }

        if (Array.isArray(originalExclude)) {
          return originalExclude.some((exclude) => {
            if (typeof exclude === 'string') {
              return filePath?.includes(exclude) ?? false
            }
            if (exclude instanceof RegExp) {
              return filePath ? exclude.test(filePath) : false
            }
            if (typeof exclude === 'function') {
              return exclude(filePath, ...args)
            }
            return false
          })
        }

        if (originalExclude instanceof RegExp) {
          return filePath ? originalExclude.test(filePath) : false
        }

        return false
      }
    }

    return config
  },
}

module.exports = nextConfig
