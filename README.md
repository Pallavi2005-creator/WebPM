# WebPM – AI-Powered Project Management Dashboard

WebPM is a full-stack project management platform built on the MERN stack, featuring an AI-driven project risk engine and real-time collaboration tools. Teams can manage workspaces, projects, and tasks with intelligent insights surfaced automatically — no manual status meetings needed.

🔗 **Live Demo:** https://web-pm.vercel.app/  
📂 **GitHub:** https://github.com/Pallavi2005-creator/WebPM

---

## ✨ What's New — AI Intelligence Layer

WebPM now includes an AI-powered project health system built on top of the existing task management core:

### 🤖 AI Task Triage
When a task is created, Claude (Anthropic API) automatically classifies it with:
- **Priority** (Low / Medium / High / Urgent) based on task language and urgency signals
- **Complexity estimate** (S / M / L / XL) reflecting effort, not urgency
- **Suggested tags** drawn from existing project tags where applicable

The AI response is fire-and-forget — task creation never blocks on the AI call. Results arrive live via Socket.IO and surface as a real-time toast notification in the project view. AI suggestions are advisory only and never override user-set values without confirmation.

### 📊 Project Risk Engine
A deterministic scoring algorithm runs on-demand (or via daily cron job at 6 AM) and computes:
- **Overdue rate** — active tasks past their due date
- **Task staleness** — tasks with no activity in 5+ days
- **Workload variance** — imbalance in task distribution across team members, weighted by complexity

These three scores combine into a **Risk Score (0–100)** with a level: Low / Moderate / High / Critical.

An AI-generated natural language summary and 1–2 concrete recommendations are then appended to the score (using Claude for the language layer only — the actual scoring is fully deterministic and never AI-guessed).

Results appear on every project page in the **Project Health card**, with a live refresh button for demos.

### ⚡ Real-Time Socket.IO Layer
Previously scaffolded but non-functional — now fully operational:
- Socket connections authenticate via JWT on handshake
- Workspace rooms (`workspace_${id}`) used for targeted broadcast
- `task:ai-triaged` event delivers AI results live to all connected team members in the same workspace

---

## 🚀 Features

- 📊 Dashboard with task trends, project status, and workspace productivity charts
- 🧩 Hierarchical workspace and project management
- ✅ Task management with subtasks, comments, mentions, reactions, and activity logs
- 🤖 **AI task triage** — auto-priority, complexity, and tag classification on creation
- 📈 **Project risk engine** — deterministic health scoring with AI-generated summaries
- ⚡ **Real-time updates** via Socket.IO (task triage results, workspace events)
- 👥 Member management with roles (manager / contributor / viewer)
- 🔐 Auth: Email verification, password reset, JWT, 2FA, Google OAuth
- 📎 File attachments (device upload or external URL)
- 👤 Full user profile management (avatar, credentials)
- 🗃️ Archived projects and tasks with easy retrieval
- 🌗 Dark / Light mode
- 📱 Fully responsive design

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, TypeScript, React Router v7 |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Real-time | Socket.IO |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Scheduling | node-cron |
| Auth | JWT, Google OAuth, Email Verification, 2FA |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📦 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Anthropic API key (get one at console.anthropic.com)
- Google OAuth credentials (for Google sign-in)

### Clone and install

```bash
git clone https://github.com/Pallavi2005-creator/WebPM.git
cd WebPM
```

**Backend:**
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ANTHROPIC_API_KEY=your_anthropic_key
USE_MOCK_AI=true   # set to false once you have Anthropic billing set up
```

```bash
npm start
```

**Frontend:**
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api-v1
VITE_SOCKET_URL=http://localhost:5000
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🧠 Architecture Notes

### Why the AI scoring is deterministic, not AI-guessed
The risk score formula (`overdueRate × 40 + staleRate × 25 + workloadVariance × 35`) is pure JavaScript — no LLM involved in the actual math. Claude is only used for the natural language *summary layer* (turning a JSON metrics object into readable English). This is intentional:
- **Deterministic** — same input always produces same score
- **Auditable** — you can explain exactly why a project is "High Risk"  
- **Cheap** — only one LLM call per project per day (the cron job), not per page load
- **Resilient** — if the API call fails, the score still shows; only the text summary falls back to a default message

### Mock AI mode
Set `USE_MOCK_AI=true` in `.env` to run the full AI pipeline with zero API cost — useful for development and demo environments. The mock returns realistic, branching responses (e.g. urgent-sounding task titles correctly trigger "Urgent" priority in mock mode).
Flip to `USE_MOCK_AI=false` when billing is set up — no other code changes needed.

---

## 📁 Project Structure

```
WebPM/
├── backend/
│   ├── controllers/      # Route handlers (task, project, auth, user...)
│   ├── jobs/             # node-cron scheduled jobs (riskCron.js)
│   ├── libs/             # Shared utilities (riskEngine, aiClient, aiTriage, riskJob...)
│   ├── middleware/        # Auth middleware
│   ├── models/           # Mongoose schemas (Task, Project, ProjectRisk...)
│   ├── routes/           # Express routers
│   ├── socket/           # Socket.IO server setup
│   └── index.js          # Entry point
├── frontend/
│   ├── app/
│   │   ├── components/   # UI components (ProjectHealthCard, TaskCard...)
│   │   ├── hooks/        # React Query hooks
│   │   ├── lib/          # Utilities (socket.ts, fetch-util...)
│   │   └── routes/       # Page components
│   └── ...
└── README.md
```

---

## 🚢 Deployment

- **Frontend:** Vercel — connect GitHub repo, set `VITE_API_URL` and `VITE_SOCKET_URL` to your production backend URL
- **Backend:** Render — set all env variables from `.env` in Render's dashboard (never commit `.env`)
- **Socket.IO on Render:** Ensure your Render service is not set to "serverless" — Socket.IO requires a persistent process. Use the "Web Service" type, not "Background Worker."

---

## 📄 License

MIT
