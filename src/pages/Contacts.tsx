import { Plus, Trash2 } from "lucide-react";
import { useContacts } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CONTACT_TYPES } from "@/lib/constants";
import type { Contact } from "@/types";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export function Contacts() {
  const { items, loading, upsert, remove } = useContacts();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Contact>>({ name: "", contact_type: "Recruiter" });
  const [open, setOpen] = useState(false);

  const save = async () => {
    if (!form.name?.trim()) {
      toast("Name is required");
      return;
    }
    try {
      await upsert(form);
      setForm({ name: "", contact_type: "Recruiter" });
      setOpen(false);
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
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">HR reps, recruiters & references</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent title="Add Contact">
            <ContactForm form={form} setForm={setForm} onSave={save} />
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">No contacts yet</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div key={c.id} className="rounded-xl border border-border p-4">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{c.contact_type}</p>
              {c.email && <p className="mt-2 text-sm">{c.email}</p>}
              {c.phone && <p className="text-sm text-muted-foreground">{c.phone}</p>}
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => remove(c.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactForm({
  form,
  setForm,
  onSave,
}: {
  form: Partial<Contact>;
  setForm: (f: Partial<Contact>) => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label>Name *</Label>
        <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select
          value={form.contact_type ?? "Recruiter"}
          onChange={(e) => setForm({ ...form, contact_type: e.target.value })}
        >
          {CONTACT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Phone / WhatsApp</Label>
        <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <Button onClick={onSave}>Save</Button>
    </div>
  );
}
