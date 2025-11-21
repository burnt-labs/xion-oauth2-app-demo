# Xion OAuth2 App Demo

A monorepo containing multiple example applications demonstrating Xion OAuth2 Client integration, managed with Turbo.

## Structure

```
xion-oauth2-app-demo/
├── examples/
│   └── frontend+public_client/    # Frontend example with Public Client OAuth2 flow
├── turbo.json                     # Turbo configuration
├── pnpm-workspace.yaml           # pnpm workspace configuration
└── package.json                   # Root package.json for monorepo management
```

## Examples

### Frontend + Public Client

A frontend demo application showcasing Xion OAuth2 Client integration using standard OAuth2 authorization flow with PKCE.

**Location**: `examples/frontend+public_client/`

**Features**:
- Standard OAuth2 authorization flow (Authorization Code with PKCE)
- Token management with localStorage
- Protected routes
- API testing interface with console output
- Modern UI with Tailwind CSS

See [examples/frontend+public_client/README.md](./examples/frontend+public_client/README.md) for detailed setup and usage instructions.

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Run Examples

Run all examples using Turbo:

```bash
# Run all examples in development mode
pnpm dev

# Build all examples
pnpm build

# Type check all examples
pnpm check-types

# Lint all examples
pnpm lint
```

Or run a specific example:

```bash
# Run frontend+public_client example
cd examples/frontend+public_client
pnpm dev
```

## Development

- `pnpm install` - Install all dependencies
- `pnpm dev` - Run all examples in development mode (via Turbo)
- `pnpm build` - Build all examples (via Turbo)
- `pnpm lint` - Lint all examples (via Turbo)
- `pnpm check-types` - Type check all examples (via Turbo)
- `pnpm format` - Format all code
- `pnpm format:check` - Check code formatting
- `pnpm clean` - Clean all build artifacts (via Turbo)

## Adding New Examples

To add a new example:

1. Create a new directory under `examples/` (e.g., `examples/backend+confidential_client`)
2. Add your example project files
3. Ensure it has its own `package.json` with appropriate scripts
4. Update this README with the new example description

## Turbo

This monorepo uses [Turbo](https://turbo.build/) for fast, cached builds and task orchestration. Turbo automatically:

- Caches build outputs
- Runs tasks in parallel when possible
- Tracks dependencies between packages
- Provides incremental builds

