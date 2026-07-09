import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export const ALLOWED_EMAIL = "jtc.adm.br@gmail.com";
export const ALLOWED_PASSWORD = "Jardiel021.L";

type Ctx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({} as Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn: Ctx["signIn"] = async (email, password) => {
    if (email.trim().toLowerCase() !== ALLOWED_EMAIL) {
      return { error: "Acesso restrito. Credenciais inválidas." };
    }
    let { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error && /invalid login credentials/i.test(error.message)) {
      // First-time bootstrap: create the single allowed account.
      if (email === ALLOWED_EMAIL && password === ALLOWED_PASSWORD) {
        const up = await supabase.auth.signUp({ email, password });
        if (!up.error) {
          const retry = await supabase.auth.signInWithPassword({ email, password });
          error = retry.error;
        } else {
          return { error: up.error.message };
        }
      }
    }
    if (error) return { error: "Senha ou e-mail incorretos." };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthCtx.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
