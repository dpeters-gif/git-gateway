---
document: spec-enhancement
title: "Gamification & Animation Enhancement"
journey-id: "S-3-ENHANCED"
version: 2.0.0
status: Draft
last-updated: "2026-03-30"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - S-3-gamification-engine.md
  - C-1-child-daily-experience.md
  - C-2-task-completion-xp.md
  - C-3-child-progress.md
  - C-6-child-avatar-character.md
  - design-tokens.md
supersedes-sections-of:
  - S-3 (extends mechanics)
  - C-2 (extends animations)
  - design-tokens.md §8 (extends animation tokens)
---

# Gamification & Animation Enhancement

> "Gamification is not a layer you add on top of a product. It is a
> design philosophy woven into every surface, every interaction,
> every notification, and every pixel."
> — Duolingo design analysis

## 1. Gap Analysis: Current State vs. Habitica/Duolingo Standard

### What Habitica does that we don't (yet)

| Habitica Mechanic | Current Familienzentrale | Gap | Priority |
|---|---|---|---|
| **Dual currency (XP + Gold)** | XP only | Gold gives spending agency — children choose what to save for | P1 |
| **Stochastic (random) rewards** | Fixed XP per task | Variable rewards are psychologically more addictive than predictable ones | P1 |
| **Health / consequence system** | No negative consequence | Mild consequence creates stakes without punishment (age-appropriate) | P2 |
| **Pets & mounts (collectibles)** | Avatar items (C-6) | C-6 covers this — extend with creature companions | P2 |
| **Party quests (boss battles)** | Family challenges (C-4) | C-4 covers this — enhance with visual boss/progress metaphor | P1 |
| **Equipment/gear progression** | Avatar unlocks (C-6) | C-6 covers base — add functional-feeling gear tied to streaks | P3 |
| **Task difficulty color coding** | Priority left-border only | Color intensity reflecting difficulty history makes tasks feel alive | P2 |

### What Duolingo does that we don't (yet)

| Duolingo Mechanic | Current Familienzentrale | Gap | Priority |
|---|---|---|---|
| **Streak freeze (insurance)** | No streak protection | Prevents rage-quit after losing a long streak | P1 |
| **Streak milestones with escalating celebration** | Single streak counter | 7/30/100 day milestones with unique celebrations | P1 |
| **Character with emotional states** | Static avatar (C-6) | Avatar reacts to streak status, completions, inactivity | P1 |
| **Sound design** | "No sound effects" in C-2 constraint | Sound is 40%+ of Duolingo's dopamine feedback | P1 |
| **Leagues / competitive periods** | Weekly/monthly leaderboard | Weekly leagues with promotion/demotion create recurring goals | P2 |
| **Variable XP multiplier** | Fixed XP per task | "XP boost" periods, first-task-of-day bonus | P1 |
| **Session-complete celebration** | Daily completion mini-confetti | Make the "all done" moment feel as good as Duolingo lesson complete | P1 |
| **Widget / always-visible streak** | In-app only | Streak must be visible before opening the app | P3 |

---

## 2. New Mechanics to Implement

### 2.1 Dual Currency: XP + Gold Coins

