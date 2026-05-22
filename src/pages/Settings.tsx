import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useResumes } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { localStore } from "@/lib/localStore";
import {
  isGmailConfigured,
  startGmailOAuth,
  parseGmailTokenFromHash,
  fetchRecentEmails,
} from "@/services/gmail";
import { useToast } from "@/components/ui/toast";
import { useDbStatus } from "@/hooks/useDbStatus";
import type { Profile } from "@/types";

export function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const { dataMode } = useDbStatus();
  const { toast } = useToast();
  const { items: resumes, upsert: upsertResume } = useResumes();
  const [form, setForm] = useState<Partial<Profile>>(profile ?? {});
  const [gmailToken, setGmailToken] = useState<string | null>(
    () => localStorage.getItem("pathfinder-gmail-token"),
  );
  const [emails, setEmails] = useState<{ subject: string; from: string; snippet: string }[]>([]);

  useEffect(() => {
    const token = parseGmailTokenFromHash();
    if (token) {
      localStorage.setItem("pathfinder-gmail-token", token);
      setGmailToken(token);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const saveProfile = async () => {
    try {
      if (dataMode === "cloud" && supabase && user) {
        const { error } = await supabase
          .from("profiles")
          .upsert({ id: user.id, ...form, updated_at: new Date().toISOString() });
        if (error) throw error;
      } else {
        const data = localStore.get();
        data.profile = { ...data.profile!, id: user!.id, ...form } as Profile;
        localStore.set(data);
      }
      await refreshProfile();
      toast("Profile saved", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to save profile");
    }
  };

  const loadGmail = async () => {
    if (!gmailToken) return;
    try {
      const list = await fetchRecentEmails(gmailToken);
      setEmails(list);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Gmail load failed");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              value={form.display_name ?? ""}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Employment Status</Label>
            <Select
              value={form.employment_status ?? ""}
              onChange={(e) => setForm({ ...form, employment_status: e.target.value })}
            >
              <option value="">—</option>
              <option value="On the Hunt">On the Hunt</option>
              <option value="Employed">Employed</option>
              <option value="Freelance">Freelance</option>
              <option value="Career Break">Career Break</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Target Role</Label>
            <Input
              value={form.target_role ?? ""}
              onChange={(e) => setForm({ ...form, target_role: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Target Company</Label>
            <Input
              value={form.target_company ?? ""}
              onChange={(e) => setForm({ ...form, target_company: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn URL</Label>
            <Input
              value={form.linkedin_url ?? ""}
              onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
            />
          </div>
          <Button onClick={saveProfile}>Save Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gmail Quick Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isGmailConfigured() ? (
            <p className="text-sm text-muted-foreground">
              Add <code className="text-xs">VITE_GOOGLE_CLIENT_ID</code> to .env and enable Gmail API in Google Cloud.
            </p>
          ) : (
            <>
              <Button onClick={() => startGmailOAuth()}>Connect Gmail</Button>
              {gmailToken && (
                <Button variant="outline" onClick={loadGmail}>
                  Load recent emails
                </Button>
              )}
              <ul className="space-y-2 text-sm">
                {emails.map((e) => (
                  <li key={e.subject} className="rounded border border-border p-2">
                    <strong>{e.subject}</strong>
                    <p className="text-xs text-muted-foreground">{e.from}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <ResumeBuilder resumes={resumes} onSave={(d) => upsertResume(d)} />

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Supabase:</strong>{" "}
            {isSupabaseConfigured ? "Connected" : "Not configured — using local storage demo mode"}
          </p>
          <p>
            <strong>AI Email Scanner:</strong> Set VITE_OPENAI_API_KEY for OpenAI-powered detection
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
