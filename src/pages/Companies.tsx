import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCompanies } from "@/hooks/useData";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Company } from "@/types";

export function Companies() {
  const { items, loading, upsert, remove } = useCompanies();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Company | null>(null);
  const [form, setForm] = useState({ name: "", website: "", domain: "", notes: "" });
  const [addOpen, setAddOpen] = useState(false);

  const save = async () => {
    if (!form.name.trim()) {
      toast("Company name is required");
      return;
    }
    try {
      await upsert({ id: selected?.id, ...form });
      setForm({ name: "", website: "", domain: "", notes: "" });
      setAddOpen(false);
    } catch {
      /* toast in useData */
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-muted-foreground">{items.length} companies</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-1"
              onClick={() => {
                setSelected(null);
                setForm({ name: "", website: "", domain: "", notes: "" });
              }}
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent title="Add Company">
            <CompanyForm form={form} setForm={setForm} onSave={save} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          {items.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelected(c);
                setForm({
                  name: c.name,
                  website: c.website ?? "",
                  domain: c.domain ?? "",
                  notes: c.notes ?? "",
                });
              }}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                selected?.id === c.id ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
              }`}
            >
              <p className="font-medium">{c.name}</p>
              {c.website && <p className="truncate text-xs text-muted-foreground">{c.website}</p>}
            </button>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">No companies yet.</p>
          )}
        </div>
        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4 rounded-xl border border-border p-6">
              <CompanyForm form={form} setForm={setForm} onSave={save} />
              <Button variant="destructive" size="sm" onClick={() => remove(selected.id)}>
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Select a company to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CompanyForm({
  form,
  setForm,
  onSave,
}: {
  form: { name: string; website: string; domain: string; notes: string };
  setForm: (f: typeof form) => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-2 space-y-4">
      <div className="space-y-2">
        <Label>Company Name *</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label>Company Website</Label>
        <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Company Domain</Label>
        <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <Button type="button" onClick={onSave}>
        Save
      </Button>
    </div>
  );
}
