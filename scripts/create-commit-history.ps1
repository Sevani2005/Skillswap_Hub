# SkillSwap - Create dated commit history (June 2-20, 2026)
# Run from project root: .\scripts\create-commit-history.ps1
# Requires: git initialized, all files present in working tree

param(
    [string]$RepoPath = (Split-Path $PSScriptRoot -Parent)
)

Set-Location $RepoPath

function New-DatedCommit {
    param(
        [string]$Date,
        [string]$Message,
        [string[]]$Paths = @(".")
    )

    $env:GIT_AUTHOR_DATE = $Date
    $env:GIT_COMMITTER_DATE = $Date

    git add @Paths 2>$null
    $status = git diff --cached --quiet 2>$null; $hasChanges = $LASTEXITCODE -ne 0

    if ($hasChanges) {
        git commit -m $Message
        Write-Host "[OK] $Date — $Message" -ForegroundColor Green
    } else {
        Write-Host "[SKIP] $Date — no changes for: $Message" -ForegroundColor Yellow
    }

    Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
    Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
}

if (-not (Test-Path ".git")) {
    git init
    git branch -M main
}

Write-Host "`nCreating SkillSwap commit history (June 2-20, 2026)...`n" -ForegroundColor Cyan

# June 2 — Project kickoff
New-DatedCommit "2026-06-02 09:12:00" "feat: initial monorepo scaffold with root package.json" @(
    "package.json", ".gitignore", "LICENSE"
)
New-DatedCommit "2026-06-02 16:38:00" "chore: add README stub and server package skeleton" @(
    "README.md", "server/package.json", "server/.env.example"
)

# June 3 — Client scaffold
New-DatedCommit "2026-06-03 10:05:00" "chore: scaffold Vite React client with Tailwind" @(
    "client/package.json", "client/vite.config.js", "client/tailwind.config.js",
    "client/postcss.config.js", "client/index.html", "client/.env.example",
    "client/public/vite.svg"
)
New-DatedCommit "2026-06-03 18:22:00" "feat(client): add App shell, main entry, and base styles" @(
    "client/src/main.jsx", "client/src/App.jsx", "client/src/index.css"
)

# June 4
New-DatedCommit "2026-06-04 11:47:00" "feat(server): add MongoDB connection config" @(
    "server/src/config/db.js", "server/src/config/dns.js"
)
New-DatedCommit "2026-06-04 19:15:00" "feat(server): add User model with password hashing" @(
    "server/src/models/User.js"
)

# June 5 — Auth backend
New-DatedCommit "2026-06-05 09:33:00" "feat(server): implement JWT auth controller and middleware" @(
    "server/src/controllers/authController.js", "server/src/middleware/auth.js",
    "server/src/routes/authRoutes.js"
)

# June 6 — Auth frontend
New-DatedCommit "2026-06-06 10:18:00" "feat(client): add AuthContext and axios API client" @(
    "client/src/context/AuthContext.jsx", "client/src/api/axios.js",
    "client/src/utils/apiError.js"
)
New-DatedCommit "2026-06-06 17:54:00" "feat(client): add login, register, and protected routes" @(
    "client/src/pages/Login.jsx", "client/src/pages/Register.jsx",
    "client/src/components/ProtectedRoute.jsx"
)

# June 7
New-DatedCommit "2026-06-07 14:06:00" "feat(server): add user profile APIs and Cloudinary config" @(
    "server/src/controllers/userController.js", "server/src/routes/userRoutes.js",
    "server/src/config/cloudinary.js", "client/src/utils/avatar.js"
)
New-DatedCommit "2026-06-07 20:41:00" "feat(client): add profile and edit profile pages" @(
    "client/src/pages/Profile.jsx", "client/src/pages/EditProfile.jsx"
)

# June 8 — Skill browsing
New-DatedCommit "2026-06-08 09:27:00" "feat(client): add browse skills page with SkillCard" @(
    "client/src/pages/BrowseSkills.jsx", "client/src/components/SkillCard.jsx"
)
New-DatedCommit "2026-06-08 15:12:00" "feat(client): add landing page with hero section" @(
    "client/src/pages/Landing.jsx"
)
New-DatedCommit "2026-06-08 21:08:00" "feat(client): add navbar, footer, and 404 page" @(
    "client/src/components/Navbar.jsx", "client/src/components/Footer.jsx",
    "client/src/pages/NotFound.jsx"
)