**Why:** XP measures progress (you can't spend it). Gold gives
children agency — they earn it and choose how to spend it. This
is the core Habitica loop that creates investment.

**How it works:**
- Every task completion awards XP (progress) AND Gold (currency)
- Gold ratio: 1 Gold per 5 XP earned (e.g., 15 XP task = 3 Gold)
- Gold can be spent on: avatar cosmetics (C-6), streak freezes,
  custom quest card backgrounds, and parent-defined real-world rewards
- Gold balance shown on child home screen next to XP/level
- Gold transaction history visible in Progress screen

**Visual:** Gold coin icon (🪙), color `#FFD700`, uses `ease-bounce`
animation on earn. Coin counter in app bar for children.

**Acceptance Criteria:**
- **AC-G001:** When a task is completed, the system shall award
  Gold coins equal to floor(xpValue / 5), minimum 1 Gold for tasks
  with xpValue > 0.
- **AC-G002:** The system shall display the child's Gold balance
  in the child app bar, next to the streak counter.
- **AC-G003:** Gold shall be recorded in the points_ledger alongside
  XP (new column: `goldAwarded`).
- **AC-G004:** The system shall never allow Gold balance to go
  negative.

### 2.2 Stochastic (Random) Reward Drops

**Why:** Habitica's co-founder confirmed that variable reward rates
are "what makes a behaviour addictive." Fixed rewards become
predictable and boring. Random bonus drops create anticipation.

**How it works:**
- On every task completion, there is a **20% chance** of a bonus drop
- Drops are visual "treasure chest" moments: a small chest icon
  bounces in after the XP animation
- Drop contents (randomly selected):
  - **Bonus Gold** (2-5 extra coins) — 40% of drops
  - **XP Boost token** (next task gives 2× XP) — 25% of drops
  - **Avatar item unlock** (random locked item one level early) — 15%
  - **Streak Freeze** (auto-applied, protects next missed day) — 10%
  - **Mystery egg** (hatches into a companion creature after 3 tasks) — 10%
- Drop animation: chest bounces in (popIn), opens with particle
  burst, item revealed with glow
- Drop probability increases slightly for high-priority tasks and
  tasks with photo proof

**Acceptance Criteria:**
- **AC-G010:** When a task is completed, the system shall evaluate a
  random drop with a 20% base probability.
- **AC-G011:** When a drop occurs, the system shall display a treasure
  chest animation after the XP award animation.
- **AC-G012:** The system shall distribute drop types according to the
  defined probability weights.
- **AC-G013:** Drop evaluation shall happen server-side to prevent
  client manipulation.

### 2.3 Streak Freeze (Insurance)

**Why:** Duolingo's Streak Freeze reduced churn by 21% for at-risk
users. Losing a 30-day streak to one bad day causes rage-quit.
A freeze is a safety valve.

**How it works:**
- Children can spend **10 Gold** to buy a Streak Freeze
- Maximum 2 freezes held at once
- A freeze auto-activates if a day passes with no completion
- When a freeze activates: streak is preserved, freeze consumed,
  the child sees "Serie geschützt! ❄️ (1 Freeze verbraucht)" /
  "Streak protected! ❄️ (1 freeze used)" on next login
- Freeze count shown as small ice crystal icons next to streak flame
- Also obtainable as a random drop (see 2.2)

**Acceptance Criteria:**
- **AC-G020:** The system shall allow children to purchase a Streak
  Freeze for 10 Gold, holding a maximum of 2 at once.
- **AC-G021:** When a calendar day ends with no task completion and
  the child owns a Streak Freeze, the system shall consume the
  freeze and preserve the streak.
- **AC-G022:** When a freeze activates, the system shall create a
  notification informing the child.
- **AC-G023:** The system shall display the freeze count as ice
  crystal icons adjacent to the streak flame.

### 2.4 Streak Milestones with Escalating Celebrations

**Why:** A 100-day streak should feel categorically different from a
3-day streak. Duolingo celebrates 7, 14, 30, 50, 100, 365 with
escalating visual and emotional intensity.

**Milestone tiers:**

| Days | Name | Celebration | Badge |
|------|------|------------|-------|
| 3 | Warm-up | Flame grows to medium size + gentle pulse | — |
| 7 | Week Warrior | Full-screen flame burst + confetti + badge award | Week Warrior |
| 14 | Fortnight Hero | Flame turns blue + special particle effect | — |
| 30 | Month Master | Full-screen with fireworks, badge, and unique avatar item | Month Master |
| 50 | Halbzeit-Held | Golden flame + XP bonus (50 XP) | Halfway Hero |
| 100 | Century | Full-screen with golden confetti, crown badge, title unlock | Century Streak |
| 365 | Legende | Animated trophy + permanent golden flame effect on avatar | Living Legend |

**Flame evolution:** The streak flame icon isn't static — it visually
evolves:
- 0 days: No flame (gray ember)
- 1-6 days: Small orange flame
- 7-13 days: Medium flame with subtle glow
- 14-29 days: Large flame with active glow halo
- 30-99 days: Blue-core flame with orange tips
- 100+: Golden flame with particle trail

**Acceptance Criteria:**
- **AC-G030:** When a streak reaches a milestone day (3, 7, 14, 30,
  50, 100, 365), the system shall display the corresponding
  celebration animation.
- **AC-G031:** The streak flame icon shall visually evolve based on
  the current streak count according to the flame tier table.
- **AC-G032:** Milestone celebrations that include a badge shall
  award the badge permanently.
- **AC-G033:** The 50-day and 100-day milestones shall award bonus
  XP (50 and 100 respectively).

### 2.5 XP Multiplier Events

**Why:** Duolingo uses "XP boost" to create urgency and excitement.
A predictable reward schedule becomes routine; occasional multipliers
make specific moments feel special.

**Types:**
- **First Quest of the Day bonus:** +50% XP on the first task
  completed each day. Visual: "Tagesstart-Bonus! 1.5× XP" /
  "Daily start bonus! 1.5× XP" banner that appears once.
- **Flow Mode bonus:** Completing all steps in a flow routine
  (P-8) under the target time awards +25% XP total.
- **Weekend Warrior:** Saturday and Sunday completions earn +25% XP
  (encouraging weekend engagement when motivation drops).
- **Parent-triggered XP Boost:** Parents can activate a 2× XP event
  for 1 hour (from Settings). Uses: motivating a cleaning afternoon.
  Limited to 2 activations per week.

**Acceptance Criteria:**
- **AC-G040:** When a child completes their first task of the day,
  the system shall award 1.5× the base XP value.
- **AC-G041:** The system shall display a "First Quest Bonus" visual
  indicator on the first completion of the day.
- **AC-G042:** Where a parent has activated an XP Boost, the system
  shall award 2× XP for all tasks completed within the boost
  duration.
- **AC-G043:** XP multiplier events shall stack multiplicatively
  (first quest 1.5× + parent boost 2× = 3×).
- **AC-G044:** The active multiplier shall be visually indicated on
  the child's XP bar area.

### 2.6 Family Boss Battles (Enhanced C-4)

**Why:** Habitica's boss battles give family challenges a narrative
and visual metaphor. Instead of "complete 20 tasks," the family is
"fighting a dragon" — each task does damage.

**How it works:**
- Parents can create a challenge as a "Boss Battle" type
- The boss has HP (hit points) = target task count × 10
- Each qualifying task completion deals 10 damage
- The boss has a visual representation (illustrated creature) that
  shows damage: healthy → wounded → critical → defeated
- Boss stages: 100-75% HP (healthy), 75-50% (scratched), 50-25%
  (wounded), 25-0% (critical), 0% (defeated + celebration)
- On defeat: family celebration screen, bonus XP for all
  contributors, rare avatar item drop

**Boss library (pre-designed, 6 creatures):**
1. 🐉 Chaos-Drache (chaos dragon) — for large challenges (30+ tasks)
2. 🧊 Eisfestung (ice fortress) — winter themed
3. 🌿 Wildwuchs (wild growth) — spring/garden themed
4. 🏴‍☠️ Piratenschiff (pirate ship) — adventure themed
5. 🤖 Roboter-Riese (robot giant) — tech themed
6. 🎃 Kürbiskönig (pumpkin king) — autumn/Halloween themed

**Acceptance Criteria:**
- **AC-G050:** The system shall allow parents to create challenges
  with type "boss_battle" and a selected boss creature.
- **AC-G051:** The system shall display the boss with a health bar
  that decreases as tasks are completed.
- **AC-G052:** The boss illustration shall visually degrade through
  4 damage stages based on remaining HP percentage.
- **AC-G053:** When the boss is defeated (HP reaches 0), the system
  shall display a family celebration with bonus XP and avatar item.

### 2.7 Companion Creatures (Pets)

**Why:** Habitica's pet system is described as "one of the most
addictive aspects." Feeding and growing a creature creates a
persistent emotional bond that drives return visits.

**How it works:**
- Children start with one egg (received during onboarding)
- Eggs hatch after completing 3 tasks (incubation progress bar)
- Each creature has 3 growth stages: baby → juvenile → adult
- Growth requires feeding: every 5 tasks completed = 1 feeding
- Baby→juvenile: 3 feedings. Juvenile→adult: 5 feedings
- Adult creatures provide a passive "luck bonus" (+5% drop rate)
- Creatures are displayed on the child's My Day screen next to
  the greeting
- Maximum 3 active creatures per child

**Starter creatures (6 types, earned through play):**
1. 🐺 Wolf — earned at Level 2
2. 🐱 Katze — earned at Level 3
3. 🦊 Fuchs — earned at Level 5
4. 🐲 Drache — earned at Level 7
5. 🦉 Eule — earned at Level 10
6. 🦄 Einhorn — earned via 30-day streak

**Acceptance Criteria:**
- **AC-G060:** The system shall award an egg during onboarding (S-1)
  and at designated level milestones.
- **AC-G061:** Eggs shall display an incubation progress bar that
  fills with each task completion (3 tasks to hatch).
- **AC-G062:** The system shall display the child's active creature
  on the My Day screen with its current growth stage.
- **AC-G063:** Creatures shall grow through feeding (task completions
  converted to feedings at 5:1 ratio).
- **AC-G064:** Adult creatures shall provide a +5% increase to the
  random drop probability.

---

## 3. Animation Choreography Masterclass

> The goal: every interaction must feel as satisfying as Duolingo's
> "correct answer" moment. Animation is not decoration — it IS the
> reward feedback.

### 3.1 The Core Completion Sequence (Enhanced C-2)

The current spec defines: checkmark (300ms) → XP pop (500ms) → bar
fill (500ms). This is correct but incomplete. Here's the full
choreography:

```
TRIGGER: Child taps completion checkbox

T+0ms     HAPTIC: Light impact feedback (device vibration 10ms)
T+0ms     CHECKBOX: Circle morphs to filled checkmark (SVG path draw)
          Easing: ease-spring { stiffness: 400, damping: 25 }
          Duration: 300ms
          Color: gray → success green
          Scale: 1.0 → 1.15 → 1.0 (overshoot bounce)

T+200ms   SOUND: "ding" — bright, 8-bit inspired completion chime
          Pitch varies slightly per task (+/- 2 semitones random)
          This randomness prevents the sound from becoming background noise

T+300ms   CARD PULSE: Task card briefly scales to 1.02 and glows
          Box-shadow transitions from shadow-sm to shadow-glow-xp
          Duration: 200ms

T+350ms   XP POP: "+15 XP" text appears above card
          Animation: popIn (scale 0.5→1.0 with ease-bounce)
          Color: color-xp (#FFB020)
          Font: weight 800, size-lg, tabular figures
          Then floats upward 40px while fading out (500ms)
          
T+350ms   GOLD POP: "+3 🪙" appears slightly below/right of XP text
          Animation: popIn with 100ms delay after XP
          Color: #FFD700
          Floats upward and fades with XP text

T+500ms   FIRST-OF-DAY CHECK: If this is today's first completion:
          STREAK PULSE: Flame icon scales 1.0→1.3→1.0
          Streak count increments with rolling number animation
          Glow halo brightens momentarily
          Sound: ascending two-note chime

T+600ms   XP BAR: Progress bar fills from old value to new value
          Easing: ease-out, duration 500ms
          Fill color pulses brighter at the leading edge
          Fraction text updates: "85/100" → "100/100"

T+900ms   DROP CHECK: If random drop triggered (20% chance):
          CHEST: Treasure chest bounces in from below (popIn)
          Position: center of screen, above task list
          Delay: 800ms auto-open (or tap to open)
          OPEN: Chest lid flips, particles burst, item revealed
          ITEM: Spins in with glow (1000ms)
          Text: item name + description in child-friendly language

T+1100ms  LEVEL CHECK: If level-up triggered:
          OVERLAY: Full-screen overlay fades in (200ms)
          Background: radial gradient from color-level-up center
          LEVEL NUMBER: Bounces in from scale 0 → display size
          Easing: ease-bounce
          CONFETTI: Particle burst (30 particles, multi-color)
          Duration: 2000ms, gravity simulation
          SOUND: Triumphant fanfare (500ms)
          TEXT: "Level [N]!" → "Weiter so!" after 1s
          DISMISS: Auto after 3s, or tap anywhere

T+1100ms  CHALLENGE CHECK: If task contributes to challenge:
          PROGRESS: Challenge bar fills with challenge-color
          "+1" indicator pops in next to bar
          If challenge completes: boss defeat animation (2.6)

T+1200ms  CARD SETTLE: Completed task card:
          Text: strikethrough applied (left-to-right wipe, 200ms)
          Opacity: fades to 0.5 (200ms)
          Position: slides down to "completed" section (300ms)
```

### 3.2 Sound Design Tokens

**Why we need sound:** Duolingo's "ding" is responsible for a
significant portion of its dopamine loop. The C-2 spec currently
says "DO NOT implement sound effects." This constraint must be
**reversed** — sound is not optional for Habitica-level gamification.

| Sound Token | Trigger | Character | Duration |
|---|---|---|---|
| `sound-complete` | Task completion | Bright 8-bit "ding," slightly randomized pitch | 200ms |
| `sound-xp-award` | XP pop-in | Coin-like "ka-ching," ascending tone | 150ms |
| `sound-gold-drop` | Gold earned | Metallic coin clink | 100ms |
| `sound-level-up` | Level transition | Triumphant ascending fanfare, 3 notes | 500ms |
| `sound-streak-fire` | First completion of day | Warm two-note ascending chime | 200ms |
| `sound-streak-milestone` | 7/30/100 day milestone | Extended celebration jingle | 800ms |
| `sound-drop-chest` | Treasure chest appears | Mysterious sparkle + thud | 300ms |
| `sound-drop-open` | Chest opens | Burst + reveal shimmer | 400ms |
| `sound-badge-earn` | Badge awarded | Achievement unlocked chime (3 ascending notes) | 400ms |
| `sound-boss-hit` | Challenge progress | Impact thud + creature cry | 300ms |
| `sound-boss-defeat` | Challenge complete | Victory fanfare + cheer | 1000ms |
| `sound-error` | Failed action | Soft descending two-note | 200ms |
| `sound-flow-step` | Flow mode step complete | Quick staccato note, pitch rises per step | 150ms |
| `sound-flow-done` | Flow routine complete | Flourishing completion melody | 600ms |

**Implementation:** Use the Web Audio API (no external library
needed — approved in constitution). Sounds are generated
procedurally (oscillator + envelope) or loaded as tiny MP3/OGG
files (< 10KB each). Total sound bank < 100KB.

**Volume control:** Settings page includes a sound toggle
(on/off) and volume slider. Default: ON at 70%. Respects device
silent mode.

**Acceptance Criteria:**
- **AC-S001:** The system shall play the corresponding sound token
  at each gamification trigger point.
- **AC-S002:** The system shall provide a sound on/off toggle in
  Settings, defaulting to ON.
- **AC-S003:** The system shall provide a volume slider (0-100%)
  in Settings.
- **AC-S004:** The system shall respect device silent/mute mode.
- **AC-S005:** The total sound asset size shall not exceed 100KB.
- **AC-S006:** Sound playback shall not delay or block the visual
  animation sequence.
- **AC-S007:** Sounds shall use slight pitch randomization (±2
  semitones) on repetitive triggers to prevent auditory fatigue.

### 3.3 Haptic Feedback Tokens

| Haptic Token | Trigger | Intensity |
|---|---|---|
| `haptic-tap` | Button press, checkbox tap | Light (10ms) |
| `haptic-success` | Task completion | Medium (15ms) |
| `haptic-level-up` | Level transition | Heavy (30ms, double pulse) |
| `haptic-error` | Failed action | Light double tap (10ms × 2) |
| `haptic-drop` | Treasure chest appears | Medium single (20ms) |

**Implementation:** Vibration API (`navigator.vibrate()`). Falls
back silently if unavailable. Respects system haptic settings.

### 3.4 Celebration Tiers

Not all achievements are equal. Celebrations must scale with
significance:

| Tier | Triggers | Visual Intensity | Sound | Duration |
|---|---|---|---|---|
| **Micro** | Single task complete, gold earned | Card pulse, XP/gold pop-in, bar fill | Single ding | <2s |
| **Minor** | First task of day (streak increment), badge earned | + streak flame pulse, + badge glow | + streak chime | <3s |
| **Major** | Level-up, 7-day streak, challenge milestone | Full-screen overlay, confetti, glow | Fanfare | 3-5s |
| **Epic** | 30/100-day streak, boss defeat, rare drop | Extended full-screen, fireworks, special particles | Extended fanfare | 5-8s |
| **Legendary** | 365-day streak, all badges collected | Unique one-time animation, permanent avatar effect | Custom melody | 8-10s |

### 3.5 Emotional Avatar States (Enhanced C-6)

The avatar isn't just customizable — it reacts:

| State | Trigger | Avatar Expression |
|---|---|---|
| **Idle** | Default, app open | Neutral, gentle breathing animation (subtle scale oscillation) |
| **Happy** | Task just completed | Wide smile, brief bounce, sparkle eyes |
| **Excited** | Level-up, boss defeat | Jump + arms up, star eyes, particle burst around avatar |
| **Proud** | Streak milestone | Stands tall, subtle glow, crown/accessory shimmer |
| **Sleepy** | No app open today (shown on next open) | Yawning, eyes half-closed, ZZZ bubbles |
| **Encouraging** | Streak at risk (after 18:00) | Waving, "come on!" gesture, warm glow |
| **Celebrating** | All quests done | Dance animation (2s loop), confetti |
| **With creature** | Has active companion | Creature visible beside avatar, interacts (nuzzle, play) |

**Acceptance Criteria:**
- **AC-A001:** The avatar on the child My Day screen shall display
  the emotional state corresponding to the current context.
- **AC-A002:** State transitions shall use Framer Motion crossfade
  (200ms) between avatar expressions.
- **AC-A003:** The "sleepy" state shall only appear if the child has
  not opened the app today and it is after 14:00.

---

## 4. Updated Design Tokens (Additions)

### New Color Tokens

| Token | Value | Usage |
|---|---|---|
| `color-gold` | `#FFD700` | Gold currency, coin icon, rare items |
| `color-gold-light` | `rgba(255, 215, 0, 0.15)` | Gold backgrounds |
| `color-drop` | `#E040FB` | Treasure chest glow, rare drops |
| `color-drop-light` | `rgba(224, 64, 251, 0.12)` | Drop backgrounds |
| `color-freeze` | `#4FC3F7` | Streak freeze ice crystals |
| `color-boss-health` | `#E53935` | Boss HP bar fill |
| `color-pet-happy` | `#81C784` | Pet interaction, feeding |

### New Animation Presets

| Preset | Effect | Used for |
|---|---|---|
| `coinDrop` | Y-axis fall + bounce + settle | Gold coin award |
| `chestBounce` | Scale 0→1.2→1.0 with spring | Treasure chest entrance |
| `chestOpen` | Rotate lid -90deg + particle burst | Chest opening |
| `itemReveal` | Scale 0→1.0 + spin 360 + glow pulse | Drop item reveal |
| `flameEvolve` | Morph between flame tier SVGs | Streak flame progression |
| `bossHit` | Shake + flash + HP bar decrease | Challenge boss damage |
| `bossDefeat` | Boss cracks + shatters + explosion | Boss battle complete |
| `petBounce` | Gentle vertical oscillation | Companion idle animation |
| `petFeed` | Pet jumps + heart particles | Feeding interaction |
| `numberRoll` | Digit-by-digit increment | XP/Gold counter updates |
| `streakFreeze` | Ice crystallization from center outward | Freeze activation |

### Updated Duration Tokens

| Token | Value | Usage |
|---|---|---|
| `duration-drop-sequence` | 1200ms | Full treasure chest open sequence |
| `duration-boss-hit` | 400ms | Boss damage reaction |
| `duration-boss-defeat` | 3000ms | Boss defeat celebration |
| `duration-pet-feed` | 800ms | Pet feeding animation |
| `duration-milestone` | 2000ms | Streak milestone celebration |

---

## 5. Constitution Amendment Required

### Sound Effects
The C-2 constraint "DO NOT implement sound effects — animation only
for v2" must be **removed**. Sound is critical to the gamification
feedback loop.

**New rule:** Sound effects are implemented using Web Audio API
(no external library). Sound assets are procedurally generated
or loaded from < 100KB total asset bundle. Sound is toggleable
in Settings (default: ON).

### New Approved Asset
- Web Audio API — native browser API, no library needed
- Small audio files (MP3/OGG) for sound effects — total < 100KB

### Gold Currency
The S-3 constraint "DO NOT implement mutable XP (no spending XP,
no XP decay)" remains. Gold is a **separate** currency — XP is
never spent. Gold is the spendable currency.

