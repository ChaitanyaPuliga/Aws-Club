# Club Member Portal

A members-only AWS Student Builder Groups portal based on the 70% reference brief. It provides email/password authentication, password recovery through Neon Auth, a protected document-grounded chat, source citations, chat history, and a safe campus-contact fallback.

## Run the demo

Use this repository for both processes (there is another `aws-club-updated` folder on some machines; do not start that copy).

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

The API seeds or updates all eight starter documents at startup. To seed manually or inspect data:

```bash
cd backend
npm run db:seed
npm run db:studio
```

## Demo flow

1. Open the welcome page and create an account.
2. Sign in and open the dashboard; the member profile is synchronized to `user_profiles`.
3. Ask “How do I publish on Builder Center?” and show the source file/section.
4. Ask “When is the next workshop?” and show the source.
5. Ask something outside the documents and show the campus AWS Student Builder fallback.
6. Demonstrate forgot password.

## Architecture

- `frontend`: React/Vite UI, Neon Auth UI, protected routes, responsive portal layout.
- `backend`: Express API, JWT verification through Neon Auth JWKS, Prisma/PostgreSQL persistence.
- `backend/documents`: the eight official starter documents.
- `backend/prisma/seed.js`: idempotent starter-pack loader.
- `backend/templates`: Builder Center article and demo checklist.

The current local retrieval layer intentionally answers only from the starter pack. A future AWS deployment can map authentication to Cognito, reset email to SES, documents to S3, retrieval/answers to Bedrock, and the API to App Runner or ECS.

## Troubleshooting profiles

If `user_profiles` is empty, confirm the backend process is running from this directory and that port 5000 is not occupied by another project copy. After signing in, open `/dashboard`; the backend logs `[profile-sync] GET /api/users/me auth=true` when the synchronization request arrives.
