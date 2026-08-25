# SkillSwap

A modern full-stack peer-to-peer skill exchange platform where users trade skills instead of money.

![SkillSwap](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)

## 🌐 Live Demo

* **Live Website (Frontend):** [https://skillswap-hub-pi.vercel.app](https://skillswap-hub-pi.vercel.app)
* **Backend API URL:** [https://skillswap-api-8n3w.onrender.com](https://skillswap-api-8n3w.onrender.com)


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
git clone https://github.com/Sevani2005/Skillswap_Hub.git
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