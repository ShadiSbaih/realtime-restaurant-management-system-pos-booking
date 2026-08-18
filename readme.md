# Savora - Restaurant Operations Platform

> Project name: **Savora**

Savora is a full-stack restaurant operations platform for customer ordering, reservations, menu administration, point-of-sale workflows, table management, dashboards, and real-time updates. The codebase combines an Angular application with a Spring Boot API backed by PostgreSQL.

## Screenshot

The repository includes a screenshot of the customer-facing landing page:

![Savora landing page](screenshots/image.png)

## Contents

*   [Product Overview](#product-overview)
*   [Feature Set](#feature-set)
*   [Technology Stack](#technology-stack)
*   [Application Architecture](#application-architecture)
*   [Repository Layout](#repository-layout)
*   [Prerequisites](#prerequisites)
*   [Quick Start](#quick-start)
*   [Configuration](#configuration)
*   [Demo Accounts and Seed Data](#demo-accounts-and-seed-data)
*   [Application Routes](#application-routes)
*   [REST API Overview](#rest-api-overview)
*   [Real-Time Messaging](#real-time-messaging)
*   [Database Design](#database-design)
*   [Testing](#testing)
*   [Production and Security Notes](#production-and-security-notes)
*   [Troubleshooting](#troubleshooting)
*   [Known Implementation Notes](#known-implementation-notes)
*   [Contributing](#contributing)
*   [License](#license)

## Product Overview

Savora is designed around the daily operating cycle of a restaurant:

1.  Customers browse the public menu and make reservations.
2.  Staff create and manage orders from the POS floor plan.
3.  Kitchen users monitor and update order progress.
4.  Managers review sales, activity, menu performance, and reservations.
5.  Administrators manage users, roles, menu content, categories, tables, and operational data.
6.  AI tools help managers analyze menu feedback, generate menu concepts, and produce short briefings or demand forecasts.

The application is split into role-specific workspaces so that each user sees the workflows relevant to their job.

## Feature Set

### Customer experience

*   Public restaurant landing page and menu browsing.
*   Menu search, category filtering, item details, discounts, and availability.
*   Customer registration and password login.
*   Reservation creation and reservation status tracking.
*   Customer profile view.
*   Authenticated menu feedback and ratings.
*   Cart and checkout flow using the built-in mock payment service.

### POS and restaurant operations

*   Visual dining-room table list and floor management.
*   Table creation, editing, deletion, and status updates.
*   Dine-in and takeaway order creation.
*   Order status workflow: pending, preparing, ready, served, and cancelled.
*   Payment status workflow: pending, paid, or failed.
*   Kitchen access to active orders and table state.
*   Reservation administration and status updates.
*   Local image upload for menu assets.

### Management and administration

*   Dashboard statistics, charts, trending dishes, and operational lists.
*   Menu item and menu category administration.
*   Menu availability, discount, recipe, and image management.
*   User search, pagination, role changes, ban/unban, and deletion.
*   Activity log for important administrative actions.
*   Role-aware Angular route guards and Spring method-level authorization.

### AI features

The backend uses Spring AI with a Groq-compatible OpenAI API endpoint:

*   Smart menu analysis based on customer feedback.
*   AI-generated menu item concepts.
*   Executive briefing generation.
*   Demand forecast generation.
*   Asynchronous AI jobs with job status tracking.
*   STOMP notifications for completed or failed AI jobs.
*   REST polling fallback when a real-time connection is not available.

AI features require a valid `GROQ_API_KEY`. The application defaults to `llama-3.1-8b-instant`, configurable with `AI_MODEL`.

### Payments

Payments are intentionally simulated for development and demonstration:

*   Payment intent creation.
*   Configurable simulated delay.
*   Configurable success rate.
*   Payment confirmation and failure states.
*   Payment status lookup.
*   Refund simulation.
*   Webhook side-effect simulation.

This is not a production payment gateway integration. No real card data should be used.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Customer and staff UI | Angular 18, TypeScript 5.5, RxJS |
| UI components and styling | Angular Material, Tailwind CSS, SCSS, Lucide Angular |
| Data visualization | @swimlane/ngx-charts |
| Real-time client | STOMP.js and SockJS |
| Backend API | Java 17, Spring Boot 3.3.4 |
| Security | Spring Security, JWT, BCrypt, method-level role authorization |
| Persistence | Spring Data JPA, Hibernate, PostgreSQL |
| Database migrations | Flyway |
| Real-time server | Spring WebSocket with STOMP |
| AI integration | Spring AI 1.0.0 with the OpenAI-compatible Groq endpoint |
| API documentation | Springdoc OpenAPI |
| File storage | Local filesystem storage served by the backend |
| Testing | JUnit 5, Spring Boot Test, MockMvc, Spring Security Test, H2 |
| Local infrastructure | Docker Compose for PostgreSQL and backend support |

## Application Architecture

```
+---------------------------+
| Angular 18 frontend       |
| Customer, POS, Admin UI   |
+-------------+-------------+
              |
              | REST /api/*
              | SockJS + STOMP /ws
              v
+---------------------------+
| Spring Boot backend       |
| Auth, POS, menu, AI, API  |
+---+-----------+-------+---+
    |           |       |
    v           v       v
PostgreSQL   uploads   Groq API
 Flyway      filesystem  optional
```

The backend is a stateless REST API for access-token authentication. Refresh tokens are persisted in PostgreSQL and rotated when a session is refreshed. The WebSocket layer broadcasts order, reservation, table, menu, payment, and AI events through a simple STOMP broker.

## Repository Layout

```
.
|-- readme.md
|-- screenshots/
|   |-- image.png
|-- .gitignore
\`-- app/
    |-- backend/
    |   |-- src/main/java/com/savora/
    |   |   |-- ai/
    |   |   |-- auth/
    |   |   |-- config/
    |   |   |-- dashboard/
    |   |   |-- menu/
    |   |   |-- payment/
    |   |   |-- pos/
    |   |   |-- realtime/
    |   |   |-- upload/
    |   |   |-- user/
    |   |   \`-- common/
    |   |-- src/main/resources/
    |   |   |-- application.yml
    |   |   \`-- db/migration/V1__init_schema.sql
    |   |-- src/test/
    |   |-- pom.xml
    |   |-- mvnw
    |   |-- mvnw.cmd
    |   \`-- Dockerfile
    |-- frontend/
    |   |-- src/app/
    |   |   |-- core/
    |   |   |-- features/
    |   |   |-- shared/
    |   |   \`-- app.routes.ts
    |   |-- public/
    |   |-- src/environments/
    |   |-- package.json
    |   |-- angular.json
    |   |-- package-lock.json
    |   \`-- Dockerfile
    |-- docker-compose.yml
    \`-- start-backend.ps1
```

The backend follows a feature-oriented package structure. Each business area generally contains its controller, service, repository, entity, and DTO classes. The frontend uses standalone Angular components, lazy-loaded feature routes, shared services, signals, and role guards.

## Prerequisites

Install the following before starting local development:

*   Java 17 or later.
*   Node.js 18 or later and npm.
*   PostgreSQL 15 or later, or Docker Desktop.
*   Git.
*   Optional: a Groq API key for AI functionality.
*   Optional: Google OAuth client credentials for Google sign-in.

Confirm the main tools:

```
java -version
node --version
npm --version
docker --version
```

## Quick Start

### 1\. Start PostgreSQL

The backend defaults to the following local database connection:

```
Host:     localhost
Port:     5432
Database: savora
Username: savora
Password: savora
```

You can start only the PostgreSQL service from the provided Compose file:

```
cd app
docker compose up -d postgres
```

Alternatively, create a PostgreSQL database manually and configure the connection with the environment variables described below.

### 2\. Configure the backend

Create app/.env. The provided start-backend.ps1 script reads this file and forwards supported variables to Spring Boot.

A minimal local configuration is:

```
DATABASE_URL=jdbc:postgresql://localhost:5432/savora
DB_USERNAME=savora
DB_PASSWORD=savora
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:4200
```

For the current Google OAuth configuration, also provide:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

For AI features, provide:

```
GROQ_API_KEY=your-groq-api-key
AI_MODEL=llama-3.1-8b-instant
```

Do not commit .env files or real credentials.

### 3\. Start the Spring Boot backend

On Windows PowerShell, from app:

```
.\\start-backend.ps1
```

Or run Maven directly:

```
cd app\\backend
.\\mvnw.cmd spring-boot:run
```

The API is available at:

*   REST API: [http://localhost:8080/api](http://localhost:8080/api)
*   Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
*   OpenAPI JSON: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
*   SockJS endpoint: [http://localhost:8080/ws](http://localhost:8080/ws)
*   Uploaded files: [http://localhost:8080/uploads](http://localhost:8080/uploads)

Flyway applies the initial schema migration during startup.

### 4\. Install and start the Angular frontend

Open a second terminal:

```
cd app/frontend
npm ci
npm start
```

The frontend is available at [http://localhost:4200](http://localhost:4200).

The development environment points to:

```
REST API: http://localhost:8080/api
WebSocket: http://localhost:8080/ws
```

These values are defined in app/frontend/src/environments/environment.ts.

### 5\. Sign in

Use one of the seeded accounts below, or register a new customer account from the UI.

## Configuration

The backend reads configuration from environment variables through application.yml.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8080` | Spring Boot HTTP port |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/savora` | JDBC PostgreSQL URL |
| `DB_USERNAME` | `savora` | Database username |
| `DB_PASSWORD` | `savora` | Database password |
| `JWT_SECRET` | Development placeholder | JWT signing secret; replace it |
| `JWT_ACCESS_EXPIRY_MS` | `900000` | Access-token lifetime, 15 minutes |
| `JWT_REFRESH_EXPIRY_DAYS` | `7` | Refresh-token lifetime |
| `CLIENT_URL` | `http://localhost:4200` | Allowed frontend origin |
| `GOOGLE_CLIENT_ID` | None | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | None | Google OAuth client secret |
| `GROQ_API_KEY` | Empty | API key for AI features |
| `AI_MODEL` | `llama-3.1-8b-instant` | Groq-compatible model name |
| `UPLOAD_DIR` | `./uploads` | Local image storage directory |
| `UPLOAD_BASE_URL` | `http://localhost:8080/uploads` | Public base URL for uploaded files |
| `PAYMENT_MOCK_SUCCESS_RATE` | `0.9` | Simulated payment success probability |
| `PAYMENT_MOCK_DELAY_MS` | `1200` | Simulated payment processing delay |
| `PAYMENT_MOCK_CURRENCY` | `USD` | Currency used by mock payments |

### Frontend environment

The Angular application currently stores development endpoints in:

```
app/frontend/src/environments/environment.ts
```

Update apiUrl, wsUrl, and googleClientId when connecting the frontend to another environment. Production deployments should use environment-specific configuration and should not hard-code development URLs.

## Demo Accounts and Seed Data

The DatabaseSeeder creates these users when they do not already exist:

| Role | Email | Password | Main workspace |
| --- | --- | --- | --- |
| Administrator | `admin@savora.com` | `admin123` | All management and administration |
| Manager | `manager@savora.com` | `manager123` | Dashboard, menu, orders, reservations |
| Staff | `staff@savora.com` | `staff123` | POS and order management |
| Kitchen | `kitchen@savora.com` | `kitchen123` | Kitchen order workflow and table visibility |
| Customer | `customer@savora.com` | `customer123` | Customer menu, reservations, and ordering |

The initial seed also creates:

*   Six menu categories.
*   Thirty-two sample menu items.
*   Six restaurant tables.
*   Sample operational orders for dashboard visualization when fewer than fifty orders exist.

These credentials are for local development only. Change or remove them before deploying the application outside a private development environment.

## Role Model

| Role | Access summary |
| --- | --- |
| `ADMIN` | Full access, user administration, activity logs, management, POS |
| `MANAGER` | Dashboard, menu, categories, orders, reservations, tables, activity logs |
| `STAFF` | POS tables, order creation, order updates, reservations |
| `KITCHEN` | Table visibility, order visibility, and order status updates |
| `CUSTOMER` | Public menu access, account, reservations, and customer order flows |

Authorization is enforced twice:

1.  Angular guards hide and protect role-specific routes in the browser.
2.  Spring Security and `@PreAuthorize` rules enforce access on the server.

The server remains the source of truth. A user must send a valid bearer token even if a frontend route is manually opened.

## Application Routes

### Public and customer routes

| Route | Purpose |
| --- | --- |
| `/` | Customer landing page and menu |
| `/reservation` | Customer reservation flow |
| `/profile/:id` | Customer profile |
| `/login` | Login |
| `/register` | Registration |

### Admin routes

| Route | Required role |
| --- | --- |
| `/admin/dashboard` | ADMIN, MANAGER |
| `/admin/menu` | ADMIN, MANAGER |
| `/admin/menu/categories` | ADMIN, MANAGER |
| `/admin/users` | ADMIN |
| `/admin/orders` | ADMIN, MANAGER |
| `/admin/reservations` | ADMIN, MANAGER |
| `/admin/activities-log` | ADMIN |

### POS routes

| Route | Required role |
| --- | --- |
| `/pos/tables` | ADMIN, MANAGER, STAFF, KITCHEN |
| `/pos/new-order` | ADMIN, MANAGER, STAFF, KITCHEN |

## REST API Overview

All REST endpoints are relative to `http://localhost:8080`. Protected requests use:

```
Authorization: Bearer <access-token>
```

List endpoints commonly accept page and limit query parameters. Pagination is one-based, and the response is wrapped in the backend PaginatedResponse DTO.

| Area | Endpoints | Description |
| --- | --- | --- |
| Authentication | POST /api/auth/register, POST /api/auth/login, POST /api/auth/refresh, POST /api/auth/logout, GET /api/auth/me | Registration, JWT sessions, refresh, logout, current user |
| Menu | GET /api/menu, GET /api/menu/{id}, POST /api/menu, POST /api/menu/manual, PATCH /api/menu/{id}, DELETE /api/menu/{id} | Public menu reads and manager menu administration |
| Feedback | POST /api/menu/{menuItemId}/feedback | Authenticated menu-item feedback |
| Categories | GET /api/categories, POST /api/categories, PATCH /api/categories/{id}, DELETE /api/categories/{id} | Public category reads and manager administration |
| Tables | GET /api/tables, GET /api/tables/{id}, POST /api/tables, PATCH /api/tables/{id}, PATCH /api/tables/{id}/status, DELETE /api/tables/{id} | Floor-plan data and table state |
| Orders | GET /api/orders, POST /api/orders, PATCH /api/orders/{id} | POS order creation, listing, and status updates |
| Reservations | GET /api/reservations, POST /api/reservations, PATCH /api/reservations/{id}/status | Reservation creation, listing, and status changes |
| Users | GET /api/users, GET /api/users/{id}, PATCH /api/users/{id}/role, POST /api/users/{id}/ban, POST /api/users/{id}/unban, DELETE /api/users/{id} | User administration |
| Dashboard | GET /api/dashboard/stats, GET /api/dashboard/charts, GET /api/dashboard/lists | Management dashboard data |
| Activity log | GET /api/activities-log | Administrative activity history |
| AI | POST /api/ai/smart-menu, POST /api/ai/generate-item, POST /api/ai/generate-briefing, POST /api/ai/generate-forecast, GET /api/ai/jobs/{jobId}, GET /api/ai/jobs/recent | AI actions and asynchronous job status |
| Payments | POST /api/payments/intent, POST /api/payments/confirm, GET /api/payments/{id}, POST /api/payments/{id}/refund, POST /api/payments/webhook-simulate | Development-only mock payment flow |
| Uploads | POST /api/uploads, GET /uploads/{filename} | Authenticated upload and public file delivery |

### Useful API examples

Register a customer:

```
curl -X POST http://localhost:8080/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Example Customer","email":"customer@example.com","password":"password123"}'
```

Read the public menu:

```
curl "http://localhost:8080/api/menu?page=1&limit=8"
```

Read the current authenticated user:

```
curl http://localhost:8080/api/auth/me \\
  -H "Authorization: Bearer <access-token>"
```

For request schemas and generated response models, use the Swagger UI at `/swagger-ui.html`.

## Real-Time Messaging

The backend exposes a SockJS-compatible STOMP endpoint at:

```
/ws
```

The Angular client connects through WebsocketService and subscribes to these topics:

| Topic | Event purpose |
| --- | --- |
| `/topic/orders` | New order created |
| `/topic/orders/status` | Order status changed |
| `/topic/menu` | Menu or category changes |
| `/topic/tables` | Table creation, updates, deletion, or status changes |
| `/topic/reservations` | New reservation |
| `/topic/reservations/status` | Reservation status changed |
| `/topic/payments/{paymentId}` | Payment status changes |
| `/topic/ai-jobs/{userId}` | User-specific AI job progress and completion |

The backend configures a simple broker with `/topic` and `/queue`, uses `/app` for application destinations, and allows the configured frontend origin through CORS.

AI endpoints return `202 Accepted` with a job ID for asynchronous work. Clients can either listen for the user-specific AI topic or poll `GET /api/ai/jobs/{jobId}`.

## Database Design

Flyway owns the schema in:

```
app/backend/src/main/resources/db/migration/V1__init_schema.sql
```

The initial migration defines:

*   `users`: identities, roles, account state, and profile data.
*   `refresh_tokens`: rotating refresh sessions.
*   `token_blacklist`: revoked access-token identifiers.
*   `categories` and `menu_items`: menu catalog.
*   `feedbacks`: ratings and customer comments.
*   `restaurant_tables`: dining-room layout and availability.
*   `reservations`: bookings associated with users and tables.
*   `orders` and `order_items`: sales and ordered menu items.
*   `activities_log`: administrative and operational audit entries.
*   `ai_jobs`: asynchronous AI request state and payloads.
*   `mock_payments`: simulated payment lifecycle.

JPA is configured with `ddl-auto: validate`, so application startup expects the Flyway-managed schema to already match the entity model.

## Testing

### Backend tests

The backend includes authentication and mock-payment integration tests using Spring Boot, MockMvc, and an in-memory H2 database.

Run the deterministic integration tests:

```
cd app\\backend
.\\mvnw.cmd -Dtest=AuthIntegrationTest,MockPaymentIntegrationTest test
```

Run the complete backend test suite:

```
.\\mvnw.cmd test
```

The GroqTest test calls the configured AI provider and therefore requires a working GROQ\_API\_KEY and network access.

### Frontend tests and build

```
cd app/frontend
npm test
npm run build
```

Use npm run build as the basic production compilation check. The Angular project is configured with a production bundle budget.

## Production and Security Notes

Before any deployment:

*   Replace the default JWT\_SECRET with a long, randomly generated secret.
*   Remove or change every seeded demo password.
*   Use a managed PostgreSQL instance or a hardened private database.
*   Put the backend and frontend behind HTTPS.
*   Restrict CLIENT\_URL to the real frontend origin.
*   Store secrets in a deployment secret manager, not in source control.
*   Replace the mock payment service with a verified payment provider integration.
*   Configure a durable object-storage strategy for uploaded images instead of relying on local container storage.
*   Review Google OAuth redirect URIs and credentials for the deployed domain.
*   Set an explicit production AI\_MODEL and monitor provider usage and failures.
*   Review CORS, upload size limits, logging, backups, and database retention policies.
*   Do not expose Swagger UI publicly unless it is intentionally protected.

The frontend currently stores the access token in browser local storage. For a public production deployment, review the session-storage strategy and threat model before launch.

## Troubleshooting

### The backend cannot connect to PostgreSQL

Check that PostgreSQL is running and that the database, username, and password match the values in DATABASE\_URL, DB\_USERNAME, and DB\_PASSWORD.

For Docker PostgreSQL:

```
cd app
docker compose ps
docker compose logs postgres
```

### The browser reports a CORS error

Confirm that:

*   The frontend is running at the origin configured by CLIENT\_URL.
*   The Angular API URL points to the same backend port.
*   The backend has been restarted after changing environment variables.
*   The browser is not using a stale frontend build.

### AI actions fail

Confirm that GROQ\_API\_KEY is present in the environment used by the backend. Also check that AI\_MODEL is supported by the configured Groq endpoint and inspect the backend log for the provider response.

### The seeded data does not appear

The seeder is idempotent. It only creates users when their email does not exist, menu items when the menu is empty, tables when no tables exist, and sample orders when fewer than fifty orders exist. Check the startup log and database connection before deleting data.

### Uploaded images return 404

Check that UPLOAD\_DIR exists and is writable, and that UPLOAD\_BASE\_URL matches the backend origin. In Docker, persist the uploads volume so files survive container replacement.

## Known Implementation Notes

*   Savora is now used consistently as the product, backend, Java package, Maven, and Angular project name.
*   The requested repository layout is app/backend and app/frontend.
*   The Compose file uses the renamed backend and frontend directories. The frontend image still requires a Dockerfile at app/frontend/Dockerfile before full-stack Compose deployment can be used.
*   The payment implementation is a mock service intended for local flows and automated tests. It must not be presented as a real payment integration.
*   The backend broadcasts payment updates on payment-specific topics. Consumers should subscribe to the exact /topic/payments/{paymentId} destination or use the REST status endpoint as a fallback.
*   The development Angular environment is committed with localhost endpoints. Production hosting needs an explicit environment configuration strategy.
*   AI output depends on the external Groq service and should be treated as asynchronous, fallible assistance rather than a transactional source of truth.

## Contributing

1.  Create a focused branch for the change.
2.  Keep frontend work inside app/frontend and backend work inside app/backend.
3.  Update Flyway migrations for database changes; do not rely on Hibernate auto-creation.
4.  Preserve role checks in both the Angular route layer and Spring Security layer.
5.  Add or update backend integration tests for API and authorization changes.
6.  Run the relevant Maven tests and the Angular build before opening a pull request.
7.  Never commit environment files, credentials, generated build output, or local uploads.

## License

This project is intended for educational and demonstration use. Review and add an explicit open-source license before redistributing or using it in a commercial deployment.