---

## 6. Build Priority Order

These enhancements integrate into the existing build waves:

| Priority | Enhancement | Wave | Effort |
|---|---|---|---|
| P1 | Sound design (3.2) | Wave 2 (with C-2) | Medium |
| P1 | Enhanced completion choreography (3.1) | Wave 2 (with C-2) | Medium |
| P1 | Streak milestones + flame evolution (2.4) | Wave 2 (with C-1) | Medium |
| P1 | Streak freeze (2.3) | Wave 3 (with S-3) | Small |
| P1 | First-of-day XP bonus (2.5 partial) | Wave 3 (with S-3) | Small |
| P1 | Gold currency (2.1) | Wave 3 (with S-3) | Medium |
| P1 | Stochastic drops (2.2) | Wave 3 (with S-3) | Large |
| P1 | Emotional avatar states (3.5) | Wave 2 (with C-6) | Medium |
| P1 | Boss battles visual (2.6) | Wave 3 (with C-4) | Large |
| P1 | Celebration tiers (3.4) | Wave 2 | Small |
| P2 | Companion creatures (2.7) | Wave 9 (new) | Large |
| P2 | Leagues with promotion (Duolingo-style) | Wave 9 (new) | Medium |
| P2 | Parent-triggered XP Boost (2.5) | Wave 3 | Small |
| P3 | Weekend Warrior multiplier | Wave 3 | Small |

