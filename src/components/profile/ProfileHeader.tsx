import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Clock, Search, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDbStatus } from "@/hooks/useDbStatus";
import { useToast } from "@/components/ui/toast";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { fileToAvatarDataUrl } from "@/lib/profileImage";
import { supabase } from "@/lib/supabase";
import { localStore } from "@/lib/localStore";
import type { Profile } from "@/types";

const STATUS_STYLES: Record<
  string,
  { label: string; bg: string; color: string; border: string; icon: typeof Search }
> = {
  "On the Hunt": {
    label: "On the Hunt",
    bg: "bg-violet-500/10",
    color: "text-violet-300",
    border: "border-violet-500/20",
    icon: Search,
  },
  Employed: {
    label: "Employed",
    bg: "bg-emerald-500/10",
    color: "text-emerald-300",
    border: "border-emerald-500/20",
    icon: Briefcase,
  },
  Freelance: {
    label: "Freelance",
    bg: "bg-blue-500/10",
    color: "text-blue-300",
    border: "border-blue-500/20",
    icon: Briefcase,
  },
  "Career Break": {
    label: "Career Break",
    bg: "bg-amber-500/10",
    color: "text-amber-300",
    border: "border-amber-500/20",
    icon: Clock,
  },
};

export function ProfileHeader() {
  const { user, profile, refreshProfile } = useAuth();
  const { dataMode } = useDbStatus();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const displayName = profile?.display_name || user?.display_name || "Welcome back!";
  const status = profile?.employment_status;
  const statusStyle = status ? STATUS_STYLES[status] : null;

  const saveAvatar = async (file: File) => {
    if (!user) return;
    try {
      const avatar_url = await fileToAvatarDataUrl(file);
      if (dataMode === "cloud" && supabase) {
        const { error } = await supabase
          .from("profiles")
          .upsert({ id: user.id, avatar_url, updated_at: new Date().toISOString() });
        if (error) throw error;
      } else {
        const data = localStore.get();
        data.profile = { ...data.profile!, id: user.id, avatar_url } as Profile;
        localStore.set(data);
      }
      await refreshProfile();
      toast("Profile photo updated", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed");
    }
  };

  const timeStr = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center"
    >
      <ProfileAvatar
        src={profile?.avatar_url}
        name={displayName}
        size="lg"
        editable
        onUpload={saveAvatar}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">Good to see you,</p>
        <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">{displayName}</h1>
        {statusStyle && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}
            >
              <statusStyle.icon className="h-3.5 w-3.5" />
              {statusStyle.label}
            </span>
            {status === "Employed" && (profile?.current_position || profile?.current_company) && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
                {[profile?.current_position, profile?.current_company].filter(Boolean).join(" at ")}
              </span>
            )}
            {profile?.target_role && status === "On the Hunt" && (
              <span className="text-sm text-muted-foreground">
                Target: {profile.target_role}
                {profile.target_company ? ` @ ${profile.target_company}` : ""}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <p className="font-mono text-2xl font-semibold tabular-nums tracking-tight">{timeStr}</p>
        <p className="text-xs text-muted-foreground">{dateStr}</p>
        <Link
          to="/settings"
          className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Settings className="h-3.5 w-3.5" />
          Edit profile
        </Link>
      </div>
    </motion.div>
  );
}
