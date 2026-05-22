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

export type DataMode = "cloud" | "local";

interface DbStatusContextValue {
  dataMode: DataMode;
  dbReady: boolean;
  dbError: string | null;
  recheck: () => Promise<void>;
}

const DbStatusContext = createContext<DbStatusContextValue | null>(null);

export function DbStatusProvider({ children }: { children: ReactNode }) {
  const [dbReady, setDbReady] = useState(!isSupabaseConfigured);
  const [dbError, setDbError] = useState<string | null>(null);

  const recheck = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setDbReady(true);
      setDbError(null);
      return;
    }
    const { error } = await supabase.from("job_applications").select("id").limit(1);
    if (error) {
      const missing =
        error.code === "PGRST205" ||
        error.message?.includes("Could not find the table");
      if (missing) {
        setDbReady(false);
        setDbError(
          "Database tables not found. Open Supabase → SQL Editor → run supabase/schema.sql",
        );
      } else {
        setDbReady(false);
        setDbError(error.message);
      }
      return;
    }
    setDbReady(true);
    setDbError(null);
  }, []);

  useEffect(() => {
    recheck();
  }, [recheck]);

  const dataMode: DataMode = isSupabaseConfigured && dbReady ? "cloud" : "local";

  const value = useMemo(
    () => ({ dataMode, dbReady, dbError, recheck }),
    [dataMode, dbReady, dbError, recheck],
  );

  return <DbStatusContext.Provider value={value}>{children}</DbStatusContext.Provider>;
}

export function useDbStatus() {
  const ctx = useContext(DbStatusContext);
  if (!ctx) throw new Error("useDbStatus must be used within DbStatusProvider");
  return ctx;
}
