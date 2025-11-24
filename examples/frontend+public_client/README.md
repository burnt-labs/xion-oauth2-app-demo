# Frontend + Public Client Example

A frontend demo application showcasing Xion OAuth2 Client integration using standard OAuth2 authorization flow with PKCE for Public Clients.

## Structure

```
xion-oauth2-app-demo/
├── examples/
│   └── frontend+public_client/    # Frontend example with Public Client OAuth2 flow
└── package.json                    # Root package.json for monorepo management
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

Run a specific example:

```bash
# Run frontend+public_client example
cd examples/frontend+public_client
pnpm dev
```

Or from the root:

```bash
# Run all examples (if they have dev scripts)
pnpm dev
```

## Development

- `pnpm install` - Install all dependencies
- `pnpm format` - Format all code
- `pnpm format:check` - Check code formatting
- `pnpm lint` - Lint all examples

## Adding New Examples

To add a new example:

1. Create a new directory under `examples/` (e.g., `examples/backend+confidential_client`)
2. Add your example project files
3. Ensure it has its own `package.json`
4. Update this README with the new example description
