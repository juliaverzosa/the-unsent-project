
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { isSupabaseConfigured, supabase } from "../lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const localSession = localStorage.getItem("unsent-demo-session");
      queueMicrotask(() => {
        if (localSession) setSession(JSON.parse(localSession));
        setLoading(false);
      });
      return undefined;
    }

    let mounted = true;

    const getInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error.message);
      }

      if (mounted) {
        setSession(data?.session ?? null);
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Continue as a guest to preview the app.");
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return data;
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Continue as a guest to preview the app.");
    }
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;

    return data;
  };

  const signInAsGuest = async () => {
    const createLocalGuestSession = () => {
      const localSession = {
        user: { id: "guest-local", email: "guest@local.unsent", is_anonymous: true },
      };
      localStorage.setItem("unsent-demo-session", JSON.stringify(localSession));
      setSession(localSession);
      return localSession;
    };

    if (!isSupabaseConfigured) {
      return createLocalGuestSession();
    }

    const { data, error } = await supabase.auth.signInAnonymously();

    if (!error) return data;

    const anonymousSignInDisabled =
      error.code === "anonymous_provider_disabled" ||
      error.message?.toLowerCase().includes("anonymous sign-ins are disabled");

    if (anonymousSignInDisabled) {
      console.warn("Supabase anonymous sign-ins are disabled. Using local guest mode.");
      return createLocalGuestSession();
    }

    throw error;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem("unsent-demo-session");
      setSession(null);
      return;
    }
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  };

  const isGuest =
    session?.user?.is_anonymous === true;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        isGuest,
        signUp,
        signIn,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
