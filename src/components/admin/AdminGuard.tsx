import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAILS_ENV = import.meta.env.VITE_ADMIN_EMAILS || "";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    // Get email from auth
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email?.toLowerCase() || null);
      setChecking(false);
    });
  }, [user]);

  if (isLoading || checking) return null;
  if (!user) return <Navigate to="/login" replace />;

  // Check against env var and also allow dwp@gmail.com as hardcoded fallback
  const allowedEmails = ADMIN_EMAILS_ENV
    .split(",")
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!email || !allowedEmails.includes(email)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
