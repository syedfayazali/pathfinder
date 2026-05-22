import { Link } from "react-router-dom";
import { Briefcase, Calendar, TrendingUp, Trophy, XCircle } from "lucide-react";
import { useApplications } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CompanyLogo } from "@/components/applications/CompanyLogo";
import { EmailScanner } from "@/components/integrations/EmailScanner";

export function Dashboard() {
  const { profile } = useAuth();
  const { items, loading, upsert } = useApplications();

  const stats = {
    total: items.length,
    interviews: items.filter((a) => a.status === "interview").length,
    offers: items.filter((a) => a.status === "offer" || a.status === "accepted").length,
    rejections: items.filter((a) => a.status === "rejected").length,
  };

  const upcoming = items
    .filter((a) => a.interview_date && new Date(a.interview_date) >= new Date())
    .sort((a, b) => (a.interview_date! > b.interview_date! ? 1 : -1))
    .slice(0, 5);

  const recent = [...items]
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Good to see you, {profile?.display_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track your career journey with clarity and insight.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Applications", value: stats.total, icon: Briefcase },
          { label: "Interviews", value: stats.interviews, icon: Calendar },
          { label: "Offers", value: stats.offers, icon: Trophy },
          { label: "Rejections", value: stats.rejections, icon: XCircle },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/15 p-3">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" /> Upcoming Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming interviews</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      <CompanyLogo logoUrl={a.company_logo_url} companyName={a.company_name} size="sm" />
                      <span className="truncate">
                        <strong>{a.company_name}</strong> — {a.role_title}
                      </span>
                    </div>
                    <span className="shrink-0 text-muted-foreground">{formatDate(a.interview_date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <ul className="space-y-3">
                {recent.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      <CompanyLogo logoUrl={a.company_logo_url} companyName={a.company_name} size="sm" />
                      <span className="truncate">
                        {a.company_name} — {a.role_title}
                      </span>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
            <Link to="/applications" className="mt-4 inline-block text-sm text-primary hover:underline">
              View all applications →
            </Link>
          </CardContent>
        </Card>
      </div>

      <EmailScanner onImport={(data) => upsert(data as Parameters<typeof upsert>[0])} />
    </div>
  );
}
