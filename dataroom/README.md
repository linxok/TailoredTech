# DataRoom MVP

A virtual Data Room SPA for secure document storage and management — built for Acme Corp's acquisition due diligence process.

## Live Demo

> Deploy to Vercel and add URL here.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Build for production:**
```bash
npm run build
```

## Features

- **Folders** — create, nest, rename, delete (recursive)
- **Files** — upload PDF, view inline, rename, delete
- **Search** — filter by name within current folder
- **Drag & drop** — drop a PDF anywhere on the page to upload
- **Breadcrumb navigation** — full path with click-to-jump
- **Toast notifications** — feedback for every action
- **Duplicate name handling** — auto-appends `(1)`, `(2)`, etc.
- **Persistent storage** — IndexedDB (survives page refresh)

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| UI primitives | Radix UI + CVA |
| Icons | Lucide React |
| Storage | IndexedDB via `idb` |
| PDF viewer | `react-pdf` (pdf.js) |

## Design Decisions

### Data Model

```ts
interface DataRoomItem {
  id: string;          // UUID
  parentId: string | null;  // null = root
  name: string;
  type: 'folder' | 'file';
  createdAt: number;
  updatedAt: number;
  mimeType?: string;
  size?: number;
}
```

A flat list with a `parentId` pointer (adjacency list) was chosen over a nested tree because:
- O(1) item lookup by ID
- Efficient subtree queries via `IDBIndex` on `parentId`
- Simpler recursive delete without deep object traversal

### Storage

Two IndexedDB object stores:
- `items` — metadata only, indexed by `parentId` for fast `getChildren()`
- `blobs` — raw `Blob` objects keyed by item ID, kept separate to avoid loading file data on directory listing

### Duplicate Names

`resolveUniqueName()` checks existing siblings and appends `(1)`, `(2)`, etc. — applied on both create and rename, so the user never hits a silent collision.

### Component Architecture

```
App
├── Header
├── Breadcrumb
├── Toolbar (search + New Folder + Upload PDF)
└── FileExplorer
    ├── FolderCard  (double-click = navigate)
    ├── FileCard    (double-click = open PDF viewer)
    └── ContextMenu (right-click → rename / delete)
        ├── RenameDialog
        └── DeleteDialog
PDFViewer (fullscreen modal, react-pdf)
ToastContainer
```

## Project Structure

```
src/
  components/
    ui/           # button, dialog, input primitives
    Breadcrumb.tsx
    ContextMenu.tsx
    DeleteDialog.tsx
    FileCard.tsx
    FileExplorer.tsx
    FolderCard.tsx
    PDFViewer.tsx
    RenameDialog.tsx
    Toast.tsx
    Toolbar.tsx
  db/
    db.ts         # IDB schema & connection
    queries.ts    # CRUD operations
  hooks/
    useDataRoom.ts
  lib/
    utils.ts
  types/
    index.ts
  App.tsx
  main.tsx
```
