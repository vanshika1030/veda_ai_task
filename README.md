# VedaAI — AI Assessment Creator

An intelligent AI-powered assessment creation system that allows teachers to create assignments, generate structured question papers using AI, and manage their assessments — all with a beautiful, modern UI.

![VedaAI](https://img.shields.io/badge/VedaAI-AI%20Assessment%20Creator-E8613A?style=for-the-badge)

## 🏗️ Architecture Overview

```
┌─────────────────┐     WebSocket      ┌──────────────────┐     BullMQ      ┌──────────────┐
│   Next.js App   │ ◄────────────────► │  Express Server  │ ◄────────────► │   Worker      │
│   (Frontend)    │     REST API       │  (Backend API)   │                │  (AI Gen)     │
│   Port 3000     │                    │   Port 3001      │                │               │
└─────────────────┘                    └──────────────────┘                └──────────────┘
                                              │                                  │
                                       ┌──────┴──────┐                    ┌──────┴──────┐
                                       │  MongoDB    │                    │  Google     │
                                       │  (Store)    │                    │  Gemini API │
                                       └─────────────┘                    └─────────────┘
                                       ┌─────────────┐
                                       │  Redis      │
                                       │  (Cache/Q)  │
                                       └─────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 + TypeScript | App Router, SSR, modern React |
| **State Management** | Zustand | Lightweight, type-safe global state |
| **Styling** | Vanilla CSS | Pixel-perfect Figma implementation |
| **Backend** | Node.js + Express + TypeScript | REST API, WebSocket server |
| **Database** | MongoDB (Mongoose) | Persistent storage for assignments |
| **Cache/Queue** | Redis + BullMQ | Job queue for AI generation, result caching |
| **Real-time** | WebSocket (ws) | Live progress updates during generation |
| **AI** | Google Gemini 2.0 Flash | Question paper generation |
| **PDF** | jsPDF + html2canvas | Client-side PDF export |
| **Font** | Inter (Google Fonts) | Modern typography |

## ✨ Features

### Core
- 📝 **Assignment Creation** — Full form with file upload, due date, question types with stepper controls
- 🤖 **AI Question Generation** — Structured prompts → Gemini API → parsed JSON → rendered paper
- 📄 **Question Paper Output** — Professional paper layout with sections, difficulty tags, marks
- 📋 **Assignment Management** — Grid view, search, filter, context menus (view/delete)

### Bonus
- 📥 **PDF Download** — Properly formatted PDF export (not raw HTML print)
- 🔄 **Regenerate** — Re-generate question paper with one click
- 🏷️ **Difficulty Badges** — Color-coded Easy/Moderate/Hard tags
- ⚡ **WebSocket Real-time** — Live progress updates during generation
- 💾 **Redis Caching** — Generated papers cached for fast retrieval
- 📱 **Mobile Responsive** — Sidebar drawer, responsive grid, touch-friendly
- ✅ **Form Validation** — No empty/negative values, required field checks
- 🎨 **Pixel-perfect UI** — Matches Figma designs with attention to spacing, typography, colors

## 📦 Project Structure

```
vedaai/
├── frontend/                 # Next.js 14 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout with sidebar
│   │   │   ├── page.tsx             # Assignments list (home)
│   │   │   ├── globals.css          # All styles (design system)
│   │   │   ├── create/
│   │   │   │   └── page.tsx         # Create assignment form
│   │   │   └── paper/
│   │   │       └── [id]/
│   │   │           └── page.tsx     # Generated paper view
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   │   ├── TopBar.tsx           # Top navigation bar
│   │   │   ├── AssignmentCard.tsx   # Assignment card with menu
│   │   │   ├── EmptyState.tsx       # No assignments illustration
│   │   │   ├── FileUpload.tsx       # Drag & drop file upload
│   │   │   ├── QuestionTypeRow.tsx  # Question type with steppers
│   │   │   ├── QuestionPaper.tsx    # Rendered question paper
│   │   │   └── GeneratingOverlay.tsx # Loading overlay
│   │   ├── store/
│   │   │   └── assignmentStore.ts   # Zustand global state
│   │   ├── lib/
│   │   │   ├── api.ts               # REST API client
│   │   │   └── websocket.ts         # WebSocket client
│   │   └── types/
│   │       └── index.ts             # TypeScript interfaces
│   └── package.json
│
├── backend/                  # Express + TypeScript API
│   ├── src/
│   │   ├── server.ts                # Main server entry
│   │   ├── config/
│   │   │   └── db.ts                # MongoDB + Redis connections
│   │   ├── models/
│   │   │   └── Assignment.ts        # Mongoose schema
│   │   ├── routes/
│   │   │   └── assignments.ts       # REST API endpoints
│   │   ├── services/
│   │   │   ├── aiService.ts         # Gemini AI integration
│   │   │   └── websocket.ts         # WebSocket manager
│   │   ├── queues/
│   │   │   └── generationQueue.ts   # BullMQ job queue
│   │   └── types/
│   │       └── index.ts             # Shared types
│   ├── .env                         # Environment variables
│   └── package.json
│
├── package.json              # Root scripts
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** 18+ 
- **MongoDB** (local or Atlas)
- **Redis** (optional — graceful fallback)
- **Google Gemini API Key** ([Get one free](https://aistudio.google.com/apikey))

### 1. Clone & Install

```bash
git clone <repository-url>
cd vedaai

# Install root dependencies
npm install

# Install all project dependencies
npm run install:all
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod --dbpath /data/db

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

### 4. Start Redis (Optional)

```bash
# If using local Redis
redis-server

# The app works without Redis — uses inline generation fallback
```

### 5. Run Development Servers

```bash
# Start both frontend and backend simultaneously
npm run dev

# Or start individually:
npm run dev:backend   # Express on http://localhost:3001
npm run dev:frontend  # Next.js on http://localhost:3000
```

### 6. Open the App

Navigate to [http://localhost:3000](http://localhost:3000) 🎉

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/assignments` | Create new assignment |
| `GET` | `/api/assignments` | List all assignments |
| `GET` | `/api/assignments/:id` | Get single assignment |
| `DELETE` | `/api/assignments/:id` | Delete assignment |
| `POST` | `/api/assignments/:id/generate` | Trigger AI generation |
| `GET` | `/api/assignments/:id/status` | Check generation status |
| `POST` | `/api/upload` | Upload file (multipart) |
| `GET` | `/api/health` | Health check |

## 🔄 Generation Flow

1. Teacher fills the form and clicks "Generate Question Paper"
2. Frontend creates assignment via `POST /api/assignments`
3. Frontend triggers generation via `POST /api/assignments/:id/generate`
4. Backend adds job to BullMQ queue (or runs inline if Redis unavailable)
5. Worker constructs structured prompt from assignment config
6. Gemini API generates questions in JSON format
7. Worker parses, validates, and stores the result in MongoDB
8. Worker caches result in Redis and broadcasts completion via WebSocket
9. Frontend receives WebSocket event and navigates to the paper view
10. Teacher can download as PDF or regenerate

## 🎨 Design Approach

- **Pixel-perfect** implementation of Figma designs
- **Inter** font family for clean, modern typography
- **CSS Variables** design system for consistent theming
- **Mobile-first** responsive layout with sidebar drawer
- **Smooth animations** for hover effects, page transitions, and loading states
- **Accessibility** with ARIA labels, keyboard navigation, and semantic HTML

## 📄 License

MIT
