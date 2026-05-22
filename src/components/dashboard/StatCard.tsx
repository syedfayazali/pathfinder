import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const colorMap = {
  primary: "from-violet-500/10 to-violet-500/5 text-violet-400",
  amber: "from-amber-500/10 to-amber-500/5 text-amber-400",
  green: "from-emerald-500/10 to-emerald-500/5 text-emerald-400",
  red: "from-red-500/10 to-red-500/5 text-red-400",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color = "primary",
  index = 0,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: keyof typeof colorMap;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="glass rounded-2xl p-5 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={cn("rounded-xl bg-gradient-to-br p-3", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
