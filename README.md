# SaaS Automation Builder

A full-stack AI workflow automation platform that allows users to create workflows, trigger them through secure webhooks, process jobs in the background using Redis/BullMQ, and store OpenAI-generated execution results with full audit history.

This project was built to demonstrate real-world SaaS backend architecture including authentication, multi-tenancy, secure webhooks, background workers, AI integration, execution observability, retry handling, and Docker-based local infrastructure.

---

## Demo

Local app:

```text
http://localhost:3000
```

Demo flow:

```text
Sign up → Create workflow → Generate webhook secret → Trigger webhook → Process with OpenAI → View execution output
```

---

## Features

- User signup and login with custom session authentication
- HTTP-only session cookies
- Organization-based multi-tenant data model
- Workflow creation and management
- Secure webhook trigger URLs
- Webhook secret rotation with hashed secrets
- Redis-backed background job processing using BullMQ
- Background worker for async workflow execution
- OpenAI-powered workflow step execution
- Execution detail page with input/output JSON
- Retry support for failed executions
- Audit logs for important activity
- Dashboard with workflow and execution metrics
- Docker Compose setup for local development

---

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | Next.js App Router, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL |
| ORM | Prisma |
| Queue | Redis, BullMQ |
| AI | OpenAI API |
| Auth | Custom session auth, HTTP-only cookies |
| Infrastructure | Docker, Docker Compose |

---

## Architecture

```mermaid
flowchart TD
    A[User Browser] --> B[Next.js App]
    B --> C[PostgreSQL Database]
    B --> D[Redis Queue]

    E[External Client / Webhook Sender] --> F[Webhook API Route]
    F --> G[Validate Webhook Secret]
    G --> C
    G --> D

    D --> H[Workflow Worker]
    H --> C
    H --> I[OpenAI API]
    I --> H
    H --> C

    C --> J[Execution Details UI]
    C --> K[Audit Logs UI]
```

---

## System Flow

```mermaid
sequenceDiagram
    participant Client as External Client
    participant API as Webhook API
    participant DB as PostgreSQL
    participant Queue as Redis/BullMQ
    participant Worker as Worker
    participant AI as OpenAI

    Client->>API: POST webhook payload + x-webhook-secret
    API->>DB: Validate webhook and create execution
    API->>Queue: Enqueue workflow job
    API-->>Client: 202 Accepted

    Queue->>Worker: Deliver execution job
    Worker->>DB: Load workflow and steps
    Worker->>DB: Mark execution RUNNING
    Worker->>AI: Send prompt + webhook payload
    AI-->>Worker: Return structured JSON
    Worker->>DB: Store step output
    Worker->>DB: Mark execution SUCCESS
```

---

## How It Works

1. A user signs up and creates an organization.
2. The user creates a workflow with a webhook trigger.
3. The app generates a webhook URL and a secret.
4. The secret is shown once and stored only as a hash.
5. An external system sends a POST request to the webhook URL.
6. The API validates the `x-webhook-secret` header.
7. A workflow execution record is created in PostgreSQL.
8. The execution job is pushed into Redis using BullMQ.
9. A background worker processes the workflow asynchronously.
10. The worker sends the webhook payload to OpenAI.
11. OpenAI returns structured output such as classification, summary, and recommended action.
12. The output is stored in PostgreSQL and displayed in the UI.

---

## Example Webhook Request

```bash
curl -X POST http://localhost:3000/api/webhooks/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_WEBHOOK_SECRET" \
  -d '{
    "leadName": "Sarah Johnson",
    "email": "sarah@example.com",
    "company": "GrowthOps AI",
    "message": "We need pricing for 500 employees and want a demo this week."
  }'
```

---

## Example OpenAI Output

```json
{
  "classification": "hot",
  "summary": "Sarah Johnson from GrowthOps AI requested enterprise pricing for 500 employees and wants a demo this week.",
  "recommendedAction": "Respond immediately, schedule a demo within 24 hours, and prepare enterprise pricing details.",
  "confidence": 0.94
}
```

---

## Project Structure

```text
app/
  api/
    auth/
    workflows/
    workflow-steps/
    webhooks/
    executions/
  dashboard/
  workflows/
  executions/
  audit-logs/
  demo/

lib/
  auth.ts
  prisma.ts
  redis.ts
  tenant.ts
  workflow-queue.ts
  workflow-runner.ts
  openai-action.ts
  webhook-secret.ts

workers/
  workflow-worker.ts

prisma/
  schema.prisma

docker-compose.yml
Dockerfile
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Anveshvarmad/saas-automation-builder.git
cd saas-automation-builder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/saas_builder"
REDIS_URL="redis://localhost:6380"
OPENAI_API_KEY="your_openai_api_key_here"
OPENAI_MODEL="gpt-5.2"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Do not commit `.env`.

---

## Running Locally with Docker

Start all services:

```bash
docker compose up -d --build
```

This starts:

```text
Next.js web app
PostgreSQL
Redis
Workflow worker
```

Open the app:

```text
http://localhost:3000
```

Stop all services:

```bash
docker compose down
```

Stop services and delete database volume:

```bash
docker compose down -v
```

Use `-v` only if you want to delete local database data.

---

## Prisma Commands

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations locally:

```bash
npx prisma migrate dev
```

Apply migrations in production:

```bash
npx prisma migrate deploy
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

## Development Commands

Run Next.js locally:

```bash
npm run dev
```

Run the worker locally:

```bash
npm run worker
```

Build the app:

```bash
npm run build
```

Start production build:

```bash
npm run start
```

---

## Main Database Models

- `User`
- `Session`
- `Organization`
- `OrganizationMember`
- `Workflow`
- `WorkflowStep`
- `WebhookEndpoint`
- `WorkflowExecution`
- `WorkflowExecutionStep`
- `AuditLog`

---

## Security Features

### Webhook Secret Hashing

Webhook secrets are not stored in plain text. The app stores a SHA-256 hash of the secret and verifies incoming requests using the `x-webhook-secret` header.

### Tenant Isolation

Most records are scoped by `organizationId`, so users can only access workflows, executions, and logs belonging to their organization.

### HTTP-only Cookies

Authentication uses HTTP-only cookies to reduce exposure to client-side JavaScript.

---

## Reliability Features

- Background job processing with Redis and BullMQ
- Execution status tracking: `QUEUED`, `RUNNING`, `SUCCESS`, `FAILED`
- Step-level input/output logs
- Error message persistence
- Retry support for failed executions
- Audit logs for sensitive actions

---

## Demo Script

1. Open the landing page.
2. Sign up for a new account.
3. Create a workflow.
4. Set the workflow status to `ACTIVE`.
5. Generate a webhook secret.
6. Trigger the webhook using curl.
7. Open the execution detail page.
8. Show webhook input and OpenAI output.
9. Show audit logs.
10. Retry a failed execution if available.

---

## Key Engineering Highlights

- Built a multi-tenant SaaS workflow platform from scratch
- Designed secure webhook authentication using hashed secrets
- Implemented asynchronous processing using Redis and BullMQ
- Integrated OpenAI into workflow execution
- Added execution observability with step-level input/output logs
- Added retry support for failed jobs
- Built audit logging for workflow, webhook, and execution events
- Dockerized the full local development environment

---

## Future Improvements

- Add drag-and-drop workflow builder
- Add more workflow step types such as email, HTTP request, filter, and transform
- Add team invitations and role-based permissions
- Add billing and subscription support
- Add webhook rate limiting
- Add automated tests
- Add production deployment with separate web and worker services

---

## Author

Built by Anvesh Varma and Nilasha Varma Indukuri.
