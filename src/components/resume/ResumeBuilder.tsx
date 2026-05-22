import { useState } from "react";
import { FileText, Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Resume, ResumeContent } from "@/types";

export function ResumeBuilder({
  resumes,
  onSave,
}: {
  resumes: Resume[];
  onSave: (data: Partial<Resume>) => Promise<void>;
}) {
  const [editing, setEditing] = useState<Resume | null>(resumes[0] ?? null);
  const [content, setContent] = useState<ResumeContent>(editing?.content ?? { summary: "", skills: [], experience: [] });

  const save = async () => {
    await onSave({
      id: editing?.id,
      title: editing?.title ?? "My Resume",
      content,
      is_default: true,
    });
  };

  const printResume = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>${editing?.title ?? "Resume"}</title>
      <style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;line-height:1.5}
      h1{font-size:24px}h2{font-size:14px;text-transform:uppercase;border-bottom:1px solid #ccc;margin-top:24px}
      ul{padding-left:20px}</style></head><body>
      <h1>${editing?.title ?? "Resume"}</h1>
      <p>${content.summary ?? ""}</p>
      <h2>Skills</h2><p>${(content.skills ?? []).join(" · ")}</p>
      <h2>Experience</h2>
      ${(content.experience ?? []).map((e) => `<p><strong>${e.position}</strong> — ${e.company}<br/>${e.description ?? ""}</p>`).join("")}
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 400);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume Builder
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={printResume} className="gap-1">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => {
              const r: Resume = {
                id: "",
                user_id: "",
                title: "New Resume",
                content: {},
                is_default: false,
                created_at: "",
                updated_at: "",
              };
              setEditing(r);
              setContent({ summary: "", skills: [], experience: [] });
            }}
          >
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumes.length === 0 && !editing ? (
          <p className="text-sm text-muted-foreground">No resumes yet. Create one to get started.</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Resume Title *</Label>
              <Input
                value={editing?.title ?? ""}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, title: e.target.value } : null))}
              />
            </div>
            <div className="space-y-2">
              <Label>Experience Summary</Label>
              <Textarea
                rows={4}
                value={content.summary ?? ""}
                onChange={(e) => setContent({ ...content, summary: e.target.value })}
                placeholder="Professional summary..."
              />
            </div>
            <div className="space-y-2">
              <Label>Skills (comma-separated)</Label>
              <Input
                value={(content.skills ?? []).join(", ")}
                onChange={(e) =>
                  setContent({
                    ...content,
                    skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Key Achievements / Description</Label>
              <Textarea
                rows={5}
                placeholder="• Led team of 5 engineers..."
                value={content.experience?.[0]?.description ?? ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    experience: [
                      {
                        company: "Current Company",
                        position: "Current Position",
                        description: e.target.value,
                      },
                    ],
                  })
                }
              />
            </div>
            <Button onClick={save}>Save Resume</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
