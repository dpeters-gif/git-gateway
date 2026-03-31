---
document: constitution
project: "Familienzentrale"
version: 2.0.0
status: Draft
last-updated: "2026-03-31"
build-mode: Production
builder-tool: Lovable
supersedes: constitution.md v1.0.0, constitution-amendment-v1.1.md, constitution-amendment-v1.2.md (draft)
---

# Project Constitution v2

> This document is the architectural DNA of Familienzentrale.
> Every task, prompt, and line of generated code must respect
> these rules. If a rule is unclear, ask. If a rule conflicts
> with a task, the constitution wins.
>
> This is a complete rewrite. All previous constitution versions
> and amendments are superseded by this document.

---

## 1. Stack

### Core Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Builder Tool | Lovable | — | Primary build tool. Generates React + TypeScript + Supabase. GitHub sync. |
| Frontend | React | 18.x | SPA, tablet-first (768px primary) |
| UI Components | shadcn/ui | — | Lovable's native component system. All UI primitives. |
| Styling | Tailwind CSS | 3.x | Full usage — colors, typography, spacing, layout. Custom config with design tokens. |
| Animation | Framer Motion | 11.x | All transitions, micro-interactions, gamification animations |
| State management | TanStack Query | 5.x | Server state via Supabase client |
| Routing | React Router | 7.x | Client-side routing |
| Backend | Supabase | — | PostgreSQL, Auth, Edge Functions, Storage, Realtime |
| Database | PostgreSQL (Supabase) | 15.x | Managed. Migrations via Supabase dashboard or CLI. |
| Query Layer | Supabase JS Client | 2.x | All DB access. RLS enforces access control. |
| Server Logic | Supabase Edge Functions | Deno | Complex business logic requiring atomicity or server-side secrets |
| Auth (Adults) | Supabase Auth | — | Email + password. Magic link optional future. |
| Auth (Children) | Custom Edge Function | — | Username + PIN verification. Separate from Supabase Auth. |
| Storage | Supabase Storage | — | Photo proof, avatar images, board note images |
| Realtime | Supabase Realtime | — | Shopping list sync, notification delivery |
| Validation | Zod | 3.x | Client + Edge Function validation |
| Forms | React Hook Form + Zod | — | All forms |
| i18n | react-i18next | 16.x | DE primary, EN secondary |
| Sound | Web Audio API (native) | — | Procedural sound generation via SoundEngine service |
| Calendar UI | Custom components | — | Built with Tailwind + Framer Motion. No third-party calendar. |
| Date Pickers | shadcn/ui date picker | — | Uses react-day-picker under the hood |
| Charts | recharts | — | Progress visualizations, care-share, weekly recap |
| Icons | lucide-react | — | Primary icon set |
| Font | DM Sans | — | Google Fonts. All weights 400-800. |
| PWA | Service Worker + Manifest | — | Installable, offline shell |
| Native Wrapper | Capacitor | 6.x | iOS/Android when app store distribution needed |
| AI | Anthropic Claude API | — | Task suggestions (P-12), email parsing (P-14). Called from Edge Functions only. |

### Approved Libraries

```
framer-motion           — All animation
zod                     — Validation (shared client/Edge Function)
react-hook-form         — Form management
@tanstack/react-query   — Server state
react-router-dom        — Routing
react-i18next + i18next — Internationalization
recharts                — Charts and data visualization
lucide-react            — Icons
date-fns                — Date formatting and manipulation
react-day-picker        — Date picker (used by shadcn)
@supabase/supabase-js   — All Supabase interaction
@dnd-kit/core           — Drag and drop (calendar, lists)
@dnd-kit/sortable       — Sortable lists (routines, shopping)
@capacitor/core         — Native wrapper (when needed)
@capacitor/cli          — Native build tooling
@capacitor/push-notifications — Native push
@capacitor/haptics      — Haptic feedback
@capacitor/camera       — Photo proof camera access
sonner                  — Toast notifications (Lovable default)
```

### Forbidden Libraries

```
- All @mui/* packages — replaced by shadcn/ui
- @radix-ui/* (direct usage) — use via shadcn/ui only
- Any third-party calendar library (FullCalendar, react-big-calendar, Mobiscroll)
- Any alternative animation library (react-spring, GSAP)
- Any server framework (Express, Fastify, Hono) — Supabase Edge Functions only
- Any ORM (Drizzle, Prisma, TypeORM) — Supabase JS Client only
- Any alternative auth (passport, next-auth) — Supabase Auth only
- moment.js — replaced by date-fns
- jQuery
```