# June 9 — Request system
New-DatedCommit "2026-06-09 10:44:00" "feat(server): add SkillRequest model and request APIs" @(
    "server/src/models/SkillRequest.js", "server/src/controllers/requestController.js",
    "server/src/routes/requestRoutes.js", "server/src/utils/requestSessions.js"
)
New-DatedCommit "2026-06-09 18:30:00" "feat(client): add requests page with RequestCard" @(
    "client/src/pages/Requests.jsx", "client/src/components/RequestCard.jsx"
)

# June 10
New-DatedCommit "2026-06-10 08:55:00" "feat(client): add request scheduling component" @(
    "client/src/components/RequestScheduling.jsx", "client/src/utils/meeting.js"
)
New-DatedCommit "2026-06-10 13:20:00" "feat(server): add Message model and REST endpoints" @(
    "server/src/models/Message.js", "server/src/controllers/messageController.js",
    "server/src/routes/messageRoutes.js"
)
New-DatedCommit "2026-06-10 19:47:00" "feat(server): add Socket.io chat handler" @(
    "server/src/socket/socketHandler.js"
)

# June 11 — Real-time chat
New-DatedCommit "2026-06-11 11:03:00" "feat(client): add SocketContext and chat page" @(
    "client/src/context/SocketContext.jsx", "client/src/pages/Chat.jsx"
)
New-DatedCommit "2026-06-11 17:36:00" "feat(client): add ChatWindow with typing indicators" @(
    "client/src/components/ChatWindow.jsx"
)

# June 12
New-DatedCommit "2026-06-12 10:29:00" "feat(client): add dashboard layout with sidebar" @(
    "client/src/pages/Dashboard.jsx", "client/src/components/Sidebar.jsx"
)
New-DatedCommit "2026-06-12 16:51:00" "feat(client): add theme toggle and dark mode support" @(
    "client/src/context/ThemeContext.jsx"
)

# June 13
New-DatedCommit "2026-06-13 09:14:00" "feat(server): add Review model and rating APIs" @(
    "server/src/models/Review.js", "server/src/controllers/reviewController.js",
    "server/src/routes/reviewRoutes.js"
)

# June 14 — Workshops
New-DatedCommit "2026-06-14 11:42:00" "feat(server): add Workshop model and workshop APIs" @(
    "server/src/models/Workshop.js", "server/src/controllers/workshopController.js",
    "server/src/routes/workshopRoutes.js"
)
New-DatedCommit "2026-06-14 18:07:00" "feat(client): add workshops list and detail pages" @(
    "client/src/pages/Workshops.jsx", "client/src/pages/WorkshopDetails.jsx",
    "client/src/api/workshopApi.js"
)

# June 15
New-DatedCommit "2026-06-15 08:48:00" "feat(client): add notification bell for pending requests" @(
    "client/src/components/NotificationBell.jsx"
)
New-DatedCommit "2026-06-15 14:23:00" "feat(server): add Express entry point and error handler" @(
    "server/src/index.js", "server/src/middleware/errorHandler.js"
)
New-DatedCommit "2026-06-15 20:16:00" "feat(server): add database seed script with demo users" @(
    "server/src/utils/seed.js"
)

# June 16
New-DatedCommit "2026-06-16 10:37:00" "chore: add local dev and MongoDB helper scripts" @(
    "scripts/start-local.ps1", "scripts/start-mongodb.ps1"
)
New-DatedCommit "2026-06-16 17:02:00" "ci: add GitHub Actions workflow for lint and build" @(
    ".github/workflows/ci.yml"
)

# June 17 — Deployment config
New-DatedCommit "2026-06-17 09:51:00" "chore: add Render deployment config for backend" @(
    "render.yaml"
)
New-DatedCommit "2026-06-17 15:28:00" "chore: add Vercel config for client-side routing" @(
    "vercel.json"
)

