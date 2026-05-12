# Socially

## Overview

Socially is a fullstack social application built as a technical and product portfolio project.

The goal of this project is to demonstrate the ability to build a complete web product end-to-end: authentication, onboarding, feed, posts, comments, notifications, messaging, user settings, relational data modeling, server-side logic, UI states, tests, documentation, and a structured Git workflow.

Socially is not presented as a startup, a production-scale social network, or an open source community project. It is a serious training and portfolio codebase built to reflect realistic product engineering constraints.

## Goals

The main goals of Socially are to:

- Build an end-to-end fullstack application with real user flows.
- Practice a realistic architecture with server actions, API routes, client components, database queries, and UI state management.
- Handle authentication, sessions, relational data, validation, errors, uploads, rate limiting, and user-facing feedback.
- Structure the project closer to a product codebase than to a small isolated side project.
- Practice a professional workflow with tests, documentation, reviews, and incremental product thinking.

## Features

- **Authentication / onboarding**  
  Email/password and OAuth authentication with Better Auth, user profile creation, onboarding steps, avatar upload, categories, and user intent.

- **Feed**  
  For You and Following feeds with cursor pagination, TanStack Query infinite queries, cache invalidation, visibility rules, and blocked-user filtering.

- **Posts**  
  Post creation with title/content/images, Zod validation, Cloudinary upload, moderation status, categories, deletion, reporting, and image cleanup on failure.

- **Comments**  
  Post comments and replies with validation, moderation, likes, sorting, and thread navigation.

- **Notifications**  
  Like, comment, and follow notifications with unread state, grouped post notifications, follow notifications, mark-as-read actions, and Pusher realtime updates.

- **Messaging**  
  Direct conversations, message sending, read state, conversation list, realtime message delivery, and typing indicators through Pusher private channels.

- **User settings**  
  Account settings, language update, email update, soft-delete / restore flow, privacy block list, and JSON data export.

- **Profiles**  
  Public profile pages with follow/unfollow, block/unblock, profile editing, profile posts, follower data, and SEO metadata.

- **Search / discover / trending**  
  Profile and post search with search history, discover pages by category, cached discovery candidates, and trending posts based on recent likes.

- **Reporting and blocking**  
  Reports are stored with uniqueness constraints, and block relationships affect feed, messaging, follow, and visibility logic.

## Tech Stack

- **Framework:** Next.js 16 App Router
- **UI:** React 19, TypeScript, Tailwind CSS v4
- **Database:** PostgreSQL
- **ORM:** Prisma 7
- **Authentication:** Better Auth
- **Data fetching / cache:** TanStack Query v5, Next.js Data Cache
- **Realtime:** Pusher
- **Internationalization:** next-intl with `en`, `fr`, and `es`
- **Validation:** Zod
- **Uploads:** Cloudinary
- **Email:** Resend
- **Rate limiting:** Upstash Redis / Ratelimit
- **Moderation support:** OpenAI Responses API with structured JSON output
- **Monitoring:** Sentry for Next.js
- **UI primitives:** Radix UI / shadcn-style components, Lucide icons, Embla carousel
- **Tests:** Jest, Playwright
- **Deployment context:** Vercel configuration is present, including a scheduled cron route

## Architecture

Socially uses the Next.js App Router with locale-based routing under `app/[locale]`.

The application is split between:

- `app/` for routes, layouts, pages, server actions, and API routes.
- `components/` for shared UI and product components.
- `lib/` for data queries, auth helpers, validation, rate limits, Pusher, SEO, monitoring, and external service clients.
- `prisma/` for the database schema and migrations.
- `messages/` for next-intl translation files.
- `__tests__/` and `e2e/` for Jest and Playwright tests.

Data access is centralized through Prisma queries and server actions. Client components are used where interactive state is needed, for example feed pagination, optimistic likes, post creation, messaging, settings forms, and realtime updates.

Authentication is handled by Better Auth with Prisma persistence. User profile creation is connected to Better Auth hooks, with separate groundwork for public users and staff profiles.

Realtime behavior is handled through Pusher private channels for notifications, messages, read events, and typing indicators.

