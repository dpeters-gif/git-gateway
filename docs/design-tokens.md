---
document: design-tokens
project: "Familienzentrale"
version: 2.1.0
status: Draft
last-updated: "2026-04-04"
depends-on:
  - constitution.md v2.0.0
supersedes: design-tokens.md v1.0.0
---

# Design Tokens v2

> Design identity: **Nordic Hearth v2 — Cozy Scandinavian Kitchen**
> Warm linen backgrounds, forest sage primary, terracotta accents,
> amber honey highlights. The palette feels like a sunlit kitchen
> with wooden countertops — not a clinical office.
>
> Combined with Duolingo-level game energy in the child UI:
> bold gold XP, fiery orange streaks, purple level-ups.

---

## 1. Colours

### Brand (Nordic Hearth v2 — warmer)

| Token | Value | Usage |
|-------|-------|-------|
| `color-primary` | `#4E6E5D` | Primary actions, navigation active, adult CTA |
| `color-primary-hover` | `#3A5446` | Hover/pressed state for primary |
| `color-primary-light` | `#EEF2EE` | Primary highlight backgrounds, selected states |
| `color-primary-surface` | `rgba(78,110,93,0.08)` | Subtle hover fills |
| `color-secondary` | `#C67B5C` | Routines, accents, warmth moments, terracotta |
| `color-secondary-hover` | `#8B5640` | Hover for secondary |
| `color-secondary-light` | `#FBF0EA` | Secondary backgrounds |
| `color-accent` | `#D4943A` | Amber honey — warnings, attention, warmth pops |
| `color-accent-hover` | `#B07820` | Hover for accent |
| `color-accent-light` | `#FDF5E6` | Accent backgrounds |

### Gamification (Duolingo-inspired energy)

| Token | Value | Usage |
|-------|-------|-------|
| `color-xp` | `#FFB020` | XP awards, level progress bar, coin feel |
| `color-xp-light` | `rgba(255,176,32,0.15)` | XP bar track, badge background |
| `color-streak` | `#FF6B35` | Streak fire, counter, child CTA |
| `color-streak-light` | `rgba(255,107,53,0.12)` | Streak background |
| `color-level-up` | `#7C4DFF` | Level-up celebration, badge, progression |
| `color-level-up-light` | `rgba(124,77,255,0.12)` | Level-up background |
| `color-challenge` | `#00BFA5` | Active challenges, quest progress |
| `color-challenge-light` | `rgba(0,191,165,0.12)` | Challenge card background |
| `color-badge-gold` | `#FFD700` | Gold badge, coin icon, spending UI |
| `color-badge-silver` | `#C0C0C0` | Silver badge |
| `color-badge-bronze` | `#CD7F32` | Bronze badge |
| `color-leaderboard-1st` | `#FFD700` | 1st place |
| `color-leaderboard-2nd` | `#C0C0C0` | 2nd place |
| `color-leaderboard-3rd` | `#CD7F32` | 3rd place |
| `color-gold-currency` | `#FFD700` | Gold coin icon, balance display |
| `color-drop` | `#E040FB` | Treasure chest glow, drop events |
| `color-boss-hp` | `#E53935` | Boss health bar |
| `color-streak-freeze` | `#4FC3F7` | Ice blue — freeze crystals |

### Semantic (softened for warmth)

| Token | Value | Usage |
|-------|-------|-------|
| `color-success` | `#5D8A5B` | Task completion, available (olive-green) |
| `color-success-light` | `rgba(93,138,91,0.12)` | Success backgrounds |
| `color-warning` | `#D4943A` | Due soon, pending (honey amber) |
| `color-warning-light` | `rgba(212,148,58,0.12)` | Warning backgrounds |
| `color-error` | `#C25B4E` | Overdue, errors, high priority (clay red) |
| `color-error-light` | `rgba(194,91,78,0.12)` | Error backgrounds |
| `color-info` | `#5B8A9B` | Events, calendar items, informational |
| `color-info-light` | `rgba(91,138,155,0.12)` | Info backgrounds |

### Time Block Colours (warm overlays)