### Tailwind Configuration

Tailwind is configured with the Familienzentrale design tokens.
The `tailwind.config.ts` must extend (not replace) with:

```typescript
// Key color tokens (see design-tokens.md for complete list)
colors: {
  primary: { DEFAULT: '#4E6E5D', hover: '#3A5446', light: '#EEF2EE', surface: 'rgba(78,110,93,0.08)' },
  secondary: { DEFAULT: '#C67B5C', hover: '#8B5640', light: '#FBF0EA' },
  accent: { DEFAULT: '#D4943A', hover: '#B07820', light: '#FDF5E6' },
  background: { DEFAULT: '#FBF7F0', surface: '#FFFCF7', subtle: '#F3EDE4' },
  child: { bg: '#FFF8EB', surface: '#FFFFFF', accent: '#FF6B35', 'accent-hover': '#E55A2B' },
  xp: { DEFAULT: '#FFB020', light: 'rgba(255,176,32,0.15)' },
  streak: { DEFAULT: '#FF6B35', light: 'rgba(255,107,53,0.12)' },
  'level-up': { DEFAULT: '#7C4DFF', light: 'rgba(124,77,255,0.12)' },
  challenge: { DEFAULT: '#00BFA5', light: 'rgba(0,191,165,0.12)' },
  gold: { DEFAULT: '#FFD700' },
  drop: { DEFAULT: '#E040FB' },
  // ... see design-tokens.md for full palette
},
fontFamily: {
  sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'monospace'],
},
```

---

## 2. Architecture

### Layer Model

```
┌─────────────────────────────────────────┐
│  React SPA (Lovable-generated)          │
│  shadcn/ui + Tailwind + Framer Motion   │
├─────────────────────────────────────────┤
│  Supabase JS Client                     │
│  (queries, auth, storage, realtime)     │
├────────────┬────────────────────────────┤
│  Supabase  │  Supabase Edge Functions   │
│  PostgreSQL│  (Deno/TypeScript)         │
│  + RLS     │  - Gamification engine     │
│            │  - Child auth              │
│            │  - AI calls (Claude API)   │
│            │  - Email processing        │
│            │  - Scheduled jobs          │
├────────────┴────────────────────────────┤
│  Supabase Storage  │  Supabase Realtime │
│  (photos, images)  │  (live sync)       │
└────────────────────┴────────────────────┘
```

### Where Logic Lives

| Logic type | Location | Examples |
|---|---|---|
| Simple CRUD | Frontend → Supabase client + RLS | Create event, update task title, fetch members |
| Display logic | Frontend React components | Week matrix, animation sequences, role-based UI |
| Gamification transaction | Edge Function `complete-task` | XP + Gold + drops + streak + creature + badges (atomic) |
| AI calls | Edge Function `ai-suggestions`, `email-to-calendar` | Claude API for task suggestions and email parsing |
| Scheduled jobs | Edge Function + pg_cron | Nudge evaluation, routine generation, weekly recap |
| Auth (adults) | Supabase Auth | Email + password signup/login |
| Auth (children) | Edge Function `child-auth` | Username + PIN verification (custom) |
| File uploads | Frontend → Supabase Storage | Photo proof, board note images |
| Real-time sync | Supabase Realtime subscriptions | Shopping list, notifications, calendar changes |

### Absolute Rules

- The frontend NEVER writes raw SQL or calls database functions directly — always via Supabase client or Edge Functions
- ALL tables have Row Level Security (RLS) policies — no table is accessible without a policy
- Edge Functions are used when: (a) multiple tables update atomically, (b) server-side randomness needed, (c) external API called, (d) logic must not be bypassable
- All real-time features use Supabase Realtime subscriptions, NOT polling
- Supabase client is initialized once in a shared module and imported everywhere
- Edge Functions use Deno and can import from `https://esm.sh/` for dependencies

### Folder Structure

