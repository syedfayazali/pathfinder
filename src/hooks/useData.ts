import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { localStore, type LocalData } from "@/lib/localStore";
import { emptyToNull } from "@/lib/sanitize";
import { useAuth } from "@/hooks/useAuth";
import { useDbStatus } from "@/hooks/useDbStatus";
import { useToast } from "@/components/ui/toast";
import type {
  Company,
  Contact,
  Document,
  JobApplication,
  Resume,
  WorkExperienceRecord,
} from "@/types";

function useTable<T extends { id: string }>(table: string, localKey: keyof LocalData) {
  const { user } = useAuth();
  const { dataMode } = useDbStatus();
  const { toast } = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (dataMode === "cloud" && supabase) {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });
        if (error) throw error;
        setItems((data as T[]) ?? []);
      } else {
        const data = localStore.get();
        setItems((data[localKey] as unknown as T[]) ?? []);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load data";
      toast(msg);
      const data = localStore.get();
      setItems((data[localKey] as unknown as T[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, [user, dataMode, table, localKey, toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upsert = async (row: Partial<T> & { id?: string }) => {
    if (!user) {
      toast("Not signed in");
      return;
    }
    try {
      const cleaned = emptyToNull(row as Record<string, unknown>) as Partial<T> & { id?: string };

      if (dataMode === "cloud" && supabase) {
        const { id, ...rest } = cleaned;
        const payload = emptyToNull({
          ...rest,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        });
        if (id) {
          const { error } = await supabase.from(table).update(payload).eq("id", id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from(table).insert(payload);
          if (error) throw error;
        }
        toast("Saved", "success");
      } else {
        const data = localStore.get();
        const list = [...((data[localKey] as unknown as T[]) ?? [])];
        const now = new Date().toISOString();
        if (cleaned.id) {
          const i = list.findIndex((x) => x.id === cleaned.id);
          if (i >= 0) list[i] = { ...list[i], ...cleaned, updated_at: now } as T;
        } else {
          list.unshift({
            ...cleaned,
            id: crypto.randomUUID(),
            user_id: user.id,
            created_at: now,
            updated_at: now,
          } as unknown as T);
        }
        localStore.update({ [localKey]: list as unknown as LocalData[typeof localKey] });
        toast("Saved", "success");
      }
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      toast(msg);
      throw e;
    }
  };

  const remove = async (id: string) => {
    if (!user) return;
    try {
      if (dataMode === "cloud" && supabase) {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
        toast("Deleted", "success");
      } else {
        const data = localStore.get();
        const list = ((data[localKey] as unknown as T[]) ?? []).filter((x) => x.id !== id);
        localStore.update({ [localKey]: list as unknown as LocalData[typeof localKey] });
        toast("Deleted", "success");
      }
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return { items, loading, refresh, upsert, remove };
}

export function useApplications() {
  return useTable<JobApplication>("job_applications", "applications");
}

export function useCompanies() {
  return useTable<Company>("companies", "companies");
}

export function useContacts() {
  return useTable<Contact>("contacts", "contacts");
}

export function useDocuments() {
  return useTable<Document>("documents", "documents");
}

export function useResumes() {
  return useTable<Resume>("resumes", "resumes");
}

export function useWorkExperience() {
  return useTable<WorkExperienceRecord>("work_experience", "workExperience");
}