| Token | Value | Usage |
|-------|-------|-------|
| `color-block-school` | `rgba(91,138,155,0.12)` | School time block band |
| `color-block-school-border` | `#5B8A9B` | School block left accent |
| `color-block-work` | `rgba(78,110,93,0.10)` | Work time block band |
| `color-block-work-border` | `#4E6E5D` | Work block left accent |
| `color-block-nap` | `rgba(198,123,92,0.10)` | Baby nap/daycare band |
| `color-block-nap-border` | `#C67B5C` | Nap block left accent |
| `color-block-unavailable` | `rgba(155,168,159,0.10)` | Generic unavailability |
| `color-block-unavailable-border` | `#9BA89F` | Unavailable left accent |
| `color-block-routine` | `rgba(162,92,72,0.12)` | Routine task time block band |
| `color-block-routine-border` | `#A25C48` | Routine block left accent (terracotta) |

### Priority Accents (left-border system)

| Token | Value | Usage |
|-------|-------|-------|
| `color-priority-high` | `#C25B4E` | Left border on high-priority cards |
| `color-priority-normal` | `#4E6E5D` | Left border on normal-priority cards |
| `color-priority-low` | `#9BA89F` | Left border on low-priority cards |

### Neutrals (warm linen base)

| Token | Value | Usage |
|-------|-------|-------|
| `color-background` | `#FBF7F0` | Page background — warm linen |
| `color-surface` | `#FFFCF7` | Card/panel backgrounds — soft cream |
| `color-surface-subtle` | `#F3EDE4` | Subtle section backgrounds |
| `color-border` | `rgba(45,50,41,0.08)` | Default borders, dividers |
| `color-border-hover` | `rgba(45,50,41,0.15)` | Borders on hover |
| `color-border-strong` | `rgba(45,50,41,0.22)` | Emphasis borders |
| `color-text-primary` | `#2D3229` | Primary text — warm charcoal |
| `color-text-secondary` | `#6B7264` | Secondary text, labels |
| `color-text-disabled` | `#9BA89F` | Disabled text |
| `color-text-inverse` | `#FFFFFF` | Text on dark backgrounds |

### Child UI Palette

| Token | Value | Usage |
|-------|-------|-------|
| `color-child-bg` | `#FFF8EB` | Child view background — honey tint |
| `color-child-surface` | `#FFFFFF` | Child card backgrounds |
| `color-child-accent` | `#FF6B35` | Child CTA buttons — NOT sage green |
| `color-child-accent-hover` | `#E55A2B` | Child CTA hover |

---

## 2. Typography

### Font Family

| Token | Value |
|-------|-------|
| `font-family-base` | `'DM Sans', system-ui, -apple-system, sans-serif` |
| `font-family-display` | `'DM Sans', system-ui, sans-serif` (weight 800 for display) |
| `font-family-mono` | `'JetBrains Mono', monospace` |

### Font Sizes (mobile-first)

| Token | Value | Usage |
|-------|-------|-------|
| `font-size-xs` | `0.6875rem` (11px) | Captions, metadata, timestamps |
| `font-size-sm` | `0.8125rem` (13px) | Secondary text, chip labels |
| `font-size-base` | `0.9375rem` (15px) | Body text, form inputs |
| `font-size-md` | `1.0625rem` (17px) | Subheadings, card titles |
| `font-size-lg` | `1.25rem` (20px) | Section headings |
| `font-size-xl` | `1.5rem` (24px) | Page titles |
| `font-size-xxl` | `2rem` (32px) | Hero numbers (XP, level) |
| `font-size-display` | `2.5rem` (40px) | Celebration numbers (level-up, milestone) |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `font-weight-normal` | 400 | Body text |
| `font-weight-medium` | 500 | Labels, metadata |
| `font-weight-semibold` | 600 | Subheadings, button text, card titles |
| `font-weight-bold` | 700 | Page titles, emphasis |
| `font-weight-extrabold` | 800 | Display numbers (XP, levels), section headers |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `line-height-tight` | 1.2 | Headings, display numbers |
| `line-height-snug` | 1.35 | Subheadings, card titles |
| `line-height-base` | 1.5 | Body text |
| `line-height-relaxed` | 1.6 | Long-form content |

