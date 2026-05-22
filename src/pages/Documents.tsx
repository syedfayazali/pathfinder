import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, Upload } from "lucide-react";
import { useDocuments } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DOC_TYPES } from "@/lib/constants";
import type { Document } from "@/types";

export function Documents() {
  const { items, loading, upsert, remove } = useDocuments();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", doc_type: "Resume", file_url: "" });
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const save = async () => {
    if (!form.name.trim()) {
      toast("Document name is required");
      return;
    }
    try {
      await upsert(form);
      setForm({ name: "", doc_type: "Resume", file_url: "" });
      setOpen(false);
    } catch {
      /* toast in useData */
    }
  };

  const onFile = async (file: File) => {
    setUploading(true);
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, name: file.name, file_url: url }));
    setUploading(false);
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
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">PDF, Images, Documents</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Upload
            </Button>
          </DialogTrigger>
          <DialogContent title="Upload Document">
            <div className="mt-4 space-y-4">
              <label className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-border p-8 hover:bg-accent/50">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-sm">Drag & drop or click to upload</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                />
              </label>
              {uploading && <p className="text-sm">Uploading...</p>}
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select
                  value={form.doc_type}
                  onChange={(e) => setForm({ ...form, doc_type: e.target.value })}
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
              <Button onClick={save}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d: Document) => (
          <div key={d.id} className="rounded-xl border border-border p-4">
            <p className="font-medium">{d.name}</p>
            <p className="text-xs text-muted-foreground">{d.doc_type}</p>
            {d.file_url && (
              <a href={d.file_url} target="_blank" rel="noreferrer" className="mt-2 text-sm text-primary hover:underline">
                Open
              </a>
            )}
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => remove(d.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
