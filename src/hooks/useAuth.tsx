import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { localStore } from "@/lib/localStore";
import type { Profile } from "@/types";

interface AuthUser {
  id: string;
  email: string;
  display_name?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  mode: "supabase" | "local";
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const mode: "supabase" | "local" = isSupabaseConfigured ? "supabase" : "local";

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    if (mode === "supabase" && supabase) {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setProfile(data as Profile);
        return;
      }
      if (error?.code === "PGRST205" || !data) {
        const stored = localStore.get();
        if (!stored.profile || stored.profile.id !== user.id) {
          stored.profile = {
            id: user.id,
            email: user.email,
            display_name: user.display_name ?? user.email.split("@")[0],
            avatar_url: null,
            employment_status: null,
            target_role: null,
            target_company: null,
            linkedin_url: null,
          };
          localStore.set(stored);
        }
        setProfile(stored.profile);
      }
    } else {
      const data = localStore.get();
      setProfile(data.profile);
    }
  }, [user, mode]);

  useEffect(() => {
    async function init() {
      if (mode === "supabase" && supabase) {
        const { data } = await supabase.auth.getSession();
        const s = data.session;
        if (s?.user) {
          setUser({
            id: s.user.id,
            email: s.user.email ?? "",
            display_name: s.user.user_metadata?.full_name,
          });
        }
        supabase.auth.onAuthStateChange((_e, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email ?? "",
              display_name: session.user.user_metadata?.full_name,
            });
          } else setUser(null);
        });
      } else {
        const uid = localStore.uid();
        const data = localStore.get();
        if (!data.profile) {
          data.profile = {
            id: uid,
            email: "demo@local.dev",
            display_name: "Demo User",
            avatar_url: null,
            employment_status: "On the Hunt",
            target_role: null,
            target_company: null,
            linkedin_url: null,
          };
          localStore.set(data);
        }
        setUser({ id: uid, email: data.profile!.email ?? "", display_name: data.profile!.display_name });
        setProfile(data.profile);
      }
      setLoading(false);
    }
    init();
  }, [mode]);

  useEffect(() => {
    if (user) refreshProfile();
  }, [user, refreshProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (mode === "supabase" && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const u = data.user;
        if (u) {
          setUser({
            id: u.id,
            email: u.email ?? email,
            display_name: u.user_metadata?.full_name,
          });
        }
      } else {
        const uid = localStore.uid();
        const data = localStore.get();
        data.profile = {
          id: uid,
          email,
          display_name: email.split("@")[0],
          avatar_url: null,
          employment_status: null,
          target_role: null,
          target_company: null,
          linkedin_url: null,
        };
        localStore.set(data);
        setUser({ id: uid, email, display_name: data.profile.display_name });
        setProfile(data.profile);
      }
    },
    [mode],
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      if (mode === "supabase" && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        if (data.user && data.session) {
          setUser({
            id: data.user.id,
            email: data.user.email ?? email,
            display_name: name ?? data.user.user_metadata?.full_name,
          });
        } else if (data.user && !data.session) {
          throw new Error(
            "Check your email to confirm your account, then sign in. (Or disable email confirmation in Supabase → Authentication → Providers → Email)",
          );
        }
      } else {
        await signIn(email, password);
      }
    },
    [mode, signIn],
  );

  const signOut = useCallback(async () => {
    if (mode === "supabase" && supabase) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [mode]);

  const value = useMemo(
    () => ({ user, profile, loading, mode, signIn, signUp, signOut, refreshProfile }),
    [user, profile, loading, mode, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
