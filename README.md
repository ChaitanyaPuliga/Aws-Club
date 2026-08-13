# Club Member Portal

A members-only **AWS Student Builder Groups Club Member Portal** built with React, Express, Neon Auth, Prisma, and PostgreSQL/Neon.

The portal provides authenticated member access to club knowledge, a document-grounded chatbot, conversation history, source citations, and a document publishing/re-indexing workflow for administrators.

## Project Status

The existing 70% portal is working, and the backend document publishing/re-indexing foundation for the remaining 30% is implemented and tested.

### Implemented

- Email/password authentication with Neon Auth UI.
- Protected member routes.
- Member dashboard, profile, settings, documents, and chat pages.
- PostgreSQL persistence through Prisma.
- Eight starter club documents loaded through the Prisma seed process.
- `Document` → `DocumentChunk` data model for retrieval.
- Lexical RAG over active document chunks.
- Local grounded answer generation through `config/ai.js`.
- Conversation and message persistence.
- Source metadata returned with chatbot responses.
- Campus AWS Student Builder contact fallback when retrieval is weak.
- Admin role support through `UserProfile.role` (`MEMBER` / `ADMIN`).
- Admin document publish/update APIs.
- Markdown-to-chunk conversion during publish/update.
- Transactional document re-indexing.
- Verified flow: publish a new document → create chunks → chatbot retrieves the new content.

### Remaining hackathon integration

The onsite 30% phase still requires the final admin frontend, automatic member document-list refresh, the evaluator `POST /ask` API on port `8080`, event-day briefing data, smoke tests, and event-Wi-Fi validation.

## Architecture

```text
Member Browser
    |
    v
React / Vite
    |
    |  apiFetch() + Neon Auth token
    v
Express Backend (:5000 currently)
    |
    +--------------------+
    |                    |
    v                    v
Authentication         Modules
    |                    |
    v                    +-- Chat
Neon Auth               +-- Users
                         +-- Documents
                              |
                              v
                         Document Service
                              |
                              v
                  Document -> DocumentChunk[]
                              |
                              v
                         PostgreSQL / Prisma
                              |
                              v
                         RAG Service
                              |
                              v
                            ai.js
                              |
                              v
                       Grounded answer
```

### Chat flow

```text
Chat page
   ↓
useChat / apiFetch
   ↓
POST /api/chat
   ↓
JWT verification
   ↓
chat.controller.js
   ↓
chat.service.js
   ├── rag.service.js
   │      ↓
   │   DocumentChunk search
   │      ↓
   │   relevant chunks
   │
   └── config/ai.js
          ↓
     grounded local answer
   ↓
answer + sources + fallback
   ↓
Prisma Message
   ↓
React UI
```

## Technology Stack

### Frontend

- React 19
- React Router
- Vite
- Neon Auth UI
- CSS

### Backend

- Node.js
- Express 5
- Prisma 7
- PostgreSQL / Neon
- `jose` for JWT/JWKS verification
- Local lexical RAG
- Local AI provider abstraction

## Folder Structure

```text
Aws-Club/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── AuthProvider.jsx
│   │   │   │   └── MemberLayout.jsx
│   │   │   └── common/chat/
│   │   │       ├── ChatInput.jsx
│   │   │       ├── ChatMessage.jsx
│   │   │       ├── ChatWindow.jsx
│   │   │       └── SourceCitation.jsx
│   │   ├── hooks/
│   │   │   └── useChat.js
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   └── member/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Chat.jsx
│   │   │       ├── Chats.jsx
│   │   │       ├── Documents.jsx
│   │   │       ├── Profile.jsx
│   │   │       ├── ProfileTest.jsx
│   │   │       └── Settings.jsx
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── styles/
│   │       ├── auth.css
│   │       ├── chat.css
│   │       └── portal.css
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── ai.js
│   │   │   └── db.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── error.js
│   │   ├── modules/
│   │   │   ├── users/
│   │   │   ├── chat/
│   │   │   └── documents/
│   │   ├── rag/
│   │   │   └── rag.service.js
│   │   ├── app.js
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   ├── documents/
│   │   └── 01-08 starter Markdown files
│   ├── templates/
│   ├── .env
│   └── package.json
│
├── docs/
└── README.md
```

## Data Model

The portal uses the existing Prisma/PostgreSQL model:

```text
UserProfile
  ├── authUserId
  ├── fullName
  └── role (MEMBER | ADMIN)

Document
  └── DocumentChunk[]

DocumentChunk
  ├── documentId
  ├── chunkIndex
  ├── sectionTitle
  ├── content
  └── optional embedding field

Conversation
  └── Message[]
```

## Authentication

Neon Auth provides the member identity and JWT.

The backend verifies the JWT with the Neon Auth JWKS endpoint before protected requests are processed.

Admin document operations additionally check the authenticated user's `UserProfile.role`.

Use `ADMIN` only for accounts that should be allowed to publish or update club documents.

## Environment Variables

### Backend `.env`

Create `backend/.env` with values appropriate for your Neon/Auth project:

```env
DATABASE_URL=your_neon_database_url
NEON_AUTH_URL=your_neon_auth_url
NEON_AUTH_JWKS_URL=your_neon_auth_jwks_url
AI_PROVIDER=local
RAG_MIN_SCORE=0.35
```

Do not commit real secrets to Git.

### Frontend `.env`

```env
VITE_NEON_AUTH_URL=your_neon_auth_url
```

