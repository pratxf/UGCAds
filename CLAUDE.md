@AGENTS.md

# Project State — UGCAds (as of May 11, 2026)

## Recent Changes (May 11, 2026)
- `ChangePlanModal` width widened to `max-w-5xl`
- Billing toggle active pill fixed to blue (`bg-[#2563EB] text-white`) in both `ChangePlanModal` and `OnboardingModal`
- "20% OFF" badge: white text + frosted bg when Yearly active (blue), amber `#FEF3C7`/`#92400E` when inactive
- `SupportWidget` fully redesigned to Intercom-style (two-view: home + conversation, gradient header)
- `@anthropic-ai/sdk` uninstalled — was unused after Poyo migration
- `.gitignore` now includes `.claude`
- `README.md` rewritten as comprehensive project README
- All 130 git commits rewritten to author `pratxf <mehhprat@gmail.com>`
- Git remote: `https://github.com/pratxf/UGCAds.git`

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
- All other keys: Supabase, DATABASE_URL, INNGEST keys, R2 keys, Razorpay keys
- `@anthropic-ai/sdk` was uninstalled — it was unused after Poyo API migration, do NOT re-add it

## Known Patterns
- File uploads: `fileInputRef` + `onChange` + `FormData` → API route → R2
- Drag-and-drop: `onDragOver/onDragLeave/onDrop` on card div, `isDragging` state for outline style
- Hero image preloading: call `preload(src, { as: "image" })` from `react-dom` at top of component function (runs during SSR, injects `<link rel="preload">` before JS loads)
- Modal visibility: dispatch `window.dispatchEvent(new CustomEvent("app:modal-open"))` on open, `app:modal-close` on close
- Supabase client-side: `import { createClient } from "@/lib/supabase/client"`
- Supabase server-side: `import { createClient } from "@/lib/supabase/server"`
- Git commit then `vercel --prod` to deploy
- PowerShell: `git add "src/app/(app)/..."` — must quote paths containing parentheses

## Pricing (`src/lib/pricing.ts`)
Single source of truth for all plan prices — edit once, updates everywhere (OnboardingModal, ChangePlanModal, landing Pricing component, admin pricing page).
- `STARTER_PLAN` — $5 one-time, 25 credits
- `SUBSCRIPTION_PLANS` — Basic $39/mo (100cr), Creator $79/mo (300cr), Agency $129/mo (500cr)
- `TOPUP_PACKS` — 50cr/$30, 100cr/$55, 250cr/$125
- Yearly = 20% off (monthlyPriceUsd × 0.8, rounded); `yearlyAmountCents` stored as full annual total

## ChangePlanModal (`src/components/app/ChangePlanModal.tsx`)
- Width: `max-w-5xl` (widened from max-w-3xl)
- Billing toggle: active pill is blue (`bg-[#2563EB] text-white`) for both Monthly and Yearly buttons
- "20% OFF" badge: white text + `rgba(255,255,255,0.22)` bg when Yearly active; `#FEF3C7` bg + `#92400E` text when inactive
- No blur overlay (uses `bg-black/50` solid overlay)

## OnboardingModal (`src/components/app/OnboardingModal.tsx`)
- Same billing toggle and "20% OFF" badge logic as ChangePlanModal
- Hard-gate shown to users with no plan (`!hasPlan` check in `src/app/(app)/layout.tsx`)

## SupportWidget (`src/components/app/SupportWidget.tsx`)
- Intercom-style floating widget, bottom-right corner
- Width: `w-[400px]`, maxHeight: `min(680px, calc(100vh - 120px))`
- Two views: **home** (branded header + feature rows + CTA) and **conversation** (chat messages + input)
- Header gradient: `linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)`
- `AiAvatar` component: dark rounded square (`#1E1B4B`, `rounded-[10px]`) with white ArrowUpRight icon
- Home view: logo, "Support" title, "Hi there! 👋" greeting, 3 feature rows (UGC Video / Product Photos / AI Try-On), "Start a conversation" CTA, "View pricing" outlined button, "We typically reply in a few minutes" footer
- Conversation view: back arrow + logo header, gray left-aligned bubbles (admin) + gradient right-aligned bubbles (user), paperclip + send input bar, "Powered by UGCads" footer
- Floating button: gradient `linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)`, `boxShadow: "0 8px 24px rgba(79,70,229,0.4)"`

## Support Page (`src/app/(app)/support/page.tsx`)
- Two contact cards: Live chat (opens `LiveChatWidget`) + Email support (`support@ugcads.us`)
- `LiveChatWidget`: fixed bottom-right, `w-360px`, minimizable, agent avatars (E/M/J), simulated reply after 1.2s
- FAQ accordion: 6 questions with icon + AnimatePresence expand/collapse
- Uses framer-motion for FAQ animations (exception to no-framer-motion rule)

## Billing Page (`src/app/(app)/billing/`)
- `BillingClient.tsx`: Plan card + Current usage card (side by side), cancel subscription section, recent invoices
- Cancel flow: confirm step → `cancelled` state (TODO: wire to `/api/billing/cancel`)
- Invoices: credit purchases only (plans + top-ups), download receipt button (UI only)

## Git / Repository
- Remote: `https://github.com/pratxf/UGCAds.git`
- All 130 commits rewritten to author `pratxf <mehhprat@gmail.com>` — no Claude/Anthropic co-author lines
- Local git config: `user.name = pratxf`, `user.email = mehhprat@gmail.com`
- `.gitignore` includes `.claude` — Claude Code internals are never committed
- No mention of Claude/Anthropic anywhere in user-facing code or commit messages