---

## 3. Spacing

> Base unit: 4px. Use multiples only.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon-to-text gap, tight gaps |
| `space-2` | 8px | Inline gaps, compact padding |
| `space-3` | 12px | Default input padding, chip padding |
| `space-4` | 16px | Standard gap, card inner padding (mobile) |
| `space-5` | 20px | Card inner padding (desktop), section spacing |
| `space-6` | 24px | Page content side padding (mobile) |
| `space-8` | 32px | Large section gaps |
| `space-10` | 40px | Major section dividers |
| `space-12` | 48px | Page-level vertical spacing |
| `space-16` | 64px | Bottom nav clearance |

---

## 4. Borders & Radii

| Token | Value | Usage |
|-------|-------|-------|
| `border-width` | 1px | Default border |
| `border-width-accent` | 3px | Left-border priority/type accent on cards |
| `border-radius-sm` | 8px | Chips, small buttons, inputs |
| `border-radius-md` | 12px | Cards, dialogs, standard containers |
| `border-radius-lg` | 16px | Large panels, bottom sheets |
| `border-radius-xl` | 20px | Modal dialogs, celebration overlays |
| `border-radius-full` | 9999px | Pills, avatars, circular buttons |

---

## 5. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-none` | none | Flat cards (default state) |
| `shadow-sm` | `0 1px 3px rgba(45,50,41,0.06)` | Subtle lift (cards at rest) |
| `shadow-md` | `0 4px 12px rgba(45,50,41,0.08)` | Cards on hover, dropdowns |
| `shadow-lg` | `0 8px 24px rgba(45,50,41,0.12)` | Floating elements, bottom sheets |
| `shadow-xl` | `0 20px 40px rgba(45,50,41,0.15)` | Modals, celebration overlays |
| `shadow-glow-xp` | `0 0 20px rgba(255,176,32,0.3)` | XP award glow |
| `shadow-glow-streak` | `0 0 16px rgba(255,107,53,0.25)` | Streak fire glow |
| `shadow-glow-levelup` | `0 0 30px rgba(124,77,255,0.3)` | Level-up celebration glow |

---

## 6. Component Dimensions

| Token | Value | Usage |
|-------|-------|-------|
| `height-input` | 48px | Text inputs, selects |
| `height-button` | 48px | Standard buttons |
| `height-button-sm` | 36px | Compact buttons (inside cards) |
| `height-button-lg` | 56px | Large CTA buttons |
| `height-bottom-nav` | 64px | Bottom navigation bar |
| `height-app-bar` | 56px | Top app bar |
| `height-table-row` | 56px | List item rows |
| `height-calendar-chip` | 32px | Calendar event chips |
| `height-xp-bar` | 12px | XP progress bar |
| `height-streak-badge` | 40px | Streak counter badge |
| `width-sidebar` | 240px | Desktop sidebar (expanded) |
| `width-sidebar-collapsed` | 72px | Desktop sidebar (collapsed) |
| `width-form-max` | 640px | Maximum form width |
| `width-content-max` | 960px | Maximum content width on tablet |
| `size-icon-sm` | 16px | Small inline icons |
| `size-icon-md` | 20px | Standard icons |
| `size-icon-lg` | 24px | Large icons, navigation |
| `size-icon-xl` | 32px | Feature icons, gamification |
| `size-avatar` | 40px | User avatars |
| `size-avatar-sm` | 28px | Compact avatar (leaderboard) |
| `size-avatar-lg` | 56px | Profile, child welcome |
| `size-badge` | 48px | Achievement badge icon |
| `size-touch-target` | 44px | Minimum touch/click target |
| `size-fab` | 56px | Floating action button |

---

## 7. Breakpoints

| Token | Value | Usage |
|-------|-------|-------|
| `breakpoint-phone` | 375px | Minimum supported width |
| `breakpoint-phone-max` | 767px | Phone range upper bound |
| `breakpoint-tablet` | 768px | PRIMARY design target (iPad portrait) |
| `breakpoint-tablet-landscape` | 1024px | iPad landscape |
| `breakpoint-desktop` | 1280px | Desktop — sidebar replaces bottom nav |