Internationalization is handled with next-intl, locale-prefixed routes, localized messages, and localized validation feedback.

## Key Technical Points

- **Cursor-based feed pagination**  
  The feed uses `createdAt` and `id` cursors with TanStack Query `useInfiniteQuery`.

- **Cache-aware UI updates**  
  Feed surfaces invalidate or update TanStack Query caches after actions such as like, delete, comment, or refresh.

- **Optimistic UI**  
  Likes and some follow interactions use optimistic state to keep the UI responsive while server actions run.

- **Post creation flow**  
  The post composer handles drag and drop, multiple images, object URL cleanup, client-side validation, server-side validation, Cloudinary upload, moderation, and failure cleanup.

- **Moderation workflow**  
  Posts and comments are classified with a structured JSON response into `SAFE`, `UNCERTAIN`, or `UNSAFE`, with categories and moderation reasons stored in the database.

- **Realtime messaging**  
  Direct messages use Pusher events for new messages, read status, conversation updates, and typing indicators.

- **Notifications**  
  Notifications are deduplicated by actor, receiver, type, and post, then updated or created depending on the previous state.

- **Relational data modeling**  
  Prisma models include users, profiles, posts, comments, likes, follows, blocks, reports, conversations, messages, notifications, search history, anonymous visitors, and email logs.

- **Security and robustness work**  
  The app includes session checks, ownership checks, blocked-user checks, rate limits, soft deletes, unique constraints, upload validation, and defensive error handling.

- **Testing**  
  Jest covers onboarding, post actions, schemas, and data export behavior. Playwright covers onboarding, post creation, and settings flows.

## AI Usage

AI was used as an engineering support tool, not as the source of truth for the project.

It helped with understanding, comparing approaches, producing constrained first implementations, and handling repetitive or highly contextual tasks when the scope and constraints were already clear.

Examples of areas where this approach is relevant in the repository include the feed work with TanStack Query and infinite pagination, optimistic UI patterns, the post creation modal with validation and uploads, Pusher-based realtime flows, next-intl/i18n work, SEO-related structures, tests, skeletons, and mechanical refactors.

The product scope, technical decisions, integration, review, testing, and final validation remain the developer’s responsibility. This workflow also simulates a realistic codebase environment where the important work is not only producing code, but understanding context, framing the task, integrating safely, and verifying the result.

## Local Setup

The project requires Node.js 22.x.

```bash
npm install
```

Create a local environment file with the variables required by the features you want to run. No `.env.example` file is currently present in the repository, so use the table below as a reference.

Generate the Prisma client:

```bash
npx prisma generate
```

Apply local migrations:

```bash
npx prisma migrate dev
```

Optionally seed discover data for local development:

```bash
npm run seed:discover
```

Start the development server:

```bash
npm run dev
```

The app runs locally on the Next.js development server, usually at:

```bash
http://localhost:3000
```

## Environment Variables

