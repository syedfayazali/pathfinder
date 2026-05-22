import { useMemo } from "react";
import { format, subMonths, startOfMonth, parseISO, isValid } from "date-fns";
import type { JobApplication } from "@/types";

export function ApplicationTrend({ applications }: { applications: JobApplication[] }) {
  const data = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => startOfMonth(subMonths(new Date(), 5 - i)));
    return months.map((month) => {
      const key = format(month, "yyyy-MM");
      const count = applications.filter((a) => {
        const raw = a.applied_date || a.created_at;
        const d = typeof raw === "string" ? parseISO(raw.slice(0, 10)) : new Date(raw);
        return isValid(d) && format(d, "yyyy-MM") === key;
      }).length;
      return { label: format(month, "MMM"), count, key };
    });
  }, [applications]);

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex h-48 items-end justify-between gap-2 pt-4">
      {data.map((d) => (
        <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{d.count}</span>
          <div
            className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-primary/80 to-primary/30 transition-all"
            style={{ height: `${Math.max(8, (d.count / max) * 140)}px` }}
            title={`${d.count} applications`}
          />
          <span className="text-xs text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
