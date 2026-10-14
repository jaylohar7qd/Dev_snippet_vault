# Backend

Express API for authentication, snippets, collections, and Gemini assistance.

## Setup

1. Create or edit `.env` in this directory.
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and a private `JWT_SECRET`.
3. Set `GEMINI_API_KEY` to enable the AI endpoint. Keep this key in the backend environment only; never use a `NEXT_PUBLIC_` variable.
4. Run `npm install`, then `npm run dev`.

The server loads `Backend/.env` first and falls back to `Backend/src/.env` for compatibility with existing local setups. Environment variables set by the hosting environment take precedence over `.env` values.

## Database

Run [`supabase/schema.sql`](./supabase/schema.sql) against the Supabase SQL editor for a new database. The API expects the `users`, `collections`, and `snippets` tables and uses the `SUPABASE_SERVICE_KEY` only on the server. Since that key bypasses Supabase row-level security, API queries explicitly scope user-owned records by `user_id`.

## API

Authenticated endpoints require `Authorization: Bearer <JWT>`.

- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET|POST /api/snippets`, `GET|PATCH|DELETE /api/snippets/:id`
- `GET /api/snippets/public/:id` returns only explicitly public snippets
- `GET|POST /api/collections`, `PATCH|DELETE /api/collections/:id`
- `POST /api/ai/assist` accepts `{ "action": "generate|explain|improve", "prompt": "...", "code": "...", "language": "..." }`. For `explain`, `code` is required and `prompt` is optional; without a prompt, the AI returns a short explanation of the code.
- `GET /api/health`

The AI endpoint is authenticated and rate-limited. It returns `{ "action": "...", "text": "..." }`; it does not save generated content automatically. The snippet editor can use the `explain` action to generate an editable description from its current code. `GEMINI_MODEL` is optional and defaults to `gemini-3.5-flash-lite`; set it to another model currently supported by the Gemini API if needed.

The built-in rate limiter is per-process. Deployments with multiple API instances should use a shared rate-limit store to enforce a global limit.
