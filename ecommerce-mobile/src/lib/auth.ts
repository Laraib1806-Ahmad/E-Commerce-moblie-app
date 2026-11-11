import type { Session } from "@supabase/supabase-js";
import type { User } from "@/store/authSlice";
import { supabase } from "./supabase";

export function toAppUser(session: Session): User {
  const u = session.user;
  return {
    id: u.id,
    name: (u.user_metadata?.name as string) ?? u.email?.split("@")[0] ?? "User",
    email: u.email ?? "",

    role: u.app_metadata?.role === "admin" ? "admin" : "user",
  };
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signUp(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw new Error(error.message);
  return data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}
