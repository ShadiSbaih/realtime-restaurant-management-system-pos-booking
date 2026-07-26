# 🍽️ DineFlow — Restaurant Management System

> Full-stack, AI-powered, real-time Restaurant Management System built with the MERN stack, TypeScript, and production-grade tooling.

Built by [TheScriptForger](https://youtube.com/@ScriptForger) · [Watch the full tutorial](https://youtube.com/@ScriptForger)

---

## ⚠️ Free Version Notice

This is the **free version** of the source code, shared alongside the YouTube tutorial. It includes the full core system as shown in the video.

| Feature                       | Free version | Patreon version |
| ----------------------------- | ------------ | --------------- |
| Full core system              | ✅           | ✅              |
| Stripe payments               | ✅           | ✅              |
| AI menu generation            | ✅           | ✅              |
| Smart Menu AI                 | ✅           | ✅              |
| Real-time Socket.io           | ✅           | ✅              |
| 📧 Email system + templates   | ❌           | ✅              |
| 🔔 Browser push notifications | ❌           | ✅              |
| 🤖 AI Briefings (dashboard)   | ❌           | ✅              |

The following features are **exclusive to Patreon members**:

- 🔔 Browser push notifications (PushForge)
- 📧 Full email system with professional templates (Nodemailer)
- 🤖 AI Briefings — Executive Briefing & Demand Forecast dashboard
- 📂 Get the full version → [Patreon](https://patreon.com/bensonraro)

---

## ✨ Features

- ⚒️ Role-based auth — Admin, Manager, Staff, Customer (Better Auth)
- 🔐 Permission-protected Express routes per role
- 🛒 Stripe checkout with Better Auth webhooks
- 📡 Real-time updates across all devices via Socket.io
- 🤖 AI-generated menu items via Gemini + Inngest background jobs
- 🧠 Smart Menu AI — Spinoff, Improve, or Ignore any dish
- 🖥️ POS system — floor plan, table management, print receipts
- 📋 Reservations with live status updates
- 📊 Admin dashboard with charts and activity logs
- 👤 User management — roles, ban/unban, bulk actions
- 📝 Rich-text menu editor via PortableText
- 🖼️ Image uploads via EdgeStore

---

## 🧰 Tech Stack

| Layer           | Technology                                                             |
| --------------- | ---------------------------------------------------------------------- |
| Frontend        | React, React Router, TanStack Query, Tailwind CSS, Shadcn UI, Recharts |
| Backend         | Node.js, Express, Bun                                                  |
| Database        | MongoDB via Prisma ORM                                                 |
| Auth            | Better Auth                                                            |
| Payments        | Stripe                                                                 |
| AI              | Gemini AI                                                              |
| Background Jobs | Inngest                                                                |
| Real-time       | Socket.io                                                              |
| File Uploads    | EdgeStore                                                              |
| Rich Text       | PortableText                                                           |
| Language        | TypeScript (full stack)                                                |

---

## 📁 Project Structure

```
dineflow/
├── frontend/          # React frontend
│   ├── app/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── hooks/
│   │   └── lib/
├── backend/          # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── lib/
│   │   └── inngest/
├── prisma/          # Prisma schema
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Bun](https://bun.sh) >= 1.0
- [Node.js](https://nodejs.org) >= 18
- [MongoDB](https://mongodb.com) database (local or Atlas)
- [Git](https://git-scm.com)

---

### 1. Clone the repository

```bash
git clone https://github.com/BensonRaro/realtime-restaurant-management-system-pos-booking.git
cd realtime-restaurant-management-system-pos-booking
```

### 2. Install dependencies

```bash
# Install server dependencies
cd backend && bun install

# Install client dependencies
cd ../frontend && bun install
```

### 3. Set up environment variables

Copy the example env files:

```bash
# Server
cp backend/.env.example backend/.env

# Client
cp frontend/.env.example frontend/.env
```

Then fill in the values as described below.

---

## 🔐 Environment Variables

### Server — `backend/.env`

```env
# ── App ──────────────────────────────────────────────
PORT=5000
CLIENT_URL=http://localhost:5173

# ── Database ─────────────────────────────────────────
# Get from MongoDB Atlas → https://cloud.mongodb.com
# Create a free cluster → Connect → Drivers → copy the URI
DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/dineflow

# ── Better Auth ───────────────────────────────────────
# Generate a random 32+ character secret — run in terminal:
# openssl rand -base64 32
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:5000

# ── Google OAuth (for Google sign-in) ─────────────────
# 1. Go to https://console.cloud.google.com
# 2. Create a project → APIs & Services → Credentials
# 3. Create OAuth 2.0 Client ID (Web application)
# 4. Add http://localhost:5000/api/auth/callback/google to redirect URIs
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ── Stripe ────────────────────────────────────────────
# 1. Go to https://dashboard.stripe.com
# 2. Developers → API Keys → copy Secret Key
# 3. Developers → Webhooks → Add endpoint:
#    URL: http://localhost:5000/api/webhooks/stripe
#    Events: checkout.session.completed
# 4. Copy the Webhook Signing Secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── Gemini AI ─────────────────────────────────────────
# 1. Go to https://aistudio.google.com
# 2. Get API Key → Create API Key
GEMINI_API_KEY=your_gemini_api_key

# ── Inngest ───────────────────────────────────────────
# 1. Go to https://inngest.com → Sign up free
# 2. Create an app → copy Event Key and Signing Key
# For local dev the defaults below work with the Inngest Dev Server
INNGEST_EVENT_KEY=local
INNGEST_SIGNING_KEY=local

# ── EdgeStore ─────────────────────────────────────────
# 1. Go to https://edgestore.dev → Sign up
# 2. Create a project → copy Access Key and Secret Key
EDGE_STORE_ACCESS_KEY=your_access_key
EDGE_STORE_SECRET_KEY=your_secret_key
```

### Client — `backend/.env`

```env
VITE_VAPID_PUBLIC_KEY=""

# EdgeStore public access key (same project as backend)
VITE_EDGE_STORE_ACCESS_KEY=your_access_key
```

---

### 4. Set up the database

```bash
cd backend

# Push the Prisma schema to your MongoDB database
bun prisma db push

# (Optional) Open Prisma Studio to inspect your data
bun prisma studio
```

### 5. Run the development servers

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && bun dev

# Terminal 2 — Frontend
cd frontend && bun dev
```

### 6. Run Inngest Dev Server (for background jobs + AI)

Open a third terminal:

```bash
# Install Inngest CLI globally if not already installed
npm install -g inngest-cli

# Start the local Inngest dev server
npx inngest-cli@latest dev -u http://localhost:5000/api/inngest
```

Then open [http://localhost:8288](http://localhost:8288) to monitor your background jobs locally.

---

## 🎭 Default Roles

Seed an initial admin user manually in Prisma Studio or via a seed script, then use the Users Management page in the admin dashboard to assign roles.

| Role       | Access                                |
| ---------- | ------------------------------------- |
| `ADMIN`    | Full access                           |
| `MANAGER`  | Dashboard, menu, reservations, orders |
| `STAFF`    | POS and order management              |
| `KITCHEN`  | POS view only                         |
| `CUSTOMER` | Public menu, ordering, reservations   |

---

## 🤝 Support the channel

If this project helped you, consider supporting on Patreon for exclusive source code features and early access to future projects.

👉 [patreon.com/bensonraro](https://patreon.com/bensonraro)

Subscribe on YouTube for weekly full stack tutorials:
👉 [youtube.com/@ScriptForger](https://youtube.com/@ScriptForger)

Follow on X for daily dev tips:
👉 [x.com/TheScriptForger](https://x.com/ScriptForger)

---

## 📄 License

This project is for educational purposes. Please do not republish or resell this source code.
