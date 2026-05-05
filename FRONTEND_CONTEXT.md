# Stokku.ai Frontend - AI Context & Development Guidelines

This document serves as a comprehensive context guide for AI assistants (like ChatGPT, Claude, Gemini, etc.) and developers working on the **Stokku.ai** frontend project. You can copy and paste this entire document to provide the AI with full context about the frontend architecture, styling, and rules.

---

## 1. Project Overview & Tech Stack
**Project Name:** Stokku.ai (Smart Inventory Management System)
**Role:** Frontend Web Application
**Environment:** Node.js (v20+)
**Directory:** `/web` (from root)

**Core Technologies:**
- **Framework:** Next.js 16.2.1 (App Router exclusively)
- **Library:** React 19.2.4
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (with PostCSS)
- **State Management:** Zustand (for global state like Auth)
- **Routing:** Next.js App Router (`/app` directory)
- **Components:** Radix UI Primitives (`@radix-ui/*`), standard accessible UI.
- **Icons:** Lucide React
- **Charts/Visualization:** Recharts
- **Forms/Validation:** React Hook Form + Zod
- **API Fetching:** Native `fetch` with a custom wrapper (`lib/api.ts`)

---

## 2. Project Architecture & Directory Structure

```text
web/
├── app/                  # Next.js App Router (Pages, Layouts, Globals)
│   ├── dashboard/        # Main authenticated dashboard area
│   ├── login/            # Authentication page
│   ├── globals.css       # Core Tailwind configuration and CSS Variables
│   └── layout.tsx        # Root layout, defines fonts and theme providers
├── components/           # Reusable React components
│   ├── layout/           # Sidebar, Header, etc.
│   └── ui/               # Base UI components (Buttons, Inputs, Cards - Radix/Tailwind based)
├── lib/                  # Utilities, API routes, Store
│   ├── api.ts            # Custom API fetch wrapper (handling JWT tokens)
│   ├── auth.ts           # Zustand store for authentication state
│   └── utils.ts          # Helper functions (e.g., tailwind-merge `cn()`)
├── public/               # Static assets (images, logos)
├── next.config.ts        # Next.js configuration (contains API proxy logic)
└── package.json          # Dependencies and scripts
```

---

## 3. Styling & UI/UX Guidelines

Stokku.ai uses a **Premium Modern Glassmorphism** aesthetic. 

**Color Palette (defined in `globals.css` using HSL variables):**
- The default theme is strongly dark, leaning heavily towards rich blues and cyans.
- **Primary Colors:** Cyan (`#22d3ee` / `hsl(215 80% 48%)`) and Blue/Indigo.
- **Backgrounds:** Very deep blue/black (`#03060d` or `hsl(222 47% 4%)`).
- **Cards/Containers:** Overlays of `bg-white/5` or `bg-[#0a0f1c]/80` with heavy `backdrop-blur` to achieve the glass UI.
- **Borders:** Thin, subtle borders (`border-white/5` or `border-white/10`).

**Typography:**
- **Headings/Display:** `Outfit` font (`font-outfit` class).
- **Body:** `Inter` font (`font-sans` class).

**Design Rules for AI:**
1. **Never use generic colors** (like plain `bg-blue-500`). Use the semantic CSS variables (`bg-primary`) or Tailwind utility colors with opacity (e.g., `bg-cyan-500/10 text-cyan-400`).
2. **Embrace Glassmorphism:** When creating new cards or widgets, use `backdrop-blur-md` (or larger), semi-transparent backgrounds (e.g., `bg-white/[0.03]`), and subtle borders.
3. **Animations:** Keep animations lightweight but present. Use Tailwind `animate-in`, `fade-in`, `slide-in-from-bottom`, and subtle hover scale/translate effects on interactive elements.

---

## 4. API & Data Fetching Architecture

- **CORS Bypass (Proxy):** The frontend strictly avoids direct backend calls in the browser to prevent CORS issues. Instead, `next.config.ts` proxies all requests starting with `/api/v1/:path*` to the internal backend (`BACKEND_INTERNAL_URL` or `http://127.0.0.1:8080`).
- **API Wrapper (`lib/api.ts`):** 
  - All API calls must go through the functions defined in `lib/api.ts` (e.g., `dashboardApi.getStats()`, `productApi.getAll()`).
  - The wrapper automatically handles JWT injection from `js-cookie` (`Cookies.get("token")`).
  - The wrapper globally catches `401 Unauthorized` responses and automatically triggers a logout and redirect to the `/login` page via Zustand's `useAuthStore`.

---

## 5. State Management & Authentication

- Authentication state is strictly managed using **Zustand** via `lib/auth.ts` (`useAuthStore`).
- The store holds the current `user` object and a `token`.
- JWT Token is also stored in Cookies (`js-cookie`) so that API requests (and potentially middleware) can access it.
- **Do not use Context API for global state**; always default to Zustand for simplicity and performance.

---

## 6. Critical Development Fixes (Do NOT Revert)

1. **Memory Limits:** The `package.json` scripts contain a crucial memory fix:
   `"dev": "cross-env NODE_OPTIONS='--max-old-space-size=4096' next dev"`
   `"build": "cross-env NODE_OPTIONS='--max-old-space-size=4096' next build"`
   **Do not remove this**, as the Next.js/Turbopack setup causes `heap out of memory` errors without it.
2. **TypeScript Strictness:** Ensure all UI components (like Badges, Buttons) use strict, valid variants. E.g., The `Badge` component does not have a `"ghost"` variant natively without custom configuration; stick to `"outline"`, `"default"`, `"secondary"`.

---

## 7. How to Write Code for this Project

When prompted to build a new feature or page:
1. Create isolated UI components in `components/ui/` if they are highly reusable.
2. For specific page features, add them to `app/dashboard/<feature-name>/page.tsx`.
3. Wire API calls by first defining the interfaces and wrapper functions in `lib/api.ts`.
4. Use `lucide-react` for any necessary iconography. Do NOT use FontAwesome or Heroicons.
5. Use `sonner` for toast notifications (`import { toast } from "sonner";`).
6. Guarantee the design looks premium: use uppercase tracking-wide subheadings (`text-[10px] uppercase tracking-widest font-bold`), clean gradients (`bg-linear-to-r from-cyan-400 to-indigo-400 text-transparent bg-clip-text`), and rounded corners (`rounded-xl` or `rounded-2xl`).