---

## 7. Invariants (Global)

- **INV-G001:** XP is never spendable. It is a permanent progress
  measure. Only Gold is spendable.
- **INV-G002:** Sound must never block or delay visual animations.
- **INV-G003:** All randomness (drops, pitch variance) must be
  server-evaluated to prevent client manipulation.
- **INV-G004:** Celebration intensity must scale with achievement
  significance — never use a major celebration for a minor event.
- **INV-G005:** No negative language, no punishment messaging, no
  shame. Consequences (streak loss) are presented as opportunities
  ("Neue Serie starten!"), not failures.
- **INV-G006:** Avatar emotional states must never display negative
  emotions (no crying, no angry). The closest to negative is
  "sleepy" (encouraging) and "encouraging" (motivating).
- **INV-G007:** Gold economy must be inflationary-resistant: earning
  rates and spending prices must be balanced so a child can
  reasonably afford a streak freeze (10 Gold) every 2-3 days.

---

## 8. Constraints (DO NOT List)

- DO NOT implement sound that cannot be disabled
- DO NOT implement punitive health loss (Habitica-style HP damage) —
  children's app, not hardcore RPG
- DO NOT implement Gold decay or Gold loss
- DO NOT implement pay-to-win mechanics (no real-money purchases)
- DO NOT implement social comparison shame ("you are last")
- DO NOT implement avatar crying or anger states
- DO NOT implement drop rates > 30% (drops must feel rare and special)
- DO NOT implement more than 3 simultaneous currencies
- DO NOT implement trading between children (prevents bullying)
- DO NOT implement sounds longer than 1 second for micro-celebrations

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 2.0.0 | 2026-03-30 | Major gamification enhancement — dual currency, drops, sound, boss battles, creatures, celebration tiers | PM + VEGA |