```
project-root/
├─ .sdd/
│  ├─ constitution.md              # This file
│  ├─ agents.md                    # Lovable builder instructions
│  ├─ specs/                       # One spec per journey
│  │  ├─ P-1-parent-weekly-overview.md
│  │  ├─ P-2-add-adjust-plans.md
│  │  ├─ ...
│  │  ├─ P-14-ai-email-to-calendar.md
│  │  ├─ C-1-child-daily-experience.md
│  │  ├─ ...
│  │  ├─ S-1-onboarding.md
│  │  ├─ S-3-ENHANCED-gamification-animation.md
│  │  ├─ S-5-grandparent-view.md
│  │  └─ M-1-monetization.md
│  └─ tasks.md                     # Build task list
│
├─ docs/
│  ├─ design-constraints.md
│  ├─ design-tokens.md
│  ├─ api-contracts.md             # Supabase RPC + Edge Function contracts
│  └─ lovable-builder-prompt.md    # Master prompt for Lovable
│
├─ src/                            # Lovable-generated React app
│  ├─ components/
│  │  ├─ calendar/                 # WeekMatrix, DayView, MonthGrid, TimeBlockBand
│  │  ├─ gamification/             # XPBar, StreakCard, CreatureDisplay, DopamineLoop
│  │  ├─ forms/                    # TaskForm, EventForm, RoutineForm
│  │  ├─ layout/                   # AppShell, BottomNav, DesktopSidebar, FAB
│  │  └─ ui/                       # shadcn/ui primitives (auto-generated)
│  │
│  ├─ pages/
│  │  ├─ parent/                   # Home, Calendar, Tasks, Rewards, Settings
│  │  ├─ child/                    # MyDay, Quests, Progress, Rewards
│  │  ├─ auth/                     # Login, Signup
│  │  └─ onboarding/               # Onboarding steps
│  │
│  ├─ hooks/                       # useAuth, useFamily, useGamification, etc.
│  ├─ services/                    # soundEngine.ts, supabase query wrappers
│  ├─ lib/                         # Constants, utilities, Zod schemas, types
│  ├─ i18n/                        # de.json, en.json
│  └─ integrations/
│     └─ supabase/
│        ├─ client.ts              # Supabase client init
│        └─ types.ts               # Generated database types
│
├─ supabase/
│  ├─ functions/                   # Edge Functions (Deno)
│  │  ├─ complete-task/index.ts
│  │  ├─ child-auth/index.ts
│  │  ├─ ai-suggestions/index.ts
│  │  ├─ email-to-calendar/index.ts
│  │  ├─ evaluate-nudges/index.ts
│  │  ├─ generate-routines/index.ts
│  │  ├─ weekly-recap/index.ts
│  │  └─ spend-gold/index.ts
│  │
│  └─ migrations/
│     ├─ 001_core.sql
│     ├─ 002_tasks_routines.sql
│     ├─ 003_events_timeblocks.sql
│     ├─ 004_gamification.sql
│     ├─ 005_new_features.sql
│     ├─ 006_baby_and_subscriptions.sql
│     └─ 007_email_pipeline.sql
│
└─ public/
   ├─ manifest.json                # PWA manifest
   └─ sw.js                        # Service worker
```

### Distribution Model

1. **PWA (primary)** — accessible via URL, installable on home screen. Service worker provides offline shell and asset caching.
2. **Capacitor iOS** — same React app wrapped for App Store. Adds native push, haptics, camera.
3. **Capacitor Android** — same React app wrapped for Play Store.

All three tiers share the same React codebase. Capacitor plugins abstract native APIs behind a unified interface. Feature detection at runtime.

---

## 3. Entity Model

### User Roles

| Role | Auth method | UI | Can create tasks | Can create events | Has gamification |
|------|------------|-----|-----------------|------------------|-----------------|
| `adult` | Supabase Auth (email+password) | Parent UI (sage green) | Yes | Yes | No (tracks family, not self) |
| `child` | Edge Function (username+PIN) | Child UI (orange/honey) | If permitted | If permitted (pending status) | Yes (XP, Gold, streaks, creatures) |
| `baby` | None (no login) | None (managed by parents) | No | No | No |

### Baby Persona

Baby members (age 0-5) are managed entirely by parents:

- **No User record** — babies don't have credentials or login capability
- **FamilyMember record** with `role = 'baby'` and `managed_by_user_id` referencing the primary parent
- **Visible on calendar** — baby gets a color-coded column in the week matrix, can have time blocks (nap, daycare) and events (doctor, milestones)
- **Tasks assigned TO parents** — "Buy diapers for Leo" is assigned to a parent, not the baby
- **Promotable to child** — parent can upgrade baby → child at any time, which creates a User record with username + PIN and enables gamification
- **Appears in family member list** with a distinct avatar (pacifier icon or custom)

### Subscription Tiers

| Entity | Fields |
|---|---|
| `Subscription` | `id`, `family_id`, `tier` (free/family/familyplus), `status` (active/cancelled/expired), `started_at`, `expires_at`, `app_store_product_id` |

Feature gates are enforced both client-side (UI visibility) and server-side (RLS policies + Edge Function checks).

| Feature | Free | Family ($5.99/mo) | Family+ ($9.99/mo) |
|---|---|---|---|
| Calendar + events + tasks | Up to 20 active items | Unlimited | Unlimited |
| Family members | Up to 3 (incl. babies) | Up to 8 | Up to 12 |
| Child quest UI (basic) | XP + streaks only | Full gamification | Full |
| Gold + drops + creatures | No | Yes | Yes |
| Boss battles | No | Yes | Yes |
| Routines + flow mode | No | Yes | Yes |
| Shopping list | 1 list | Multiple | Multiple |
| Family board | 5 notes | Unlimited | Unlimited |
| Google Calendar sync | No | Yes | Yes |
| Push notifications | No | Yes | Yes |
| Smart nudges | No | No | Yes |
| AI task suggestions | No | No | Yes |
| Email-to-calendar AI | No | No | Yes |
| Weekly family recap | No | No | Yes |
| Care-share analytics | No | No | Yes |
| Multi-household | No | No | Yes |
| Photo proof | Yes | Yes | Yes |
| Baby members | Yes | Yes | Yes |

---

## 4. Naming Conventions

### Files & Components

| Type | Convention | Example |
|------|-----------|---------|
| React component | PascalCase | `WeekMatrix.tsx`, `StreakCard.tsx` |
| React page | PascalCase | `ParentHome.tsx`, `ChildMyDay.tsx` |
| Hook | camelCase, `use` prefix | `useAuth.ts`, `useFamily.ts` |
| Service | camelCase | `soundEngine.ts`, `taskService.ts` |
| Utility | camelCase | `dateUtils.ts`, `formatXP.ts` |
| Type/Schema | camelCase file, PascalCase type | `types.ts` → `export type Task = {...}` |
| Supabase Edge Function | kebab-case directory | `complete-task/index.ts` |
| Migration | numbered + snake_case | `001_core.sql` |
| i18n key | dot-separated | `home.weeklyOverview`, `child.quest.complete` |
| CSS class | Tailwind utilities | `bg-primary text-white rounded-lg` |

### Database

| Convention | Example |
|-----------|---------|
| Table names: snake_case plural | `family_members`, `points_ledger` |
| Column names: snake_case | `assigned_to_user_id`, `xp_value` |
| Primary keys: `id` (UUID, default `gen_random_uuid()`) | `id uuid primary key default gen_random_uuid()` |
| Foreign keys: `{entity}_id` | `family_id`, `user_id` |
| Timestamps: `created_at`, `updated_at` | `created_at timestamptz default now()` |
| Enums: defined as PostgreSQL types | `CREATE TYPE member_role AS ENUM ('adult', 'child', 'baby')` |
| Boolean columns: `is_` or `has_` prefix | `is_admin`, `has_photo` |

---

## 5. Code Standards

### General

- No `any` type in TypeScript — use explicit types or `unknown`
- No magic numbers or strings — use named constants
- No `console.log` in committed code — use structured logging or remove
- No commented-out code in committed files
- Maximum file length: 300 lines for page components, 500 lines for services
- If a file exceeds the limit, extract sub-components

### Frontend

- All data fetching via TanStack Query hooks wrapping Supabase client calls
- No business logic in components — components render, hooks and services compute
- All forms use React Hook Form + Zod
- All lists that can be empty must handle the empty state
- All async operations must handle loading and error states
- All animations use Framer Motion — no CSS transitions for interactive elements
- All colors reference Tailwind config tokens — no hardcoded hex in components
- All text uses semantic Tailwind classes (`text-primary`, `font-semibold`) — no arbitrary values
- Every user-facing string wrapped in `t()` for i18n
- Components exceeding 150 lines must split into sub-components

