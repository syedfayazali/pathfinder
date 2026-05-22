import { useState } from "react";
import { Sparkles, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { scanEmailContent } from "@/services/aiEmailScanner";
import type { ApplicationStatus, EmailDetection, JobApplication } from "@/types";

export function EmailScanner({
  onImport,
}: {
  onImport: (app: Partial<JobApplication>) => Promise<void>;
}) {
  const [tab, setTab] = useState<"paste" | "auto">("paste");
  const [text, setText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<EmailDetection[] | null>(null);
  const [imported, setImported] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const scan = async () => {
    setScanning(true);
    try {
      const results = await scanEmailContent(text);
      setDetected(results);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Scan failed");
      setDetected([]);
    } finally {
      setScanning(false);
    }
  };

  const importOne = async (d: EmailDetection, index: number) => {
    const status: ApplicationStatus =
      d.status === "unknown" ? "applied" : (d.status as ApplicationStatus);
    try {
      await onImport({
        company_name: d.company_name,
        role_title: d.role ?? "Role TBD",
        status,
        notes: d.summary ?? "",
        interview_date: d.interview_date || null,
        applied_date: new Date().toISOString().slice(0, 10),
      });
      setImported((prev) => new Set([...prev, index]));
    } catch {
      /* toast in useData */
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Email Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex w-fit gap-1 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setTab("auto")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${tab === "auto" ? "bg-card shadow" : "text-muted-foreground"}`}
          >
            Gmail Quick Access
          </button>
          <button
            type="button"
            onClick={() => setTab("paste")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${tab === "paste" ? "bg-card shadow" : "text-muted-foreground"}`}
          >
            Paste Email
          </button>
        </div>
        {tab === "auto" ? (
          <p className="text-sm text-muted-foreground">
            Connect Gmail in Settings, then open recent emails from there. Or paste email content in the Paste tab.
          </p>
        ) : (
          <>
            <Textarea
              placeholder="Paste email content here..."
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={scan} disabled={scanning || !text.trim()} className="gap-2">
                <Mail className="h-4 w-4" />
                {scanning ? "Scanning..." : "Detect & Extract"}
              </Button>
              {text && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setText("");
                    setDetected(null);
                  }}
                  className="gap-1"
                >
                  <X className="h-3.5 w-3.5" /> Clear
                </Button>
              )}
            </div>
            {detected !== null && (
              <div className="space-y-2 pt-2">
                {detected.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No job application updates detected in this email.
                  </p>
                ) : (
                  detected.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium">{d.company_name}</p>
                        {d.role && <p className="text-sm text-muted-foreground">{d.role}</p>}
                        {d.summary && <p className="mt-1 text-xs text-muted-foreground">{d.summary}</p>}
                        <div className="mt-2">
                          <StatusBadge
                            status={
                              d.status === "unknown" ? "applied" : (d.status as ApplicationStatus)
                            }
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={imported.has(i)}
                        onClick={() => importOne(d, i)}
                      >
                        {imported.has(i) ? "Added" : "Add"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
