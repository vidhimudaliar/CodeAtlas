# CodeAtlas 🚀  
*Your AI Project Manager for Developers & Small Businesses*

## 💻 DevPost
https://devpost.com/software/codeatlas

## 🌟 Overview
**CodeAtlas** converts a messy codebase into a clear visual roadmap. It analyzes repositories, extracts tasks & subtasks, and maps them so contributors and devs can see exactly what to do next — no onboarding required.

---

## 🎬 Demo
<div>
    <a href="http://youtube.com/watch?v=dBJuZoSDHIM">
      <p>Watch demo on Youtube</p>
    </a>
  </div>

---

## ✨ Features

* 🗺️ **Visual Task Maps** — Auto-generated nodes & edges show relationships between tasks.
* 🧭 **Actionable Roadmaps** — Breaks projects into tasks & subtasks developers can pick up immediately.
* 🔁 **Repo Sync** — GitHub webhooks + repo analysis to keep tasks up-to-date.
* 🤖 **Smart Analysis** — AI analyzes commits, PRs, and file changes to infer context.
* 📈 **Progress Dashboard** — See completion and bottlenecks at a glance.

---

## 🛠️ Tech Stack

* **Frontend:** React, CSS
* **Backend:** Next.js (API routes) + FastAPI worker
* **Database:** Supabase (Postgres)
* **Auth:** GitHub OAuth
* **AI:** Google Agent Development Kit + Google Gemini API

---

## 🚀 How it works

1. GitHub webhooks send repo events to a FastAPI worker.
2. A Google Gemini agent analyzes code changes, commit messages, and file structure.
3. Results are stored in Supabase as nodes/edges (tasks & relations).
4. Frontend renders an interactive task map and progress dashboard.

---

## ⚠️ Challenges & Solutions

* **Server communication:** hardened API pipelines between Next.js and the ADK worker.
* **Flexible schema:** nodes/edges/relations model to support different project structures.
* **AI reliability:** iterative prompt engineering + schema validation to ensure structured outputs.

---

## 🧭 Getting started

```bash
git clone https://github.com/your-username/codeatlas.git
cd codeatlas
# configure .env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GITHUB_CLIENT_ID, GEMINI_API_KEY, etc.
npm install
npm run dev
```

---

