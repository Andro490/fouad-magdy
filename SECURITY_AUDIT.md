# Security Audit and Fixes

## Summary

This project had multiple real security issues in the backend and frontend auth flow. The critical issues were fixed in the following files:

- `backend/src/middleware/auth.ts`
- `backend/src/utils/jwt.ts`
- `backend/src/server.ts`

## Vulnerabilities Found and Fixed

### 1 JWT bypass via mock tokens

Issue:

- The middleware accepted `mock-jwt-token` and `mock-admin-token` as valid authentication tokens.
- This allowed anyone to bypass JWT validation and access protected routes.

Fix:

- Mock tokens are now rejected by default.
- They are allowed only when explicitly enabled for local non-production testing with `ALLOW_MOCK_TOKENS=true`.

Files:

- `backend/src/middleware/auth.ts`

Test:

- Verify the middleware rejects `Bearer mock-jwt-token`.

Command:

```bash
cd backend
npx tsx --test tests/security.test.ts
```

Expected result:

- `2` tests pass
- `0` tests fail

---

### 2) Hardcoded JWT secret fallback

Issue:

- Default secret used for JWT generation/verification was a hardcoded value.
- In production, this makes token forgery easier.

Fix:

- JWT is now required to have a real `JWT_SECRET` environment variable.
- If missing, the server throws an error instead of using a weak built-in secret.

Files:

- `backend/src/utils/jwt.ts`
- `backend/src/middleware/auth.ts`

Required environment variable:

```bash
JWT_SECRET=your_strong_secret_here
```

---

### 3) Open CORS configuration

Issue:

- `cors` was set to allow all origins with `callback(null, true)`.
- This opens API access to arbitrary domains.

Fix:

- CORS now only allows explicitly listed domains from `ALLOWED_ORIGINS`.
- Default example:

```bash
ALLOWED_ORIGINS=http://localhost:5173
```

File:

- `backend/src/server.ts`

---

### 4) Sensitive admin and chat routes were unprotected

Issue:

- `/api/users`
- `/api/chat/messages`
- `/api/chat/users`

were publicly accessible or allowed unauthorized users to read private data.

Fix:

- These endpoints now require valid JWT authentication.
- Admin-only routes now check `req.user.role === 'ADMIN'`.

Files:

- `backend/src/server.ts`

---

### 5) Telegram and upload secrets were hardcoded or defaulted

Issue:

- Telegram secret (`TELEGRAM_SECRET`) and upload API keys had insecure fallback values.
- This could let attackers trigger manual approval/rejection routes or upload through known public credentials.

Fix:

- Required env variables are enforced.

Required variables:

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
TELEGRAM_SECRET=...
BACKEND_URL=https://your-public-domain.com
IMGBB_API_KEY=...
FREEIMAGE_API_KEY=...
```

Files:

- `backend/src/server.ts`

---

### 6) Registration/login flow used insecure localStorage tokens

Issue:

- JWT was stored in browser `localStorage`.
- This is vulnerable to XSS and token theft.

Status:

- This is a remaining architectural risk in the frontend app because the current app design depends on browser-side JWT storage.
- The proper fix is to move to secure, HttpOnly cookies issued by the backend.

Files:

- `frontend/src/store/authSlice.ts`
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Register.tsx`

Recommended production fix:

- Replace localStorage token storage with secure cookies.
- Set `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict` cookies.
- Keep the JWT short-lived and rotate refresh tokens.

---

## How to Test the Fixes

### 1) Test JWT protection

Run:

```bash
cd backend
npx tsx --test tests/security.test.ts
```

Expected:

- `authenticateToken rejects mock tokens used in local development`
- `authenticateToken requires a real bearer token`
- Both tests pass.

### 2) Test that the API rejects invalid tokens

Run:

```bash
curl -i -H "Authorization: Bearer mock-jwt-token" http://localhost:5000/api/users
```

Expected:

- HTTP `403` or `401`
- JSON response with an error message like `Invalid or expired token.`

### 3) Test CORS restriction

Run from a non-allowed domain and check that the browser cannot call the API.

Expected:

- Browser request is blocked by CORS.

### 4) Test admin-only access

Run:

```bash
curl -i http://localhost:5000/api/users
```

Expected:

- HTTP `401` without token
- HTTP `403` with a non-admin token

### 5) Test Telegram callback validation

Call one of the manual approval endpoints without the proper secret.

Example:

```bash
curl -i "http://localhost:5000/api/checkout/manual-approve?managerId=1&email=test@example.com&secret=wrong-secret"
```

Expected:

- HTTP `403`

---

## Recommended Environment File

Create a `.env` in the backend with at least:

```bash
PORT=5000
JWT_SECRET=replace_with_a_strong_random_secret
ALLOWED_ORIGINS=http://localhost:5173
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
TELEGRAM_SECRET=your_telegram_secret
BACKEND_URL=https://your-public-domain.com
IMGBB_API_KEY=your_imgbb_key
FREEIMAGE_API_KEY=your_freeimage_key
ALLOW_MOCK_TOKENS=false
```

## Final Note

The critical vulnerabilities have been closed in the backend. The remaining frontend token-in-localStorage issue should be addressed as a second phase by switching to secure HttpOnly cookies.
