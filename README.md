# ⚡ VALANCE // Portfolio & Research Engine

> Personal portfolio and project showcase for **Arpit Baranwal** — AI/ML, Python & Backend Developer.  
> Live at [valance.dev](https://valance.dev)

A cyberpunk and manga-noir styled terminal portfolio built with **Svelte 5 (Runes)**, **SvelteKit 2**, **Tailwind CSS v4**, and **Vite**. Features atmospheric background artwork, custom CRT scanlines and grain filters, interactive dock navigation, and live project demos.

---

## 🌌 Highlights & Aesthetic

- **Cyber-Industrial & Manga Noir Aesthetic:** Halftone background art, ambient gradient fades, scanlines, and subtle CRT grain animations.
- **Svelte 5 Runes:** Built entirely with modern Svelte 5 reactivity (`$state`, `$props`, `$derived`).
- **Dynamic Projects Grid:** Filtered cards with live links, source repositories, tech tags, and specialized preview types (terminal, dashboard, studio, chat).
- **Interactive Contact Terminal:** In-app direct email dispatch powered by Nodemailer and SvelteKit API endpoints.
- **Micro-Interactions & Easter Eggs:**
  - Frame-by-frame animated dog favicon.
  - Interactive cigarette smoke overlay simulation.
  - "To Be Continued" tribute footer.
  - Floating macOS/iPad-style glassmorphism navigation dock.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [SvelteKit 2](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/) (Runes) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom typography & gradients |
| **Bundler & Build** | [Vite 8](https://vitejs.dev/) |
| **Typography** | `Bebas Neue`, `Space Mono`, `Roboto Condensed` |
| **Server / API** | SvelteKit Server Endpoints + [Nodemailer](https://nodemailer.com/) |
| **Adapter & Deploy** | `@sveltejs/adapter-vercel` |
| **Quality & Format** | TypeScript, Prettier, `prettier-plugin-svelte`, `svelte-check` |

---

## 📁 Project Structure

```text
portfolio/
├── src/
│   ├── lib/
│   │   ├── assets/              # Static media, icons, and background artwork
│   │   │   ├── background/      # Manga-noir backdrops & character artwork
│   │   │   └── projects/        # Project card preview captures
│   │   ├── components/          # Reusable Svelte 5 components
│   │   │   ├── Dock.svelte      # Floating interactive glass dock
│   │   │   ├── Hero.svelte      # Terminal hero with marquee
│   │   │   ├── ProjectCard.svelte # Interactive project display cards
│   │   │   ├── StackMarquee.svelte # Tech stack marquee ticker
│   │   │   └── SEOMeta.svelte   # Dynamic OpenGraph & Twitter metadata
│   │   └── data/
│   │       └── projects.ts      # Structured projects data source
│   └── routes/
│       ├── +layout.svelte       # Root layout & dynamic favicon animator
│       ├── +page.svelte         # Home / Hero landing view
│       ├── layout.css           # Global Tailwind & aesthetic overlay styles
│       ├── api/email/           # Contact form Nodemailer endpoint
│       ├── contact/             # Contact page & message console
│       └── projects/            # Full-page project showcase
├── static/                      # Static fonts, PDF resume, and favicons
└── package.json
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **npm**, **pnpm**, or **yarn**

### 2. Installation
Clone the repository and install project dependencies:

```bash
git clone https://github.com/arpitbaranwal/portfolio.git
cd portfolio
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in your SMTP credentials for the contact form:

```bash
cp .env.example .env
```

```ini
MAIL_SMTP_HOST=smtp.example.com
MAIL_SMTP_PORT=587
MAIL_SMTP_USER=user@example.com
MAIL_SMTP_PASS=your-secure-password
```

### 4. Running Locally
Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Development Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts the local Vite development server |
| `npm run build` | Bundles and prepares production build for Vercel |
| `npm run preview` | Locally serves and previews the production build |
| `npm run check` | Runs Svelte diagnostic checks and TypeScript validation |
| `npm run lint` | Checks code formatting with Prettier |
| `npm run format` | Auto-formats code with Prettier and Tailwind plugin |

---

## 🚢 Deployment

The project is pre-configured with `@sveltejs/adapter-vercel`.

1. Import the repository into your [Vercel Dashboard](https://vercel.com).
2. Configure your environment variables (`MAIL_SMTP_*`) in the Vercel project settings.
3. Deploy — Vercel will automatically run `npm run build` using the configured adapter.

---

## 📄 License

Created with 🫰 by [Arpit Baranwal](https://github.com/arpitbaranwal).
