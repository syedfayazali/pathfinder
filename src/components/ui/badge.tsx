import { cn } from "@/lib/utils";
import { STATUSES } from "@/lib/constants";
import type { ApplicationStatus } from "@/types";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const s = STATUSES.find((x) => x.value === status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        s?.color ?? "bg-muted text-muted-foreground",
      )}
    >
      {s?.label ?? status}
    </span>
  );
}
