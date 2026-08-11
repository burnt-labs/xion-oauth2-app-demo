# Resolve remaining dependency vulnerabilities

1. Map all open Dependabot alerts to their direct dependency paths.
2. Upgrade patched packages and remove dependencies whose advisories have no patched release.
3. Regenerate the pnpm lockfile and require a zero-advisory audit.
4. Validate type checking and production builds for both demo applications.
5. Publish the focused pull request and verify its hosted checks.
