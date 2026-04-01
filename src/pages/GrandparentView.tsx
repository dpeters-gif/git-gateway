import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import { Calendar, Clock } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { de } from "date-fns/locale";

interface LinkData {
  family_name: string;
  members: { id: string; name: string; color: string }[];
  events: any[];
  tasks: any[];
  timeBlocks: any[];
  expired: boolean;
}

export default function GrandparentView() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [data, setData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError(t("grandparent.noToken", "Kein Link angegeben"));
      setLoading(false);
      return;
    }

    async function load() {
      // Fetch link (public access via RLS cg_read)
      const { data: link, error: linkErr } = await supabase
        .from("caregiver_links")
        .select("*")
        .eq("token", token!)
        .maybeSingle();

      if (linkErr || !link) {
        setError(t("grandparent.notFound", "Link nicht gefunden"));
        setLoading(false);
        return;
      }

      if (new Date(link.expires_at) < new Date()) {
        setData({ family_name: "", members: [], events: [], tasks: [], timeBlocks: [], expired: true });
        setLoading(false);
        return;
      }

      // Fetch family name - this needs auth so we'll use the link data we have
      const familyId = link.family_id;
      const visibleIds = link.visible_member_ids ?? [];

      // For public view, we fetch using service-level access through an edge function
      // For now, show the basic link info
      setData({
        family_name: link.name || t("grandparent.familyCalendar", "Familienkalender"),
        members: [],
        events: [],
        tasks: [],
        timeBlocks: [],
        expired: false,
      });
      setLoading(false);
    }

    load();
  }, [token, t]);

  if (loading) return <div className="p-6"><SkeletonLoader type="card" count={3} /></div>;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-lg font-bold text-foreground">{error}</h1>
          <p className="text-sm text-muted-foreground">{t("grandparent.askFamily", "Bitte die Familie um einen neuen Link")}</p>
        </div>
      </div>
    );
  }

  if (data?.expired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-lg font-bold text-foreground">{t("grandparent.expired", "Dieser Link ist abgelaufen")}</h1>
          <p className="text-sm text-muted-foreground">{t("grandparent.askFamily", "Bitte die Familie um einen neuen Link")}</p>
        </div>
      </div>
    );
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <h1 className="text-lg font-bold text-foreground text-center">{data?.family_name}</h1>
        <p className="text-xs text-muted-foreground text-center mt-1">
          {format(weekStart, "dd. MMMM", { locale: de })} – {format(addDays(weekStart, 6), "dd. MMMM yyyy", { locale: de })}
        </p>
      </header>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="p-4 space-y-3">
        {days.map((day) => (
          <motion.div key={day.toISOString()} variants={slideUp} className="bg-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              {format(day, "EEEE, dd. MMMM", { locale: de })}
            </h3>
            <p className="text-xs text-muted-foreground">{t("grandparent.noEvents", "Keine Termine")}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
