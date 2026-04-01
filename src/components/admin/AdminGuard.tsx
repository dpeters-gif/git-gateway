import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    // Verify admin status via the admin-query Edge Function
    // If it returns 403, user is not admin
    supabase.functions
      .invoke("admin-query", { body: { action: "stats" } })
      .then(({ data, error }) => {
        setIsAdmin(!error && !!data);
      })
      .catch(() => setIsAdmin(false));
  }, [user]);

  if (isLoading || isAdmin === null) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
