@AGENTS.md

# Project State — UGCAds (as of May 7, 2026)

## Stack
- Next.js 16.2.1 with Turbopack (has breaking changes — read `node_modules/next/dist/docs/` before writing code)
- Tailwind CSS v4
- Supabase auth + Prisma ORM (PostgreSQL via Supabase)
- Cloudflare R2 for file storage (`uploadToR2` in `src/lib/r2.ts`)
- Razorpay for payments
- fal.ai for AI generation (`FAL_KEY` in .env)
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
- **Profile dropdown**: Custom `createPortal` implementation (NOT using DropdownMenu component — Base UI portal caused layout shift). Uses `useRef` + `getBoundingClientRect` + `position: fixed` rendered to `document.body`
- Credits card shows: bolt icon, credit count (28px bold), progress bar, "X / Y credits used", Upgrade Plan button

## Conditional Orb (`src/components/app/ConditionalOrb.tsx`)
- Shows `GenerationsOrb` only on `/create/ugc-studio`, `/create/product-photoshoot`, `/create/tryon`
- GenerationsOrb is a pill: green dot + count + "Generating"/"Jobs"/"No jobs" + chevron

## Pages Completed

### UGC Studio (`src/app/(app)/create/ugc-studio/page.tsx`)
- "Choose avatar" label (not "Add avatar")
- Custom avatar upload shown as 36px chip in top bar with X to remove
- "Add file" in top-left of input bar
- Textarea fills full height (`flex-1`)
- Character limit: 10,000, counter at bottom
- Avatar modal has "Upload your own avatar" option

### Product Photoshoot (`src/app/(app)/create/product-photoshoot/page.tsx`)
- No tab switcher (removed Templates/Custom tabs)
- "Add file" for product upload in top-left of input
- "Choose template" 3/4 portrait picker on right (like avatar picker)
- TemplateModal: sidebar categories + search + 4-col grid

### AI Try-On (`src/app/(app)/create/tryon/page.tsx`)
- Centered hero layout with fan of shirt icons
- "Add garment" file button in top bar
- 2x2 category grid: Tops, Bottoms, Full Body, Outerwear
- "Choose model" 3/4 portrait picker on right
- ModelModal: gender filter sidebar + search + 5-col portrait grid

### History (`src/app/(app)/history/HistoryClient.tsx`)
- Header: "History" title + search bar
- Inline stats: Total / Complete (blue) / Processing (amber) + sort dropdown
- Filter pills: All | UGC Video | Product Photoshoot | AI Try-On (removed "Product" pill)
- 3-col card grid: 4:3 thumbnail, status badge, play button, processing overlay, type tag pill, date

### Credits (`src/app/(app)/credits/`)
- `page.tsx`: Filters transactions to non-USAGE only; passes type/amountCents/status/time
- `CreditsClient.tsx`: Available credits card (ring chart), usage bar chart, top-up packs, transaction table
- Transaction table columns: Description (icon+title+sub) | Date | Credits | Amount | Status
- **Change Plan modal**: No blur overlay (`bg-black/50`), crown icon header, plan icons (green person/blue star/amber briefcase), colored checkmarks per plan, billing toggle with amber "20% OFF" badge, no footer row

### Profile (`src/app/(app)/profile/ProfileClient.tsx`)
- Avatar: click camera → file input → `POST /api/upload/avatar` → `POST /api/profile/update`
- Save name: `POST /api/profile/update`
- Google Connect: `supabase.auth.linkIdentity({ provider: 'google' })` — requires "Allow manual linking" ON in Supabase dashboard (Authentication → Sign In / Providers)
- Change password: inline expandable form → `POST /api/profile/change-password`
- Sign out everywhere: POST `/auth/signout` → redirect to `/login`

## API Routes Added This Session
- `POST /api/profile/update` — updates name and/or avatar in DB
- `POST /api/profile/change-password` — uses Supabase `updateUser({ password })`

## Marketing Page
- `src/components/landing/HowItWorks.tsx` — How It Works bento grid
  - Card 1 (Step 01): `public/images/howitworks-card1.avif` (UGC Studio screenshot)
  - Card 2 (Step 02): `public/images/howitworks-card2.avif`
  - Card 3 (Step 03): `public/images/howitworks-card3.avif`

## Environment Variables
- `POYO_API_KEY` — added to `.env` (regenerate this key, it was shared in chat)
- All other keys already present: Supabase, DATABASE_URL, FAL_KEY, INNGEST keys, R2 keys, Razorpay keys

## Known Patterns
- File uploads: `fileInputRef` + `onChange` + `FormData` → API route → R2
- No `useDropzone` anywhere (was removed)
- Supabase client-side: `import { createClient } from "@/lib/supabase/client"`
- Supabase server-side: `import { createClient } from "@/lib/supabase/server"`
- Git commit then `vercel --prod` to deploy (PowerShell: quote paths with `(app)` in them)
- PowerShell: `git add "src/app/(app)/..."` — must quote paths containing parentheses
