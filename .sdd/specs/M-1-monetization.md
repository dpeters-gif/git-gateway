---
document: spec
title: "Monetization & Subscription Management"
journey-id: "M-1"
version: 1.0.0
status: Draft
last-updated: "2026-03-31"
author: "PM + Atlas"
depends-on:
  - constitution.md v2.0.0
related-entities:
  - Subscription
  - Family
---

# Monetization & Subscription Management

## 1. Context

Familienzentrale uses a freemium model. The free tier must be generous
enough to hook the family (calendar + basic tasks + basic child
quests). The paid tiers unlock the full gamification engine, AI
features, and advanced family management. The conversion trigger is
the CHILD — "Mama, ich will ein Begleiter-Tier!" — not the parent.

## 2. Goal

Parents can subscribe to Family ($5.99/mo) or Family+ ($9.99/mo)
tiers via App Store / Play Store in-app purchase. Feature gates are
enforced both in the UI (hidden elements) and server-side (RLS
policies and Edge Function checks). The free tier delivers real
daily value; the paid tiers deliver delight.

## 3. Non-Goals

- This journey does not implement custom enterprise pricing
- This journey does not implement referral codes or discounts
- This journey does not implement a free trial (the free tier IS the trial)
- This journey does not implement annual billing in v1 (added post-launch)

## 4. Subscription Tiers

### Free

- Calendar (week matrix, day view, month view)
- Up to 20 active tasks/events
- Up to 3 family members (including babies)
- Basic child quest UI (XP + streaks — no creatures, no gold, no drops)
- 1 shopping list
- 5 board notes
- Photo proof
- Baby member support

### Family — $5.99/month

Everything in Free, plus:
- Unlimited active items
- Up to 8 family members
- Full gamification (Gold, drops, creatures, boss battles, avatar items)
- Routines + flow mode
- Multiple shopping lists
- Unlimited board notes
- Google Calendar sync
- Push notifications (via Capacitor)

### Family+ — $9.99/month

Everything in Family, plus:
- Up to 12 family members
- AI task suggestions (P-12)
- AI email-to-calendar (P-14)
- Smart nudge notifications (P-9)
- Weekly family recap (P-10)
- Care-share analytics (P-7)
- Multi-household support (S-2)

## 5. Feature Gate Implementation

### Client-Side Gates

```typescript
// Hook: useSubscription()
// Returns: { tier: 'free' | 'family' | 'familyplus', isActive: boolean }

// Usage in components:
const { tier } = useSubscription();

// Hide UI element
if (tier === 'free') return null; // Don't render creatures section

// Show upgrade prompt
if (tier === 'free') return <UpgradePrompt feature="creatures" />;
```

### Server-Side Gates (RLS + Edge Functions)

```sql
-- RLS policy example: creatures table
CREATE POLICY "family_tier_gate" ON companion_creatures
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM subscriptions
      WHERE tier IN ('family', 'familyplus')
      AND status = 'active'
    )
  );
```

Edge Functions check tier before executing gated logic (AI calls,
email processing, recap generation).

## 6. Upgrade Prompts

Upgrade prompts appear when a user encounters a gated feature.
They are NEVER interruptive (no popup on app open). They appear
inline where the feature would be.

### Prompt Locations

| Location | Trigger | Message (DE) | Message (EN) |
|---|---|---|---|
| Child My Day | Creature slot empty on free tier | "Schalte magische Begleiter frei!" | "Unlock magical companions!" |
| Task completion | No gold/drops awarded on free tier | "Mit Family bekommst du Gold & Belohnungen!" | "Get Gold & rewards with Family!" |
| Shopping list | Try to create 2nd list on free | "Mehrere Listen mit Family" | "Multiple lists with Family" |
| Calendar sync | Tap sync setting on free | "Google Calendar Sync mit Family" | "Google Calendar sync with Family" |
| Board | Try to create 6th note on free | "Unbegrenzte Notizen mit Family" | "Unlimited notes with Family" |
| AI suggestions | Suggestion area shows teaser on free | "KI-Vorschläge mit Family+" | "AI suggestions with Family+" |

### Upgrade Flow

1. User taps upgrade prompt → Opens in-app subscription sheet
2. Sheet shows: tier comparison, price, "7 Tage testen" / "Try 7 days" (if applicable)
3. User selects tier → Native App Store / Play Store purchase flow
4. On success: subscription record created in Supabase, UI refreshes with unlocked features
5. Celebration: confetti animation + "Willkommen bei Family!" toast

## 7. Subscription Management

- View current plan: Settings → Subscription
- Cancel: redirects to App Store / Play Store subscription management
- Downgrade: features beyond new tier become read-only (existing data preserved, can't create new)
- Expiry: 3 days before expiry, in-app notification. On expiry: graceful downgrade to free.
- Data preservation: ALL data is preserved on downgrade. Nothing is deleted. Gated features just become hidden/read-only.

## 8. Acceptance Criteria

- **AC-001:** Free tier users can use calendar, basic tasks, and basic child quests without encountering errors.
- **AC-002:** Gated features are invisible or show upgrade prompts — never broken/error states.
- **AC-003:** Server-side gates prevent gated actions even if client-side gates are bypassed.
- **AC-004:** Subscription status syncs from App Store / Play Store within 30 seconds of purchase.
- **AC-005:** Downgrade preserves all existing data and shows it as read-only where applicable.
- **AC-006:** Upgrade prompts use positive, aspirational language — never shame or FOMO.

## 9. Invariants

- **INV-001:** Free tier must always deliver real daily value (calendar + tasks + basic quests). It is NOT a crippled trial.
- **INV-002:** No feature gate may cause data loss. Downgrade = read-only, never deletion.
- **INV-003:** Subscription checks must happen server-side (RLS/Edge Function), not just client-side.
- **INV-004:** The child NEVER sees pricing or subscription UI. Only parents manage subscriptions.

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-31 | Initial monetization spec | PM + Atlas |
