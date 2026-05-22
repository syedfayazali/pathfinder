import { useMemo, useState } from "react";
import { Download, Plus, Search, Trash2 } from "lucide-react";
import { useApplications } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { ApplicationForm } from "@/components/applications/ApplicationForm";
import { CompanyLogo } from "@/components/applications/CompanyLogo";
import { EmailScanner } from "@/components/integrations/EmailScanner";
import { STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { JobApplication } from "@/types";

export function Applications() {
  const { items, loading, upsert, remove } = useApplications();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = [...items];
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.company_name.toLowerCase().includes(q) ||
          a.role_title.toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, search, statusFilter]);

  const exportCsv = () => {
    const headers = ["Company", "Role", "Status", "Location", "Applied", "Source"];
    const rows = filtered.map((a) =>
      [a.company_name, a.role_title, a.status, a.location, a.applied_date, a.source]
        .map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "job-applications.csv";
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Applications</h1>
          <p className="mt-1 text-muted-foreground">{items.length} total applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <ApplicationForm
            onSave={(d) => upsert(d as Partial<JobApplication>)}
            trigger={
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-40">
          <option value="all">All Status</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <EmailScanner onImport={(d) => upsert(d as Partial<JobApplication>)} />

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Company</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 hidden md:table-cell">Applied</th>
              <th className="p-4 w-24" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-t border-border hover:bg-accent/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <CompanyLogo logoUrl={a.company_logo_url} companyName={a.company_name} size="md" />
                    <span className="font-medium">{a.company_name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{a.role_title}</td>
                <td className="p-4">
                  <StatusBadge status={a.status} />
                </td>
                <td className="p-4 hidden text-muted-foreground md:table-cell">
                  {formatDate(a.applied_date)}
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <ApplicationForm
                      initial={a}
                      onSave={(d) => upsert(d as Partial<JobApplication>)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      }
                    />
                    <Button variant="ghost" size="icon" onClick={() => remove(a.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">No applications yet.</p>
        )}
      </div>
    </div>
  );
}