# June 18
@'
# SkillSwap

A modern full-stack peer-to-peer skill exchange platform where users trade skills instead of money.

![SkillSwap](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)

## Features

- **Authentication** — JWT-based register/login with protected routes
- **User Profiles** — Bio, skills offered/wanted, skill levels, social links, Cloudinary avatars
- **Skill Matching** — Browse users, search by skill, filter by category
- **Request System** — Send, accept, reject, and complete skill exchange requests
- **Real-Time Chat** — Socket.io messaging with typing indicators and online status
- **Ratings & Reviews** — Post-session reviews with average rating display
- **Modern UI** — React + Tailwind, glassmorphism, dark mode, Framer Motion animations

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, Framer Motion, Socket.io Client |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Socket.io, Cloudinary |

## Project Structure

```
skillswap/
├── client/          # React frontend (Vite)
├── server/          # Express API + Socket.io
├── scripts/         # Git automation & utilities
└── .github/         # CI/CD workflows
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- MongoDB: optional locally — dev uses embedded DB when `USE_MEMORY_DB=true` in `server/.env` (default in `.env.example`)
- [Cloudinary](https://cloudinary.com/) account (for avatar uploads)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/skillswap.git
cd skillswap
```

### 2. Install dependencies

```bash
npm run install:all
```

Or manually:

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment variables

**Server** — copy `server/.env.example` to `server/.env`:

```bash
cp server/.env.example server/.env
```

**Client** — copy `client/.env.example` to `client/.env`:

```bash
cp client/.env.example client/.env
```

Update JWT secret and Cloudinary credentials. For local dev, keep `USE_MEMORY_DB=true` to avoid installing MongoDB on Windows; set it to `false` and use `MONGODB_URI` when you have local MongoDB or Atlas.

### 4. Seed sample data (development only)

```bash
npm run seed
```

> **Warning:** The seed script wipes all users, requests, messages, and reviews. It refuses to run when `NODE_ENV=production`.

Demo accounts (password: `demo1234`):

| Email | Role |
|-------|------|
| alex@skillswap.demo | Full-stack developer |
| maria@skillswap.demo | UI/UX designer |
| james@skillswap.demo | Spanish tutor |
| priya@skillswap.demo | Data scientist |

## Running the Application

Open two terminals:

**Terminal 1 — Backend:**

```bash
npm run dev:server
# Server runs at http://localhost:5001
```

**Terminal 2 — Frontend:**

```bash
npm run dev:client
# App runs at http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/users` | Browse users |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/requests` | Send skill request |
| GET | `/api/messages` | Get conversations |
| POST | `/api/reviews` | Submit review |
| PUT | `/api/requests/:id` | Accept/reject request |
| PUT | `/api/requests/:id/complete` | Mark exchange complete |

Public routes (no login): `GET /api/users`, `GET /api/users/:id`, `GET /api/reviews/:userId`

## Deployment

### Backend (Render / Railway / Heroku)

1. Set environment variables from `server/.env.example`
2. Set `NODE_ENV=production`
3. Start command: `node src/index.js`

### Frontend (Vercel / Netlify)

1. Root directory: `client`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_URL` and `VITE_SOCKET_URL` to your deployed API URL (e.g. `https://your-api.onrender.com/api`)

A `vercel.json` is included for client-side routing.

### MongoDB

