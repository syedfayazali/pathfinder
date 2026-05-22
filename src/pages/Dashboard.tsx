import { motion } from "framer-motion";
import { Briefcase, Calendar, Trophy, XCircle } from "lucide-react";
import { useApplications } from "@/hooks/useData";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ApplicationTrend } from "@/components/dashboard/ApplicationTrend";
import { UpcomingInterviews, RecentActivity } from "@/components/dashboard/UpcomingInterviews";
import { EmailScanner } from "@/components/integrations/EmailScanner";

export function Dashboard() {
  const { items, loading, upsert } = useApplications();

  const stats = {
    total: items.length,
    interviews: items.filter((a) => a.status === "interview").length,
    offers: items.filter((a) => a.status === "offer" || a.status === "accepted").length,
    rejections: items.filter((a) => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProfileHeader />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Applications" value={stats.total} icon={Briefcase} color="primary" index={0} />
        <StatCard title="Interviews" value={stats.interviews} icon={Calendar} color="amber" index={1} />
        <StatCard title="Offers" value={stats.offers} icon={Trophy} color="green" index={2} />
        <StatCard title="Rejections" value={stats.rejections} icon={XCircle} color="red" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 lg:col-span-2"
        >
          <h2 className="mb-4 text-lg font-semibold">Application Trend</h2>
          <ApplicationTrend applications={items} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Upcoming Interviews</h2>
          <UpcomingInterviews applications={items} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <RecentActivity applications={items} />
      </motion.div>

      <EmailScanner onImport={(data) => upsert(data as Parameters<typeof upsert>[0])} />
    </div>
  );
}
