# DataRoom MVP

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)

**A virtual Data Room SPA for secure document storage and management.**  
Built as a take-home project for Acme Corp's acquisition due diligence process.

[**🚀 Live Demo →**](https://tailored-tech-orpin.vercel.app/)

</div>

---

## Overview

DataRoom is a Google Drive-inspired single-page application that lets users organize PDF documents in a nested folder structure. All data is stored locally in the browser using **IndexedDB** — no backend required.

## Features

| | Feature |
|---|---|
| 📁 | Create folders and nest them infinitely |
| ✏️ | Rename folders and files |
| 🗑️ | Delete folders (recursively) and files |
| 📤 | Upload PDF files via button or **drag & drop** |
| 👁️ | View PDFs inline with zoom and page navigation |
| 🔍 | Search files and folders by name |
| 🍞 | Breadcrumb navigation with click-to-jump |
| 🔔 | Toast notifications for every action |
| 🔁 | Duplicate name auto-resolution — appends `(1)`, `(2)`… |
| 💾 | Persistent storage — survives page refresh |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| UI primitives | Radix UI + class-variance-authority |
| Icons | Lucide React |
| Storage | IndexedDB via [`idb`](https://github.com/jakearchibald/idb) |
| PDF viewer | [`react-pdf`](https://github.com/wojtekmaj/react-pdf) (pdf.js) |
| Hosting | Vercel |

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
cd dataroom
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

## Usage

| Action | How |
|---|---|
| Open a folder | Double-click |
| Open a PDF | Double-click |
| Rename / Delete | Right-click → context menu |
| Create folder | Toolbar → **New Folder** |
| Upload PDF | Toolbar → **Upload PDF**, or drag & drop anywhere |
| Navigate back | Click any breadcrumb segment |

## Design Decisions

### Data Model — Adjacency List

```ts
interface DataRoomItem {
  id: string;               // UUID v4
  parentId: string | null;  // null = root level
  name: string;
  type: 'folder' | 'file';
  createdAt: number;
  updatedAt: number;
  mimeType?: string;
  size?: number;
}
```

A **flat adjacency list** was chosen over a nested tree object because:
- O(1) item lookup by ID
- Efficient `getChildren()` via `IDBIndex` on `parentId`
- Recursive delete is clean and depth-independent
- Easy to extend (move, copy, share) without restructuring

### Storage — Two Separate Stores

```
IndexedDB "dataroom-db"
├── items  — metadata only, indexed by parentId
└── blobs  — raw Blob objects keyed by item ID
```

Blobs are stored separately so directory listing never loads file data into memory.

### Duplicate Name Handling

`resolveUniqueName()` checks all siblings before every create/rename and appends `(1)`, `(2)`, etc. The user never sees a silent collision or an error — the conflict is resolved automatically.

### Component Architecture

```
App
├── Header
├── Breadcrumb
├── Toolbar        — search · New Folder · Upload PDF
└── FileExplorer
    ├── FolderCard      double-click → navigate in
    ├── FileCard        double-click → open PDF viewer
    └── ContextMenu     right-click → rename / delete
        ├── RenameDialog
        └── DeleteDialog
PDFViewer          — fullscreen modal, zoom, page nav
ToastContainer     — bottom-right notifications
```

## Project Structure

```
dataroom/
└── src/
    ├── components/
    │   ├── ui/              # Primitive components (Button, Dialog, Input)
    │   ├── Breadcrumb.tsx
    │   ├── ContextMenu.tsx
    │   ├── DeleteDialog.tsx
    │   ├── FileCard.tsx
    │   ├── FileExplorer.tsx
    │   ├── FolderCard.tsx
    │   ├── PDFViewer.tsx
    │   ├── RenameDialog.tsx
    │   ├── Toast.tsx
    │   └── Toolbar.tsx
    ├── db/
    │   ├── db.ts            # IDB schema & singleton connection
    │   └── queries.ts       # All CRUD operations
    ├── hooks/
    │   └── useDataRoom.ts   # State management & actions
    ├── lib/
    │   └── utils.ts
    ├── types/
    │   └── index.ts
    ├── App.tsx
    └── main.tsx
```
