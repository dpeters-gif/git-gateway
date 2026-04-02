import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type UserRole = "adult" | "child" | "baby";

interface Profile {
  id: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  locale: string;
  onboarding_completed: boolean;
  sound_enabled: boolean;
  sound_volume: number;
  username: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isChild: boolean;
  childToken: string | null;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInChild: (username: string, pin: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isChild: false,
    childToken: null,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data as Profile | null;
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          // CRITICAL: Don't call Supabase inside the callback synchronously
          // to avoid auth deadlock. Use setTimeout(0).
          setTimeout(async () => {
            if (!mounted) return;
            const profile = await fetchProfile(session.user.id);
            if (mounted) {
              setState({
                user: session.user,
                session,
                profile,
                isLoading: false,
                isChild: profile?.role === "child",
                childToken: null,
              });
            }
          }, 0);
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isChild: false,
            childToken: null,
          });
        }
      }
    );

    // 2. THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) {
          setState({
            user: session.user,
            session,
            profile,
            isLoading: false,
            isChild: profile?.role === "child",
            childToken: null,
          });
        }
      } else {
        if (mounted) {
          setState(s => ({ ...s, isLoading: false }));
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    // Don't navigate here — let onAuthStateChange + ProtectedRoute handle it
    return { error: error?.message ?? null };
  };

  const signInChild = async (username: string, pin: string) => {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPin = pin.trim();

    try {
      const { data, error } = await supabase.functions.invoke("child-auth", {
        body: { username: normalizedUsername, pin: normalizedPin },
      });

      if (error) {
        const response = (error as { context?: Response }).context;
        if (response instanceof Response) {
          const payload = await response.json().catch(() => null);
          return {
            error:
              payload?.error?.message ??
              payload?.error ??
              error.message ??
              "Anmeldung fehlgeschlagen",
          };
        }

        return { error: error.message || "Anmeldung fehlgeschlagen" };
      }

      if (!data?.success) {
        return { error: data?.error?.message || data?.error || "Anmeldung fehlgeschlagen" };
      }

      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      // Don't navigate — let onAuthStateChange handle it
      return { error: null };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "Anmeldung fehlgeschlagen" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isChild: false,
      childToken: null,
    });
  };

  const refreshProfile = async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState(s => ({ ...s, profile }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signInChild, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