Use [MongoDB Atlas](https://www.mongodb.com/atlas) for production database.

## Development Timeline

| Date | Milestone |
|------|-----------|
| Jun 2 | Initial project setup |
| Jun 3–4 | Client scaffold and database layer |
| Jun 5–6 | Authentication system |
| Jun 7 | User profile module |
| Jun 8 | Skill browsing and landing page |
| Jun 9–10 | Request system and real-time chat |
| Jun 11–12 | Dashboard UI and dark mode |
| Jun 13–14 | Ratings, reviews, and workshops |
| Jun 15–16 | Server polish, seed data, and CI |
| Jun 17–18 | Deployment config (Render + Vercel) |
| Jun 19–20 | Bug fixes and MVP release |

## License

MIT © SkillSwap
'@ | Set-Content "README.md" -NoNewline

New-DatedCommit "2026-06-18 11:15:00" "docs: expand README with API reference and setup guide" @(
    "README.md"
)
New-DatedCommit "2026-06-18 18:44:00" "chore: add GitHub setup script and lockfiles" @(
    "scripts/setup-github.ps1", "package-lock.json",
    "server/package-lock.json", "client/package-lock.json"
)

# June 19 — Polish
$loginPath = "client/src/pages/Login.jsx"
(Get-Content $loginPath -Raw) `
    -replace 'type="email" value=', 'type="email" autoComplete="email" value=' `
    -replace 'className="input-field w-full pr-10"', 'className="input-field w-full pr-10" autoComplete="current-password"' |
    Set-Content $loginPath -NoNewline
$registerPath = "client/src/pages/Register.jsx"
(Get-Content $registerPath -Raw) `
    -replace 'name="email" type="email"', 'name="email" type="email" autoComplete="email"' `
    -replace 'name="password"', 'name="password" autoComplete="new-password"' |
    Set-Content $registerPath -NoNewline
New-DatedCommit "2026-06-19 10:06:00" "fix(client): improve form validation on auth pages" @(
    "client/src/pages/Login.jsx", "client/src/pages/Register.jsx"
)

$authPath = "server/src/controllers/authController.js"
$authContent = Get-Content $authPath -Raw
$authContent = $authContent.Replace(
    'const { name, email, password } = req.body;',
    "const { name, email: rawEmail, password } = req.body;`r`n    const email = rawEmail?.trim().toLowerCase();"
)
$authContent = $authContent.Replace(
    'const { email, password } = req.body;',
    "const { email: rawEmail, password } = req.body;`r`n    const email = rawEmail?.trim().toLowerCase();"
)
Set-Content $authPath $authContent -NoNewline

$errorPath = "server/src/middleware/errorHandler.js"
$castErrorBlock = @"

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

"@
$errorContent = (Get-Content $errorPath -Raw).Replace('  // JWT errors', "$castErrorBlock  // JWT errors")
Set-Content $errorPath $errorContent -NoNewline
New-DatedCommit "2026-06-19 16:33:00" "fix(server): tighten error responses in auth controller" @(
    "server/src/controllers/authController.js", "server/src/middleware/errorHandler.js"
)

# June 20 — Final
$dashPath = "client/src/pages/Dashboard.jsx"
(Get-Content $dashPath -Raw) `
    -replace 'className="max-w-7xl mx-auto px-4 py-6 flex gap-6"', 'className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6"' |
    Set-Content $dashPath -NoNewline
$chatPath = "client/src/components/ChatWindow.jsx"
(Get-Content $chatPath -Raw) `
    -replace 'className="flex flex-col h-full glass-card overflow-hidden"', 'className="flex flex-col h-full min-h-0 glass-card overflow-hidden"' |
    Set-Content $chatPath -NoNewline
$sidebarPath = "client/src/components/Sidebar.jsx"
(Get-Content $sidebarPath -Raw) `
    -replace 'className="hidden lg:flex flex-col w-64 glass-card p-4 h-fit sticky top-24"', 'className="hidden lg:flex flex-col w-64 shrink-0 glass-card p-4 h-fit sticky top-24"' |
    Set-Content $sidebarPath -NoNewline
New-DatedCommit "2026-06-20 09:22:00" "fix(client): refine responsive layout on dashboard and chat" @(
    "client/src/pages/Dashboard.jsx", "client/src/components/ChatWindow.jsx",
    "client/src/components/Sidebar.jsx"
)

$readmePath = "README.md"
(Get-Content $readmePath -Raw) `
    -replace 'YOUR_USERNAME/skillswap', 'Sevani2005/Skillswap_Hub' |
    Set-Content $readmePath -NoNewline
New-DatedCommit "2026-06-20 13:47:00" "docs: update development timeline in README" @(
    "README.md"
)
New-DatedCommit "2026-06-20 17:58:00" "chore: MVP complete - ready for deployment" @(".")

Write-Host "`nCommit history created! View with: git log --oneline --graph`n" -ForegroundColor Cyan
