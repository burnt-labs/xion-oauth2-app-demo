# Backend + Confidential Client Example

A Next.js demo application showcasing Xion OAuth2 Client integration using Confidential Client OAuth2 flow with server-side token exchange.

## Overview

This example demonstrates how to implement OAuth2 authentication using a **Confidential Client** flow, where:

- The OAuth2 authorization flow is initiated from the frontend
- The authorization code exchange happens on the **server-side** (serverless API routes)
- The `CLIENT_SECRET` is securely stored on the server and never exposed to the client
- Access tokens are stored in httpOnly cookies for security

## Structure

```
backend+confidential_client/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.ts          # Initiates OAuth2 authorization flow
│   │   │   ├── callback.ts       # Handles OAuth2 callback and token exchange
│   │   │   ├── logout.ts         # Logs out user and clears cookies
│   │   │   └── token.ts          # Checks authentication status
│   │   ├── me.ts                 # Proxy API for /api/v1/me
│   │   └── transaction.ts        # Proxy API for /api/v1/transaction
│   ├── index.tsx                 # Login page
│   └── dashboard.tsx             # Protected dashboard page
├── components/
│   ├── Login.tsx                 # Login component
│   ├── Dashboard.tsx            # Dashboard component
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── oauth-config.ts          # OAuth2 configuration utilities
│   ├── api-client.ts            # API client factory
│   └── transactions.ts          # Transaction message builders
└── types/                        # TypeScript type definitions
```

## Features

- **Confidential Client OAuth2 Flow**: Uses `CLIENT_SECRET` for secure token exchange
- **Server-side Token Exchange**: Authorization code is exchanged for tokens on the server
- **Secure Token Storage**: Access tokens stored in httpOnly cookies
- **Protected Routes**: Client-side and server-side route protection
- **API Proxy**: Server-side API routes proxy requests to OAuth2 server with authentication
- **Modern UI**: Same UI as the public client example with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A running Xion OAuth2 server (default: `http://localhost:8787`)
- OAuth2 Client credentials (Client ID and Client Secret)

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:

```env
# OAuth2 Server Configuration
NEXT_PUBLIC_XION_OAUTH2_SERVER_URL=http://localhost:8787

# OAuth2 Client Configuration (Confidential Client)
XION_OAUTH2_CLIENT_ID=your_client_id_here
XION_OAUTH2_CLIENT_SECRET=your_client_secret_here
```

### Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3003`.

## OAuth2 Flow

### 1. Authorization Request

When a user clicks "Sign in with OAuth2":

1. Frontend redirects to `/api/auth/login`
2. Server generates a state parameter and stores it in a cookie
3. Server redirects user to OAuth2 authorization endpoint

### 2. Authorization Callback

After user authorizes:

1. OAuth2 server redirects to `/api/auth/callback` with authorization code
2. Server verifies state parameter from cookie
3. Server exchanges authorization code for access token using `CLIENT_SECRET`
4. Server stores access token in httpOnly cookie
5. Server redirects user to `/dashboard`

### 3. API Requests

When making API requests:

1. Frontend calls Next.js API routes (e.g., `/api/me`)
2. Next.js API route reads access token from cookie
3. Next.js API route proxies request to OAuth2 server with Bearer token
4. Response is returned to frontend

## Key Differences from Public Client Example

| Feature | Public Client | Confidential Client |
|---------|--------------|-------------------|
| Token Exchange | Client-side (browser) | Server-side (API route) |
| Client Secret | Not used | Required and stored on server |
| Token Storage | localStorage | httpOnly cookies |
| PKCE | Required | Optional (not used in this example) |
| Security | Code verifier in browser | Client secret never exposed |

## API Routes

### `/api/auth/login`

Initiates the OAuth2 authorization flow. Redirects user to OAuth2 authorization endpoint.

### `/api/auth/callback`

Handles the OAuth2 callback:

- Verifies state parameter
- Exchanges authorization code for access token
- Stores token in httpOnly cookie
- Redirects to dashboard

### `/api/auth/logout`

Clears the access token cookie and logs out the user.

### `/api/auth/token`

Returns authentication status (without exposing full token).

### `/api/me`

Proxies request to `/api/v1/me` endpoint with authentication.

### `/api/transaction`

Proxies request to `/api/v1/transaction` endpoint with authentication.

## Security Considerations

1. **Client Secret**: Never expose `CLIENT_SECRET` to the client. It's only used in server-side API routes.

2. **State Parameter**: Used for CSRF protection. Stored in httpOnly cookie and verified on callback.

3. **Token Storage**: Access tokens are stored in httpOnly cookies, preventing XSS attacks.

4. **HTTPS**: In production, always use HTTPS to protect cookies and tokens in transit.

5. **Cookie Security**: Consider adding `Secure` flag and `SameSite=Strict` in production.

## Development Scripts

- `pnpm dev` - Start development server on port 3003
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm check-types` - TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Notes

- This example uses Next.js API routes for serverless backend functionality
- The OAuth2 flow uses standard Authorization Code grant type with Confidential Client
- **Passport.js**: While `passport` and `passport-oauth2` are included in dependencies and a strategy is provided in `lib/passport-strategy.ts`, this implementation uses direct `fetch` calls for simplicity. Next.js API routes are stateless serverless functions, making direct HTTP calls more straightforward than setting up Passport middleware. The passport strategy file is provided as a reference for those who prefer to use Passport.js.
- For production deployments, consider using Next.js middleware for route protection
- Consider implementing refresh token flow for long-lived sessions
- Token exchange uses standard OAuth2 form parameters (`client_id` and `client_secret`)