The frontend API helper currently falls back to:

```text
http://localhost:5000
```

or can be configured with:

```env
VITE_API_URL=http://localhost:5000
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ChaitanyaPuliga/Aws-Club.git
cd Aws-Club
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Prepare the database

Make sure `DATABASE_URL` points to the correct PostgreSQL/Neon database.

For an existing database, use the project's Prisma migrations as appropriate.

### 5. Seed the starter documents

```bash
npm run db:seed
```

The seed process creates or updates the eight starter documents and their searchable chunks.

### 6. Start the backend

```bash
npm run dev
```

Current local backend port:

```text
http://localhost:5000
```

### 7. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite normally serves the frontend at a local development URL such as:

```text
http://localhost:5173
```

## Useful Commands

### Backend

```bash
cd backend
npm run dev
npm run start
npm run db:seed
npm run db:studio
npx prisma generate
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

## Main API Endpoints

### Health

```http
GET /api/health
```

### Member documents

```http
GET /api/documents
```

```http
GET /api/documents/:id
```

### Existing chatbot

```http
POST /api/chat
Authorization: Bearer <JWT>
Content-Type: application/json
```

Request example:

```json
{
  "message": "How do I publish on Builder Center?"
}
```

### Admin document publishing

```http
POST /api/documents/admin/publish
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json
```

Example:

```json
{
  "title": "Event Day Briefing",
  "fileName": "event-day-briefing.md",
  "description": "Event day schedule and judging details.",
  "content": "# Event Day Briefing\n\n## Judging\n\nJudging starts at 2 PM."
}
```

### Admin document update

```http
PUT /api/documents/admin/:id
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json
```

Publishing or updating a document automatically rebuilds its `DocumentChunk` rows in a Prisma transaction.

## RAG and Answer Generation

The current retrieval system is deliberately simple and local because the project only has a small number of documents.

```text
Question
   ↓
Tokenization / lexical scoring
   ↓
Active DocumentChunk rows
   ↓
Top relevant chunks
   ↓
config/ai.js
   ↓
Local grounded answer
```

The AI provider abstraction is kept in `backend/src/config/ai.js`.

Current provider:

```env
AI_PROVIDER=local
```

The Bedrock provider is intentionally left as a future integration point rather than putting AWS credentials in the frontend.

## Document Re-indexing

When an administrator publishes or updates a document:

```text
Admin request
   ↓
Document create/update
   ↓
Delete previous chunks when updating
   ↓
Markdown split into logical sections
   ↓
Create new DocumentChunk rows
   ↓
Commit transaction
```

This makes the newly published content immediately available to the existing RAG search path.

## Prisma Studio

To inspect documents and chunks:

```bash
cd backend
npm run db:studio
```

Useful tables/models to inspect:

- `UserProfile`
- `Document`
- `DocumentChunk`
- `Conversation`
- `Message`

## Hackathon 30% Integration

The onsite phase requires the portal to add:

1. Admin document add/update.
2. Re-indexing after publish.
3. Chat synchronization with the latest document index.
4. Member document-list synchronization.
5. `event-day-briefing.md` retrieval and citations.
6. Three smoke-test questions with pass/fail results.
7. Evaluator API:

```http
POST http://<machine-ip>:8080/ask
```

Required request:

```json
{
  "question": "..."
}
```

Required top-level response shape:

```json
{
  "answer": "...",
  "sources": [
    {
      "document": "event-day-briefing.md",
      "rank": 1
    }
  ]
}
```

The evaluator endpoint must listen on `0.0.0.0:8080` so judges can reach the laptop over the event Wi-Fi.

The current repository state already contains the document publish/re-index backend foundation. The evaluator `/ask` network endpoint and remaining event-day/demo work should be completed before the final hackathon test.

## Security Notes

- Never commit `backend/.env` or frontend secrets.
- Keep AWS credentials on the backend only.
- Do not expose database credentials to React.
- Keep admin authorization enforced by the backend.
- Do not log passwords, authentication tokens, or private student information.

## Future AWS Integration

The current architecture is intentionally provider-separated so AWS can be integrated later without redesigning the frontend.

A future deployment can map:

```text
Neon Auth / current auth
        ↓
AWS authentication service as appropriate

PostgreSQL / Neon
        ↓
AWS-managed persistence if required

config/ai.js local provider
        ↓
Amazon Bedrock

Local document storage
        ↓
S3 / other AWS storage

Current Express API
        ↓
AWS hosting such as App Runner / ECS / Lambda + API Gateway
```

The important design constraint is to keep frontend code independent of AWS credentials and keep the AI provider abstraction behind `ai.js`.

## Demo Flow

A normal member demo:

1. Open the portal.
2. Register or sign in.
3. Open the dashboard.
4. Open Documents and browse the official club material.
5. Ask the chatbot a question from the documents.
6. Show the source document/section.
7. Ask an unrelated question and show the grounded fallback.
8. Open My Chats to demonstrate persisted conversations.

Admin/onsite demo:

1. Sign in as an `ADMIN`.
2. Publish or update a document.
3. Verify new `DocumentChunk` rows in Prisma.
4. Ask a question whose answer is in the new document.
5. Show the source citation.
6. Run the required smoke tests.
7. Test `POST /ask` from Thunder Client/curl.
8. Connect the evaluator test over the event Wi-Fi.

## License

No project license has been specified in the current repository.
