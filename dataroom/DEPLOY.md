# Deployment Guide — Vercel

## Local Setup (before deploying)

**Requirements:** Node.js 18+, npm 9+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173

# Build for production (verify it compiles cleanly)
npm run build
# → output in dist/
```

---

## Deploy to Vercel

### Prerequisites

1. Push the project to a GitHub / GitLab / Bitbucket repository.
2. Create a free account at [vercel.com](https://vercel.com) (sign up with your Git provider).

---

### Option A — Vercel Dashboard (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository**.
2. Select your repository.
3. In the **Configure Project** screen set:

   | Setting | Value |
   |---|---|
   | **Root Directory** | `dataroom` |
   | **Framework Preset** | `Vite` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

   > ⚠️ **Root Directory is critical** — if your repo root is the project root (i.e. `package.json` is at `/`), leave it blank. If `package.json` is inside a `dataroom/` subfolder, set Root Directory to `dataroom`.

4. No environment variables are required (all data lives in the browser's IndexedDB).
5. Click **Deploy**.

Vercel will build and publish the app. You'll receive a URL like:
```
https://dataroom-<hash>.vercel.app
```

---

### Option B — Vercel CLI

```bash
# Install CLI globally
npm i -g vercel

# From the project directory (where package.json lives)
cd dataroom

# Login
vercel login

# First-time setup + preview deploy
vercel
# Prompts:
#   Set up and deploy? → Y
#   Which scope?       → (your account)
#   Link to existing?  → N
#   Project name?      → dataroom
#   Root directory?    → ./
# Auto-detected framework: Vite ✓

# Production deploy
vercel --prod
```

---

## SPA Routing

The `vercel.json` file in this project already handles client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

All paths are rewritten to `index.html` — no extra configuration needed.

---

## After Deploying

Update the **Live Demo** link in `README.md`:

```md
## Live Demo

[https://dataroom-<your-hash>.vercel.app](https://dataroom-<your-hash>.vercel.app)
```
