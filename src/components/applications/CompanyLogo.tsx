import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

export function CompanyLogo({
  logoUrl,
  companyName,
  size = "md",
  className,
}: {
  logoUrl?: string | null;
  companyName: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const dim = sizes[size];

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${companyName} logo`}
        className={cn("shrink-0 rounded-lg border border-border object-cover bg-card", dim, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-border bg-muted font-semibold text-muted-foreground",
        dim,
        className,
      )}
      title={companyName}
    >
      {companyName.trim() ? initials(companyName) : <Building2 className="h-1/2 w-1/2" />}
    </div>
  );
}
