@AGENTS.md

# Project State — UGCAds (as of May 9, 2026)

## Stack
- Next.js 16.2.1 with Turbopack (has breaking changes — read `node_modules/next/dist/docs/` before writing code)
- Tailwind CSS v4
- Supabase auth + Prisma ORM (PostgreSQL via Supabase)
- Cloudflare R2 for file storage (`uploadToR2` in `src/lib/r2.ts`)
- Razorpay for payments
- Poyo API for AI generation (`POYO_API_KEY` in .env) — replaced KIE/fal.ai
- Inngest for background jobs
- Vercel for deployment (`vercel --prod` to deploy)

## Design System
- Background: `#F7F9FC` (app layout), white cards
- Primary blue: `#2563EB`, cyan accent: `#06B6D4`
- Cards: `bg-white border border-[#E5E7EB] rounded-2xl` with `boxShadow: "0 2px 12px rgba(0,0,0,0.06)"`
- Text: `#111111` headings, `#374151` body, `#6B7280` secondary, `#9CA3AF` muted
- Buttons: `rounded-2xl`, primary blue `#2563EB`
- No dashes/em-dashes as separators in user-facing text
- No framer-motion on new pages (history page removed it; credits/profile use it sparingly)

## Logo (`src/components/ui/logo.tsx`)
- "ugc" + blue rounded square (`#2563EB`, `rounded-[6px]`) with white arrow-up-right icon + "ads"
- Three separate pieces, NOT embedding icon as a letter

## Sidebar (`src/components/app/Sidebar.tsx`)
- Fixed left, `w-[252px]`, white bg, `border-right: 1px solid #E5E7EB`
- Nav items: active state has blue bg `rgba(37,99,235,0.08)` + border `rgba(37,99,235,0.2)`
- Bottom section: Credits card + Profile card
- **Profile dropdown**: Custom `createPortal` implementation (NOT using DropdownMenu component). Uses `useRef` + `getBoundingClientRect` + `position: fixed` rendered to `document.body`
- Credits card shows: bolt icon, credit count (28px bold), progress bar, "X / Y credits remaining", Upgrade Plan button

## Conditional Orb (`src/components/app/ConditionalOrb.tsx`)
- Shows `GenerationsOrb` only on `/create/ugc-studio`, `/create/product-photoshoot`, `/create/tryon`
- GenerationsOrb pill: green dot + count + "Generating"/"Jobs"/"No jobs" + chevron
- Orb hides automatically when any modal opens on those pages (dispatches `app:modal-open` / `app:modal-close` custom window events)
- Orb container is `z-[25]` in layout — above the content wrapper (`z-[20]`)

## Credits System
- **No x10 tenths system** — credits are stored and used as plain display integers throughout
- `CREDIT_UNITS = 1` in `src/lib/credits.ts` — `toUnits`/`fromUnits` are identity functions
- `COSTS` in `credits.ts` = display credits per generation (e.g., UGC_AD_5S = 15, MOCKUP = 1, TRYON = 5)
- `PLAN_CREDITS`: BASIC = 100, CREATOR = 300, AGENCY = 500 (display credits)
- `SIGNUP_CREDITS = 30` granted to new users
- Ring chart on Credits page = `available / plan_total` (not usage-based)

## AI Generation — Poyo API (`src/lib/poyo.ts`)
- Base URL: `https://api.poyo.ai` — `POST /api/generate/submit`, `GET /api/generate/status/{task_id}`
- **Image models** (`PHOTOSHOOT_MODELS`) for Product Photoshoot:
  - `seedream-4.5-edit` — Seedream 4.5, ByteDance logo (`/models/seedance-2.webp`), 5 credits
  - `nano-banana-2-new-edit` — Nano Banana 2, Gemini, 5 credits
  - `seedream-5.0-lite-edit` — Seedream 5 Lite, ByteDance logo, 5 credits
  - `flux-2-pro-edit` — Flux 2 Pro, BFL, 6 credits
  - `gpt-image-2-edit` — GPT Image 2, OpenAI, 3 credits
- **Video models** (`VIDEO_MODELS`) for UGC Studio:
  - `seedance-2-fast` — Seedance 2, ByteDance, max 15s (`/models/seedance-2.webp`)
  - `sora-2-official` — Sora 2, OpenAI, max 20s (`/models/sora-2.webp`)
  - `kling-3.0/standard` — Kling 3.0, max 15s (`/models/kling-3.webp`)
  - `veo3.1-quality` — Veo 3.1, Google, max 8s (`/models/veo-3.webp`)
- Per-model input builders in `buildInput` (image) and `buildVideoInput` (video) switch statements
- `submitPoyoTask` / `submitPoyoVideoTask` — submit and return `task_id`
- `pollPoyoTask` — returns `{ state: "pending"|"success"|"fail", url?, error? }`

## Generation Routes
- `POST /api/generate/mockup` — Product Photoshoot; polls Poyo synchronously (4s interval, 110s timeout)
- `POST /api/generate/studio` — UGC Studio video; submits Poyo task, stores `poyoTaskId` in metadata, returns immediately
- `GET /api/generate/status?id=` — polls Poyo when `meta.poyoTaskId` exists; falls back to KIE for legacy generations
- Provider stored as `"POYO"` in `generation.provider`

