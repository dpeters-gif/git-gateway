import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useSubscription } from "@/hooks/useSubscription";
import { TIERS } from "@/lib/constants";
import { Check, Sparkles, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PLANS = [
  {
    tier: TIERS.FREE,
    icon: Star,
    price: "0€",
    features: [
      "calendar.weekMatrix",
      "tasks.upTo20",
      "members.upTo3",
      "shoppingList.one",
      "boardNotes.five",
      "photoProof",
    ],
  },
  {
    tier: TIERS.FAMILY,
    icon: Sparkles,
    price: "5,99€/mo",
    features: [
      "unlimited.items",
      "members.upTo8",
      "gamification.full",
      "routines.flowMode",
      "shoppingList.multiple",
      "boardNotes.unlimited",
      "calendarSync",
      "pushNotifications",
    ],
  },
  {
    tier: TIERS.FAMILY_PLUS,
    icon: Crown,
    price: "9,99€/mo",
    features: [
      "members.upTo12",
      "ai.suggestions",
      "ai.emailCalendar",
      "smartNudges",
      "weeklyRecap",
      "careShare",
      "multiHousehold",
    ],
  },
];

export default function SubscriptionManagement() {
  const { t } = useTranslation();
  const { tier, isFree } = useSubscription();

  const handleUpgrade = (targetTier: string) => {
    // In production, this would trigger App Store / Play Store purchase
    toast.info(t("subscription.comingSoon", "In-App-Käufe werden bald verfügbar sein"));
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={slideUp}>
        <h2 className="text-sm font-semibold text-foreground">{t("subscription.currentPlan", "Aktueller Plan")}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {tier === TIERS.FREE && t("subscription.freePlan", "Kostenlos")}
          {tier === TIERS.FAMILY && "Family"}
          {tier === TIERS.FAMILY_PLUS && "Family+"}
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.tier === tier;
          const tierOrder = [TIERS.FREE, TIERS.FAMILY, TIERS.FAMILY_PLUS];
          const isDowngrade = tierOrder.indexOf(plan.tier) < tierOrder.indexOf(tier);

          return (
            <motion.div
              key={plan.tier}
              variants={slideUp}
              className={`bg-card rounded-lg p-5 border ${isCurrent ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-bold text-foreground capitalize">
                  {plan.tier === TIERS.FREE ? t("subscription.free", "Kostenlos") : plan.tier === TIERS.FAMILY ? "Family" : "Family+"}
                </span>
              </div>

              <p className="text-2xl font-extrabold text-foreground mb-4">{plan.price}</p>

              <ul className="space-y-2 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-success mt-0.5 shrink-0" />
                    <span>{t(`subscription.feature.${f}`, f)}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  {t("subscription.currentLabel", "Aktueller Plan")}
                </Button>
              ) : isDowngrade ? null : (
                <Button size="sm" className="w-full gap-1" onClick={() => handleUpgrade(plan.tier)}>
                  <Sparkles className="w-3 h-3" />
                  {t("subscription.upgrade", "Upgrade")}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