| Variable                     | Required                                  | Purpose                                                                  |
| ---------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`               | Yes                                       | PostgreSQL connection string used by Prisma and the application.         |
| `DIRECT_URL`                 | Optional                                  | Direct database URL used by Prisma config when present.                  |
| `NEXT_PUBLIC_URL`            | Recommended                               | Public base URL used by auth, exports, SEO, and Playwright local config. |
| `CLOUDINARY_CLOUD_NAME`      | Required for uploads                      | Cloudinary cloud name for image uploads.                                 |
| `CLOUDINARY_API_KEY`         | Required for uploads                      | Cloudinary API key.                                                      |
| `CLOUDINARY_API_SECRET`      | Required for uploads                      | Cloudinary API secret.                                                   |
| `OPENAI_SECRET`              | Required for moderation                   | OpenAI API key used by post/comment moderation.                          |
| `UPSTASH_REDIS_REST_URL`     | Yes                                       | Upstash Redis URL for rate limiting.                                     |
| `UPSTASH_REDIS_REST_TOKEN`   | Yes                                       | Upstash Redis token for rate limiting.                                   |
| `RESEND_API_KEY`             | Required for email                        | Resend API key used for password reset emails.                           |
| `RESEND_FROM_EMAIL`          | Required for email                        | Sender email address for Resend.                                         |
| `GOOGLE_CLIENT_ID`           | If Google auth is used                    | Google OAuth client ID.                                                  |
| `GOOGLE_CLIENT_SECRET`       | If Google auth is used                    | Google OAuth client secret.                                              |
| `MICROSOFT_CLIENT_ID`        | If Microsoft auth is used                 | Microsoft OAuth client ID.                                               |
| `MICROSOFT_CLIENT_SECRET`    | If Microsoft auth is used                 | Microsoft OAuth client secret.                                           |
| `MICROSOFT_TENANT_ID`        | If Microsoft auth is used                 | Microsoft tenant ID.                                                     |
| `PUSHER_APP_ID`              | Required for realtime server events       | Pusher app ID.                                                           |
| `NEXT_PUBLIC_PUSHER_KEY`     | Required for realtime client              | Public Pusher key.                                                       |
| `PUSHER_SECRET`              | Required for realtime server events       | Pusher secret.                                                           |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Required for realtime client              | Public Pusher cluster.                                                   |
| `CRON_SECRET`                | Required for protected cron in production | Bearer secret for the delete-expired-users cron route.                   |
| `VERCEL_URL`                 | Platform-provided                         | Used as a fallback public URL in SEO helpers when deployed on Vercel.    |

## Scripts

| Script                     | Purpose                                             |
| -------------------------- | --------------------------------------------------- |
| `npm run dev`              | Starts the Next.js dev server with Turbopack.       |
| `npm run clean`            | Removes local Next/Turbo/cache artifacts.           |
| `npm run build`            | Runs `prisma generate` and `next build`.            |
| `npm run typecheck`        | Runs Next type generation and TypeScript checks.    |
| `npm run seed:discover`    | Seeds development discover data.                    |
| `npm run start`            | Starts the production Next.js server after a build. |
| `npm run lint`             | Runs ESLint.                                        |
| `npm run test`             | Runs Jest tests.                                    |
| `npm run test:coverage`    | Runs Jest with coverage.                            |
| `npm run test:watch`       | Runs Jest in watch mode.                            |
| `npm run test:e2e`         | Runs Playwright tests.                              |
| `npm run test:e2e:headed`  | Runs Playwright tests in headed mode.               |
| `npm run test:e2e:install` | Installs the Chromium browser for Playwright.       |

## Project Status

Socially is a portfolio project and an actively improved training codebase.

It is not a production-scale social network and is not presented as a mature commercial product. The current focus is to demonstrate product engineering ability through realistic fullstack features, data modeling, validation, UI states, tests, and workflow discipline.

A back-office / moderation interface is not yet exposed as an application surface. Some early groundwork exists in the auth and Prisma model, but the actual back-office work is still upcoming.

## Known Limitations

- The project has not been benchmarked or optimized as a large-scale production social network.
- The back-office and moderation review interface are not implemented yet.
- The email update flow is intentionally basic at this stage; the code notes that email confirmation should be added later.
- The typing indicator is a lightweight V1 realtime signal and is not treated as a security-sensitive feature.
- Localized route pathnames are not fully translated yet; the i18n routing file marks this as future work.
- Some profile media work, such as banner handling, is present as groundwork but not fully surfaced as a finished product feature.
- Monitoring is configured through Sentry, but full production operations, alerting, and incident processes are outside the current portfolio scope.

## What This Project Demonstrates

Socially demonstrates the ability to:

- Build a complete fullstack product with realistic user flows.
- Work across authentication, onboarding, data modeling, UI state, server actions, uploads, notifications, and messaging.
- Design relational data structures with Prisma and PostgreSQL.
- Handle validation, errors, rate limits, soft deletion, ownership, visibility, and blocked-user behavior.
- Use client/server boundaries intentionally in a modern Next.js application.
- Add targeted tests for business logic and important user flows.
- Document and explain a codebase clearly.
- Iterate with a structured workflow close to a small product team or agency environment.

## Links

- Live demo: https://www.socially.rocks/feed
- Portfolio case study: https://hippolytedev.fr/socially.html
- Author GitHub: https://github.com/IppoKuun