## Pages Completed

### UGC Studio (`src/app/(app)/create/ugc-studio/page.tsx`)
- Hero: fan of 3 video cards cycling with transitions
- Model dropdown pill (first in settings row): Seedance 2 / Sora 2 / Kling 3.0 / Veo 3.1
- Duration options are dynamic per model max (veo caps at 8s, sora allows 20s)
- "Choose avatar" label — custom avatar upload shown as 36px chip with X
- "Add file" in top-left + drag-and-drop on card
- Textarea fills full height, 10,000 char limit, counter at bottom
- Avatar modal: `z-[100]`, `max-w-[1120px] h-[720px]`, scrollable sidebar, 5-col grid, "Upload your own" first card

### Product Photoshoot (`src/app/(app)/create/product-photoshoot/page.tsx`)
- Hero: fan of 5 AVIF sample images (preloaded via `react-dom` `preload()`)
- Model dropdown + Aspect dropdown in settings row
- "Add file" + drag-and-drop for product upload
- "Choose template" 3/4 portrait picker on right
- TemplateModal: sidebar categories + search + 4-col grid

### AI Try-On (`src/app/(app)/create/tryon/page.tsx`)
- Hero: fan of 5 AVIF sample images (preloaded via `react-dom` `preload()`)
- "Add garment" file button + drag-and-drop
- 2x2 category grid: Tops, Bottoms, Full Body, Outerwear
- "Choose model" 3/4 portrait picker on right
- ModelModal: gender filter sidebar + search + 5-col portrait grid

### History (`src/app/(app)/history/HistoryClient.tsx`)
- Header: "History" title + search bar
- Inline stats: Total / Complete (blue) / Processing (amber) + sort dropdown
- Filter pills: All | UGC Video | Product Photoshoot | AI Try-On
- 3-col card grid: 4:3 thumbnail, status badge, play button, processing overlay, type tag pill, date

### Credits (`src/app/(app)/credits/`)
- `page.tsx`: passes transactions (USAGE + REFUND only), monthUsed, weeklyData to client
- `CreditsClient.tsx`: ring chart (`available/plan_total`), usage bar chart, top-up packs, transaction table
- Transaction table: Description (icon+title+sub) | Date | Credits | Amount | Status
- **Change Plan modal**: No blur overlay, crown icon, plan icons, colored checkmarks, billing toggle with amber "20% OFF" badge

### Profile (`src/app/(app)/profile/ProfileClient.tsx`)
- Avatar: click camera → file input → `POST /api/upload/avatar` → `POST /api/profile/update`
- Google Connect: `supabase.auth.linkIdentity({ provider: 'google' })` — requires "Allow manual linking" ON in Supabase
- Change password: inline expandable form → `POST /api/profile/change-password`
- Sign out everywhere: POST `/auth/signout` → redirect to `/login`

## Avatar Library
- 67 avatars total: 48 Women + 19 Men, seeded from `men/` and `women/` root folders
- DB stores original PNG `imageUrl`; API computes `thumbnailUrl = imageUrl.replace('.png', '.webp')` for display
- WebP twins uploaded to R2 separately (94-96% smaller); originals used for generation
- Avatar modal uses `thumbnailUrl || imageUrl` for display

## Photoshoot Templates
- 150 templates across categories, seeded with prompts
- Template prompt server-only — never sent to client
- `[product]` placeholder in prompts → replaced with "the product in the reference image" at generation time

## Model Logos (`public/models/`)
- `seedance-2.webp` — ByteDance logo (used for Seedance 2, Seedream 4.5, Seedream 5 Lite)
- `sora-2.webp` — OpenAI Sora logo
- `veo-3.webp` — Google Veo logo
- `kling-3.webp` — Kling logo
- `nano-banana-2.webp` — from SVG, 128×128
- `flux-2-pro.webp`, `gpt-image-2.webp`, `seedream-4-5.webp`, `seedream-5-lite.webp`

## Environment Variables
- `POYO_API_KEY` — Poyo AI API key (regenerate; was shared in chat)
- All other keys: Supabase, DATABASE_URL, FAL_KEY, INNGEST keys, R2 keys, Razorpay keys

## Known Patterns
- File uploads: `fileInputRef` + `onChange` + `FormData` → API route → R2
- Drag-and-drop: `onDragOver/onDragLeave/onDrop` on card div, `isDragging` state for outline style
- Hero image preloading: call `preload(src, { as: "image" })` from `react-dom` at top of component function (runs during SSR, injects `<link rel="preload">` before JS loads)
- Modal visibility: dispatch `window.dispatchEvent(new CustomEvent("app:modal-open"))` on open, `app:modal-close` on close
- Supabase client-side: `import { createClient } from "@/lib/supabase/client"`
- Supabase server-side: `import { createClient } from "@/lib/supabase/server"`
- Git commit then `vercel --prod` to deploy
- PowerShell: `git add "src/app/(app)/..."` — must quote paths containing parentheses
