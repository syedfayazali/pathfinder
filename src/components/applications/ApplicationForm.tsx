import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { LogoUpload } from "@/components/applications/LogoUpload";
import { JOB_SOURCES, REMOTE_TYPES, STATUSES } from "@/lib/constants";
import type { JobApplication } from "@/types";

type FormData = Partial<JobApplication>;

const emptyForm: FormData = {
  company_name: "",
  company_logo_url: null,
  role_title: "",
  status: "applied",
};

export function ApplicationForm({
  initial,
  onSave,
  trigger,
}: {
  initial?: JobApplication | null;
  onSave: (data: FormData) => Promise<void>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              company_name: initial.company_name,
              company_logo_url: initial.company_logo_url ?? null,
              role_title: initial.role_title,
              status: initial.status,
              location: initial.location ?? "",
              salary: initial.salary ?? "",
              job_url: initial.job_url ?? "",
              source: initial.source ?? "",
              remote_type: initial.remote_type ?? "",
              applied_date: initial.applied_date ?? "",
              notes: initial.notes ?? "",
            }
          : { ...emptyForm },
      );
    }
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name?.trim() || !form.role_title?.trim()) {
      toast("Company and role are required");
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...form, id: initial?.id });
      setOpen(false);
    } catch {
      /* toast shown in useData */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={initial ? "Edit Application" : "Add Application"}>
        <form onSubmit={submit} className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Company *</Label>
              <Input
                required
                value={form.company_name ?? ""}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              />
            </div>
            <LogoUpload
              value={form.company_logo_url}
              onChange={(url) => setForm({ ...form, company_logo_url: url })}
              companyName={form.company_name ?? ""}
            />
            <div className="space-y-2 sm:col-span-2">
              <Label>Role / Position *</Label>
              <Input
                required
                value={form.role_title ?? ""}
                onChange={(e) => setForm({ ...form, role_title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status ?? "applied"}
                onChange={(e) => setForm({ ...form, status: e.target.value as JobApplication["status"] })}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Applied Via</Label>
              <Select
                value={form.source ?? ""}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              >
                <option value="">—</option>
                {JOB_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={form.location ?? ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Remote</Label>
              <Select
                value={form.remote_type ?? ""}
                onChange={(e) => setForm({ ...form, remote_type: e.target.value })}
              >
                <option value="">—</option>
                {REMOTE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Salary (optional)</Label>
              <Input
                value={form.salary ?? ""}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Application Date</Label>
              <Input
                type="date"
                value={form.applied_date?.slice(0, 10) ?? ""}
                onChange={(e) => setForm({ ...form, applied_date: e.target.value || null })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Job URL</Label>
              <Input
                type="url"
                value={form.job_url ?? ""}
                onChange={(e) => setForm({ ...form, job_url: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : initial ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