### Interaction Defaults (MANDATORY)

These apply to EVERY screen unless explicitly excluded by a spec:

- **Every list item is tappable/clickable** — opens detail or triggers action
- **Every card supports inline primary action** — task cards have a completion checkbox, event cards show time, board notes show full text
- **Drag-and-drop enabled** on all reorderable content (calendar items, routine steps, shopping list items)
- **FAB (Floating Action Button) visible on every page** except onboarding and full-screen modals. FAB opens quick-create menu: Task, Event, Routine, Board Note.
- **Animations on every state change** — items entering (slideUp), leaving (fadeOut), completing (the dopamine loop), erroring (shake). No state change is silent.
- **Swipe gestures on mobile** — day navigation (left/right), item dismissal where appropriate
- **Pull-to-refresh** on all list/calendar views
- **Skeleton loaders** matching content shape during loading — never a spinner in isolation
- **Optimistic updates** on all mutations — UI updates immediately, rolls back on error
- **Undo support** on destructive actions (delete, complete, move) via toast with undo button (5 second window)
- **Haptic feedback** on task completion, level-up, and primary CTA taps (via Capacitor when available)

### Backend (Edge Functions)

- All Edge Functions validate input with Zod before processing
- All Edge Functions verify the requesting user's identity and family membership
- All error responses follow: `{ error: { code: string, message: string } }`
- No business logic in direct Supabase client calls from the frontend — complex logic lives in Edge Functions
- All Edge Functions that modify multiple tables use database transactions
- Edge Functions use `Deno.serve()` pattern with JSON request/response

### Sound System

- All gamification sounds use the SoundEngine service (`src/services/soundEngine.ts`)
- Sound playback must never block or delay visual animations
- All sounds toggleable via Settings (default: ON at 70% volume)
- Sounds respect device silent/mute mode
- Sounds use pitch randomization (±2 semitones) on repetitive triggers
- Total procedural sound code under 100KB
- Sound functions: `playComplete()`, `playXPAward()`, `playGoldDrop()`, `playLevelUp()`, `playStreakFire()`, `playStreakMilestone()`, `playDropChest()`, `playDropOpen()`, `playBadgeEarn()`, `playBossHit()`, `playBossDefeat()`, `playError()`, `playFlowStep()`, `playFlowDone()`

---

## 6. Security

### All Builds

- No API keys, tokens, or secrets in frontend code or version control
- Supabase anon key is the only key in frontend code (this is safe — RLS enforces access)
- Supabase service role key lives ONLY in Edge Functions environment variables
- All database tables have RLS policies — a table without RLS is a security hole
- No raw user input rendered as HTML (XSS prevention)
- All form inputs have type constraints and length limits
- Error responses do not expose stack traces or internal structure
- Session/auth tokens managed by Supabase Auth — no custom cookie handling for adults
- Child auth tokens managed by Edge Function — short-lived JWTs stored in secure httpOnly cookies or Supabase custom claims

### Data Access Rules

- Adults can read/write all family data for their own family
- Children can read family data but write only their own tasks/events (with permissions)
- Baby members have no auth — their data is managed through adult endpoints
- Cross-family data access is impossible (RLS policies enforce `family_id = auth.family_id()`)
- XP ledger is append-only — no UPDATE or DELETE on `points_ledger` rows
- Gold balance derived from ledger — never stored as a mutable counter
- Password requirements: minimum 8 characters, one uppercase, one lowercase, one digit
- Child PIN requirements: exactly 4 digits

### Supabase-Specific

- RLS policies use `auth.uid()` for adult auth and custom claims for child auth
- Storage buckets have access policies matching their content type (photo-proof bucket = family members only)
- Edge Function secrets set via Supabase Dashboard — never in code
- Database connections use Supabase's built-in pooling — no custom connection management
- Realtime subscriptions filtered by family_id — children only receive their family's events

---

## 7. Testing Standards

### Production Requirements

