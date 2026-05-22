import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { CompanyLogo } from "@/components/applications/CompanyLogo";
import { formatDate } from "@/lib/utils";
import type { JobApplication } from "@/types";

export function UpcomingInterviews({ applications }: { applications: JobApplication[] }) {
  const upcoming = applications
    .filter((a) => a.interview_date && new Date(a.interview_date) >= new Date())
    .sort((a, b) => new Date(a.interview_date!).getTime() - new Date(b.interview_date!).getTime())
    .slice(0, 6);

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Calendar className="mb-2 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No upcoming interviews</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {upcoming.map((a) => (
        <li
          key={a.id}
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3"
        >
          <CompanyLogo logoUrl={a.company_logo_url} companyName={a.company_name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{a.company_name}</p>
            <p className="truncate text-xs text-muted-foreground">{a.role_title}</p>
          </div>
          <span className="shrink-0 text-xs font-medium text-primary">
            {formatDate(a.interview_date)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function RecentActivity({ applications }: { applications: JobApplication[] }) {
  const recent = [...applications]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  if (recent.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No recent activity</p>;
  }

  return (
    <>
      <ul className="space-y-3">
        {recent.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3"
          >
            <CompanyLogo logoUrl={a.company_logo_url} companyName={a.company_name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{a.company_name}</p>
              <p className="truncate text-xs capitalize text-muted-foreground">{a.status}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link to="/applications" className="mt-4 inline-block text-sm text-primary hover:underline">
        View all applications →
      </Link>
    </>
  );
}
