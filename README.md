# Xion OAuth2 App Demo

A frontend demo application showcasing Xion OAuth2 Client integration using standard OAuth2 authorization flow.

## Features

- Standard OAuth2 authorization flow (Authorization Code with PKCE)
- Token management with localStorage
- Protected routes
- API testing interface with console output
- Modern UI with Tailwind CSS

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env` file:

```env
VITE_XION_OAUTH2_SERVER_URL=http://localhost:8787
VITE_XION_OAUTH2_CLIENT_ID=your-client-id
```

Note: `VITE_REDIRECT_URI` is automatically set to `{current_host}/callback` and doesn't need to be configured.

3. Start development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:3002`

## Usage

1. **Login Page**: Click "Sign in with OAuth2" to start the authorization flow
2. **Callback**: After authorization, you'll be redirected back with an authorization code
3. **Dashboard**: Once authenticated, you can:
   - View token information
   - Test the transaction API
   - View console output for API calls
   - Logout

## OAuth2 Flow

This demo implements the standard OAuth2 Authorization Code flow with PKCE:

1. User clicks login button
2. App generates PKCE code verifier and challenge
3. User is redirected to OAuth2 authorization server
4. User authorizes the application
5. Authorization server redirects back with authorization code
6. App exchanges code for access token
7. Token is stored in localStorage
8. User can now make authenticated API calls

## API Testing

The dashboard includes a test button that calls `/api/v1/transaction/test` endpoint to verify OAuth2 authentication is working correctly.
