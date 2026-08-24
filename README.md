# FOUAD F9 Project

This project contains a full-stack app with a React frontend and an Express + Prisma backend.

## Project Structure

- `backend/` — Express API, Prisma schema, JWT auth, payment, upload, chat
- `frontend/` — React + Vite app
- `.env.example` — sample environment variables for both backend and frontend

## Local Setup

### 1) Clone and install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 2) Configure environment variables

Create a backend `.env` file based on the sample:

```bash
cp .env.example .env
```

Then adjust the values for your local environment.

Required backend variables:

```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_a_strong_random_secret
ALLOWED_ORIGINS=http://localhost:5173
ALLOW_MOCK_TOKENS=false
DATABASE_URL=postgresql://user:password@localhost:5432/your_db
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
TELEGRAM_SECRET=your_telegram_secret
BACKEND_URL=https://your-public-domain.com
IMGBB_API_KEY=your_imgbb_key
FREEIMAGE_API_KEY=your_freeimage_key
```

Required frontend variables:

```bash
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3) Prisma setup

```bash
cd backend
npx prisma generate
npx prisma db push
```

If using SQLite or another database, update `DATABASE_URL` accordingly in `.env`.

## Run the app

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open the frontend in the browser at:

```bash
http://localhost:5173
```

## Important Security Notes

- JWT tokens are validated server-side
- Mock tokens are disabled by default
- CORS is restricted to allowed origins only
- Authentication uses secure cookies for browser sessions
- Tokens are no longer stored in `localStorage`
- Sensitive secrets must be stored in environment variables, not hardcoded in code

## Security Audit and Validation

Run the backend security regression tests:

```bash
cd backend
npx tsx --test tests/security.test.ts
```

Expected result:

- 2 tests pass
- 0 tests fail

Type-check the backend:

```bash
cd backend
npx tsc --noEmit
```

## Production Recommendations

- Use `NODE_ENV=production`
- Set strong secure `JWT_SECRET`
- Restrict `ALLOWED_ORIGINS` to real deployed frontend domains
- Keep `secure: true` on cookies in production
- Rotate Telegram and upload credentials regularly
- Use HTTPS only in production
- Consider using a real session store or secure auth service for large-scale deployment

## Related Documentation

- [SECURITY_AUDIT.md](SECURITY_AUDIT.md)
