import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { slideUp } from "@/lib/animations";
import { useFamily } from "@/hooks/useFamily";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Suggestion {
  title: string;
  reason: string;
  xp: number;
}

interface AISuggestionsProps {
  onSelect: (suggestion: Suggestion) => void;
}

export default function AISuggestions({ onSelect }: AISuggestionsProps) {
  const { t } = useTranslation();
  const { familyId } = useFamily();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!familyId) return;
    let cancelled = false;

    async function fetchSuggestions() {
      try {
        const { data, error: err } = await supabase.functions.invoke("ai-suggestions", {
          body: { familyId },
        });
        if (cancelled) return;
        if (err) throw err;
        setSuggestions(data?.suggestions ?? []);
      } catch {
        if (!cancelled) setError(true);
      }
      if (!cancelled) setLoading(false);
    }

    fetchSuggestions();
    return () => { cancelled = true; };
  }, [familyId]);

  if (error || (!loading && suggestions.length === 0)) return null;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="text-xs text-primary font-medium flex items-center gap-1 mb-2"
      >
        <Sparkles className="w-3 h-3" /> {t("suggestions.show", "Vorschläge anzeigen")}
      </button>
    );
  }

  return (
    <motion.div variants={slideUp} initial="hidden" animate="visible" className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-semibold text-foreground">{t("suggestions.title", "Vorschläge")}</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="text-[10px] text-muted-foreground">
          {t("common.close")}
        </button>
      </div>

      {loading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 flex-1 rounded-lg animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSelect(s)}
              className="flex-1 min-w-[120px] bg-accent-light border border-accent/20 rounded-lg p-2.5 text-left hover:bg-accent/20 transition-colors"
            >
              <span className="text-xs font-semibold text-foreground block">{s.title}</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">{s.reason}</span>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
