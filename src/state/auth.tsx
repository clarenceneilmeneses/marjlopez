import type { Session } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Profile, Staff } from "@/lib/types";

interface AuthState {
  session: Session | null;
  /** False until the stored session has been read — render nothing gated before then. */
  ready: boolean;
  staff: Staff | null;
  profile: Profile | null;
  /** Staff row looked up (or there is no session). */
  roleReady: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const uid = session?.user.id;

  const staff = useQuery({
    queryKey: ["me", "staff", uid],
    enabled: Boolean(uid),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("user_id", uid!)
        .eq("active", true)
        .maybeSingle();
      if (error) throw error;
      return (data as Staff | null) ?? null;
    },
  });

  const profile = useQuery({
    queryKey: ["me", "profile", uid],
    enabled: Boolean(uid),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid!)
        .maybeSingle();
      if (error) throw error;
      return (data as Profile | null) ?? null;
    },
  });

  const value: AuthState = {
    session,
    ready,
    staff: staff.data ?? null,
    profile: profile.data ?? null,
    roleReady: ready && (!uid || staff.isFetched),
    signOut: async () => {
      await supabase.auth.signOut();
      queryClient.clear();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
