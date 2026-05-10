<div align="center">

# ugc [▲](https://ugcads.us) ads

**AI-powered ad generation — UGC videos, product photos, and try-on models in minutes.**

[![Next.js](https://img.shields.io/badge/Next.js_16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma_6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase_Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000?style=flat-square&logo=vercel)](https://ugcads.us)

[**Live Site →**](https://ugcads.us) &nbsp;·&nbsp; [**App Dashboard**](https://ugcads.us/dashboard) &nbsp;·&nbsp; [**Blog**](https://ugcads.us/blog)

</div>

---

## Overview

UGCAds lets brands generate high-converting ad content without agencies or studios. Pick an AI actor, write a script, and get a finished UGC video in under 90 seconds. Run product photoshoots for pennies. Put any garment on any model instantly.

```
Write a script  →  Pick an actor  →  Choose a model  →  Download your ad
        ↑ under 90 seconds from idea to finished creative ↑
```

---

## Features

<table>
<tr>
<td width="33%" valign="top">

### 🎬 UGC Studio

Generate talking-head video ads with 100+ AI actors.

- **Seedance 2** — lifestyle & beauty, up to 15s
- **Sora 2** — cinematic quality, up to 20s
- **Kling 3.0** — product close-ups, up to 15s
- **Veo 3.1** — crisp motion, up to 8s
- AI script writer built-in
- Custom avatar upload

</td>
<td width="33%" valign="top">

### 📸 Product Photoshoot

Studio-quality product photos without a studio.

- **GPT Image 2** — clean & affordable
- **Flux 2 Pro** — editorial & lifestyle
- **Seedream 4.5 / 5 Lite** — versatile
- **Nano Banana 2** — fast generation
- 150+ scene templates
- AI prompt generation

</td>
<td width="33%" valign="top">

### 👗 AI Try-On

Any garment on any model, instantly.

- 100+ diverse base models
- Tops · Bottoms · Full Body · Outerwear
- Gender & body type filters
- No real-world shoot needed
- 5 credits per generation

</td>
</tr>
</table>

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16.2](https://nextjs.org) — App Router + Turbopack |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Auth** | [Supabase Auth](https://supabase.com) |
| **Database** | PostgreSQL (Supabase) + [Prisma ORM](https://prisma.io) |
| **File Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2) |
| **Payments** | [Razorpay](https://razorpay.com) |
| **AI Generation** | [Poyo API](https://poyo.ai) — video + image models |
| **Background Jobs** | [Inngest](https://inngest.com) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## Project Structure

```
ugcads/
├── prisma/
│   └── schema.prisma             # User · Subscription · Generation · BlogPost · …
├── public/
│   └── models/                   # AI model logos (Seedance, Sora, Veo, Kling, …)
├── scripts/
│   └── seed-blogs.ts             # Seed blog posts
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Public pages — landing, blog, pricing, contact
│   │   ├── (app)/                # Auth-gated app — studio, history, credits, profile
│   │   └── (admin)/              # Admin console — users, gens, blog, support, revenue
│   ├── components/
│   │   ├── app/                  # App UI — Sidebar, SupportWidget, OnboardingModal, …
│   │   ├── landing/              # Marketing UI — Navbar, Footer, Pricing, ComparisonTable, …
│   │   └── ui/                   # Shared primitives
│   └── lib/
│       ├── pricing.ts            # ← Single source of truth for all plan prices & features
│       ├── credits.ts            # Credit cost constants per generation type
│       ├── poyo.ts               # Poyo AI API client (submit + poll)
│       └── r2.ts                 # Cloudflare R2 upload helper
```

---

## Pricing

| Plan | Price | Credits | UGC Videos | Product Photos | Try-On |
|---|:---:|:---:|:---:|:---:|:---:|
| **Starter** | $5 one-time | 25 | 1 | 25 | 8 |
| **Basic** | $39 / mo | 100 / mo | 5 / mo | 100 / mo | 33 / mo |
| **Creator** ⭐ | $79 / mo | 300 / mo | 15 / mo | 300 / mo | 100 / mo |
| **Agency** | $129 / mo | 500 / mo | 25 / mo | 500 / mo | 166 / mo |

> Yearly billing saves **20%** on all subscription plans. All pricing constants live in [`src/lib/pricing.ts`](src/lib/pricing.ts) — edit once, updates everywhere.

---

---

## Credits System

Credits are the in-app currency. Plans grant a monthly allocation; users can also buy top-up packs.

| Generation Type | Credit Cost |
|---|:---:|
| UGC video (5 s) | 15 credits |
| Product photo (GPT Image 2) | 3 credits |
| Product photo (standard models) | 5 credits |
| Product photo (Flux 2 Pro) | 6 credits |
| AI Try-On | 5 credits |

New users receive **30 free credits** on signup. First-time users without a plan are shown a hard-gate onboarding modal.

---

## Admin Console

Access at `/admin` — requires `role = ADMIN` on the user record.

| Section | Capability |
|---|---|
| **Overview** | Live platform stats |
| **Users** | Browse accounts, inspect subscriptions & credits |
| **Generations** | Monitor all jobs, statuses, provider info, errors |
| **Refunds** | Issue credit refunds for failed generations |
| **Support** | Reply to user tickets in real time |
| **UGC Avatars** | Add / remove / reorder AI actors |
| **Photoshoot Templates** | Manage the 150+ scene templates |
| **Try-On Models** | Manage base model library |
| **Revenue** | Transaction history and totals |
| **Grant Credits** | Manually top up any user's balance |
| **Blog** | Full CRUD editor — title, slug, content, publish/feature toggles |

---

---

## Contributing

1. Fork the repo and create your branch: `git checkout -b feat/your-feature`
2. Commit your changes: `git commit -m 'feat: add your feature'`
3. Push the branch: `git push origin feat/your-feature`
4. Open a pull request

Please keep PRs focused — one feature or fix per PR.

---

<div align="center">

Built by [pratxf](https://github.com/pratxf) &nbsp;·&nbsp; [ugcads.us](https://ugcads.us) &nbsp;·&nbsp; [mehhprat@gmail.com](mailto:mehhprat@gmail.com)

</div>