---

## 8. Animation Tokens

### Timing Presets

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `anim-instant` | 100ms | ease-out | Micro-feedback (button press) |
| `anim-fast` | 200ms | ease-out | State toggles, checkbox, small reveals |
| `anim-normal` | 300ms | ease-in-out | Card transitions, page elements |
| `anim-slow` | 500ms | ease-in-out | Progress bars, large reveals |
| `anim-celebration` | 800ms | spring(1, 80, 10) | Level-up, badge earn, milestone |

### Framer Motion Named Presets

| Preset | Properties | Usage |
|--------|-----------|-------|
| `fadeIn` | opacity 0→1, 300ms | Default entrance for content sections |
| `slideUp` | y: 20→0, opacity 0→1, 300ms | Card entrance, list items |
| `slideInRight` | x: 30→0, opacity 0→1, 250ms | Page transitions (entering) |
| `scaleIn` | scale: 0.95→1, opacity 0→1, 200ms | Dialogs, popovers |
| `popIn` | scale: 0→1, spring(300, 20) | XP badge, gold coin appearance |
| `bounceIn` | scale: 0→1.1→1, spring(400, 15) | Level-up number, achievement |
| `progressFill` | scaleX: 0→target, 500ms ease-out | XP bar, challenge progress |
| `shake` | x: [-4, 4, -4, 4, 0], 300ms | Error state, streak warning |
| `pulse` | scale: [1, 1.05, 1], 400ms | Card highlight on completion |
| `glow` | boxShadow cycle, 600ms | XP award moment |
| `confetti` | Custom particles, 1200ms | Level-up celebration overlay |
| `slideDown` | y: -10→0, opacity 0→1, 200ms | Dropdown menus |
| `fadeOut` | opacity 1→0, 200ms | Item removal, card dismiss |
| `strikethrough` | Custom text decoration animation, 300ms | Task completion text |
| `float` | y: [0, -8, 0], 1500ms repeat | "+15 XP" floating text |
| `wobble` | rotate: [-2, 2, -1, 1, 0], 600ms | Creature egg before hatch |
| `flame` | scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8], 800ms repeat | Streak fire glow |

### The Dopamine Loop (task completion sequence)

```
T+0ms     Haptic (light) + Checkbox morph (spring, 300ms)
T+200ms   Sound: playComplete() (±2 semitone random)
T+300ms   Card pulse + glow (shadow-glow-xp)
T+350ms   "+{n} XP" popIn (gold, float up) + "+{n} 🪙" popIn (slight delay)
T+500ms   First-of-day? → Streak flame pulse + playStreakFire()
T+600ms   XP bar progressFill (500ms ease-out)
T+900ms   20% chance: Treasure chest bounceIn → open → item reveal
T+1100ms  Level-up? → Full-screen overlay + bounceIn number + confetti + playLevelUp()
T+1200ms  Card strikethrough + fadeOut + slide to completed section
```

Every sound has a purpose. Every animation has timing. Never skip, never overlap, always queue sequentially.

---

## 9. Asset Strategy

### Visual Assets

- Avatar items: SVG components. Placeholder: geometric/minimal shapes. Professional art post-launch.
- Companion creatures: SVG components with 3 growth stages. Placeholder: simple geometric animals. Professional art post-launch.
- Boss creatures: SVG silhouettes + color + health bar. Professional art post-launch.
- Empty state illustrations: Lucide icon compositions. No custom illustrations for launch.
- Baby avatar: Pacifier icon or simple circular face. Distinct from child avatars.

### Audio Assets

- All sounds procedurally generated via Web Audio API (OscillatorNode + GainNode + envelope shaping)
- SoundEngine service exports named functions matching sound tokens
- Professional sound design replaces procedural sounds post-launch (same API surface)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial design tokens | PM + VEGA |
| 2.0.0 | 2026-03-31 | Warmer palette (forest sage, warm linen, honey), DM Sans font, baby time blocks, enhanced animation presets, Tailwind-oriented tokens | PM + Atlas |
