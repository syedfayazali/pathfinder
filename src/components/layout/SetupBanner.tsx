import { AlertTriangle, RefreshCw } from "lucide-react";
import { useDbStatus } from "@/hooks/useDbStatus";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export function SetupBanner() {
  const { dbReady, dbError, dataMode, recheck } = useDbStatus();

  if (!isSupabaseConfigured || dbReady) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <p className="font-medium text-amber-100">Database not set up</p>
          <p className="mt-1 text-sm text-amber-200/90">
            {dbError ?? "Run the SQL schema in your Supabase project."}
          </p>
          <p className="mt-1 text-xs text-amber-200/70">
            Using local storage for now ({dataMode} mode). Data will not sync until tables exist.
          </p>
          <ol className="mt-2 list-decimal pl-4 text-xs text-amber-200/80">
            <li>Open Supabase Dashboard → SQL Editor</li>
            <li>Paste and run <code className="rounded bg-black/30 px-1">supabase/schema.sql</code></li>
            <li>Click Recheck below</li>
          </ol>
        </div>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 gap-2" onClick={() => recheck()}>
        <RefreshCw className="h-4 w-4" /> Recheck database
      </Button>
    </div>
  );
}
