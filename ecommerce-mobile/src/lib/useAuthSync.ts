import { toAppUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { login, logout } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { useEffect, useState } from "react";

export function useAuthSync() {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) dispatch(login(toAppUser(data.session)));
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) dispatch(login(toAppUser(session)));
      else dispatch(logout());
    });
    return () => data.subscription.unsubscribe();
  }, [dispatch]);

  return ready;
}
