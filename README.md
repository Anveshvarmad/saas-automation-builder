cat > README.md <<'EOF'
# SaaS Automation Builder

A full-stack AI workflow automation platform where users can create workflows, trigger them through secure webhooks, process jobs with a Redis-backed background worker, and store OpenAI-generated execution results with full audit history.

This project demonstrates production-style backend architecture using Next.js, PostgreSQL, Prisma, Redis, BullMQ, Docker, and OpenAI APIs.

---

## Features

- User signup and login with custom session authentication
- Organization-based multi-tenant data model
- Workflow creation and management
- Secure webhook trigger URLs
- Webhook secret rotation using hashed secrets
- Redis/BullMQ background job processing
- OpenAI-powered workflow step execution
- Execution history with input/output JSON
- Retry support for failed executions
- Audit logs for important organization activity
- Dashboard with workflow and execution metrics
- Polished landing page and demo guide

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
| Auth | Custom session auth with HTTP-only cookies |
| Infrastructure | Docker Compose |

---

## Architecture

```mermaid
flowchart TD
    A[User Browser] --> B[Next.js App]
    B --> C[PostgreSQL via Prisma]
    B --> D[Redis Queue]
    E[External Webhook Client] --> F[Webhook API Route]
    F --> C
    F --> D
    D --> G[Workflow Worker]
    G --> C
    G --> H[OpenAI API]
    H --> G
    G --> C