- Manual journey verification against specs for all 24 journeys
- All four states (loading, empty, error, success) verified per screen
- Zero console errors in normal operation at 768px tablet AND 375px phone
- All Supabase RLS policies tested: unauthenticated → denied, wrong family → denied, correct family → allowed
- Role enforcement tested: adult-only Edge Functions reject child tokens
- XP/level calculations verified with boundary values (level-up thresholds)
- Streak logic verified across timezone boundaries
- Gamification transaction verified: XP + Gold + drops + streak + creature + badges all update atomically
- Calendar drag-and-drop verified: move, undo, cross-person reassignment
- Shopping list real-time sync verified across two devices
- Onboarding flow verified: baby + child creation, school time blocks, first task, creature egg

---

## 8. Gates

### Simplicity Gate

Before introducing any new module, file, or abstraction layer:
**Question:** "Is this new module justified by the spec?"
If NO → do not create it.

### Anti-Abstraction Gate

Before creating any custom implementation:
**Question:** "Why not use shadcn/ui, Tailwind, Framer Motion, or an approved library?"
If no clear answer → use the primitive.

### New Dependency Gate

Before adding any npm package not in Approved Libraries:
1. What does it do?
2. Why can't an approved library do it?
3. Is the license MIT-compatible?
4. Wait for PM approval.

### Schema Change Gate

Before any database schema modification:
1. Is this change reflected in a spec?
2. Is the migration reversible?
3. Has RLS been updated for new tables/columns?
4. Wait for PM approval.

### Feature Gate

Before implementing any feature:
**Question:** "Which subscription tier does this require?"
Implement the client-side gate (hide UI element) AND server-side gate (RLS policy or Edge Function check).

---

## 9. Boundaries

### Always Do (no approval needed)

- Follow naming conventions from Section 4
- Run TypeScript type check before committing
- Handle loading, empty, error, and success states on every screen
- Use shadcn/ui for all UI primitives
- Use Framer Motion for all interactive animations
- Use Tailwind config tokens for all colors and typography
- Wrap all user-facing strings in `t()` for i18n
- Validate all inputs with Zod (client-side and Edge Functions)
- Implement all Interaction Defaults from Section 5
- Ensure FAB is accessible on every page
- Include drag-and-drop on all calendar and list views
- Add skeleton loaders for all async content
- Keep page components under 300 lines

### Ask First (PM approval required)

- Change database schema beyond what's in a spec
- Add new dependency not in Approved Libraries
- Add new Edge Function not in the API contracts
- Change auth logic or session handling
- Change Tailwind config tokens
- Change folder structure
- Add new environment variable
- Change subscription tier feature gates

### Never Do (refuse and escalate)

- Bypass RLS or auth checks
- Log PII or secrets
- Delete migration files
- Introduce a new UI component library
- Use MUI, Radix directly, or any removed library
- Disable TypeScript strict mode
- Hardcode environment-specific values
- Commit secrets or API keys
- Use `any` type
- Skip error/loading/empty states
- Put business logic in React components
- Make XP ledger entries mutable (UPDATE/DELETE)
- Allow child accounts to access adult-only Edge Functions
- Deploy without RLS on every table
- Skip animations on state changes
- Build a screen without the FAB
- Leave a list item non-clickable
- Use a spinner instead of a skeleton loader

---

## 10. Lovable-Specific Rules

- Lovable generates the project structure — adapt to its conventions where they don't violate this constitution
- Lovable's Supabase integration layer (`src/integrations/supabase/`) is auto-generated — do not manually edit `types.ts` (regenerate from schema)
- Use Lovable's built-in Supabase connection — do not create a separate client
- When Lovable's generated code violates a constitution rule, override it with a follow-up prompt specifying the exact rule
- Lovable's toast system uses `sonner` — use this for all toast notifications
- When Lovable generates a page, always verify: (a) FAB present, (b) all four states handled, (c) animations on transitions, (d) skeleton loaders on async content, (e) responsive at 768px AND 375px
- GitHub sync: commit after each completed journey with message `feat: [JOURNEY-ID] [description]`

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial constitution (Replit/Express/MUI) | PM + VEGA |
| 1.1.0 | 2026-03-30 | Mobiscroll removal, PWA, sound, gold, assets | PM + VEGA |
| 2.0.0 | 2026-03-31 | Complete rewrite for Lovable/Supabase/shadcn. Added baby persona, subscription model, interaction defaults, warmer palette. | PM + Atlas |
