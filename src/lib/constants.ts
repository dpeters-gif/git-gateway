// XP Level thresholds
export const LEVEL_THRESHOLDS = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  500,  // Level 4
  800,  // Level 5
] as const;

// After level 5, each level requires +400 XP more
export const LEVEL_INCREMENT_AFTER_5 = 400;

export function getLevelForXP(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      if (i === LEVEL_THRESHOLDS.length - 1) {
        const xpAfter5 = totalXP - LEVEL_THRESHOLDS[i];
        return i + 1 + Math.floor(xpAfter5 / LEVEL_INCREMENT_AFTER_5);
      }
      return i + 1;
    }
  }
  return 1;
}

export function getXPForNextLevel(level: number): number {
  if (level < LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[level];
  }
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (level - LEVEL_THRESHOLDS.length + 1) * LEVEL_INCREMENT_AFTER_5;
}

// Drop chance after task completion
export const DROP_CHANCE = 0.2;

// Streak freeze cost in gold
export const STREAK_FREEZE_COST = 10;

// Max streak freezes a user can hold
export const MAX_STREAK_FREEZES = 2;

// Subscription tiers
export const TIERS = {
  FREE: "free",
  FAMILY: "family",
  FAMILY_PLUS: "familyplus",
} as const;

// Member limits per tier
export const MEMBER_LIMITS = {
  [TIERS.FREE]: 3,
  [TIERS.FAMILY]: 8,
  [TIERS.FAMILY_PLUS]: 12,
} as const;

// Active item limits (free tier)
export const FREE_ACTIVE_ITEM_LIMIT = 20;
