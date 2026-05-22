import { NavLink, Outlet } from "react-router-dom";
import {
  Briefcase,
  Building2,
  FileText,
  Kanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useDbStatus } from "@/hooks/useDbStatus";
import { SetupBanner } from "@/components/layout/SetupBanner";
import { Button } from "@/components/ui/button";

const icons: Record<string, React.ElementType> = {
  LayoutDashboard,
  Briefcase,
  Kanban,
  Building2,
  Users,
  FileText,
  Settings,
};

const nav = [
  { path: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/applications", label: "Applications", icon: "Briefcase" },
  { path: "/pipeline", label: "Pipeline", icon: "Kanban" },
  { path: "/companies", label: "Companies", icon: "Building2" },
  { path: "/contacts", label: "Contacts", icon: "Users" },
  { path: "/documents", label: "Documents", icon: "FileText" },
  { path: "/settings", label: "Settings", icon: "Settings" },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const { dataMode } = useDbStatus();
  const name = user?.display_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border bg-card/50 p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Compass className="h-8 w-8 text-primary" />
          <div>
            <p className="font-bold tracking-tight">{APP_NAME}</p>
            <p className="text-xs text-muted-foreground">Job Tracker</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const Icon = icons[item.icon];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <p className="truncate px-2 text-xs text-muted-foreground">Good to see you, {name}</p>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start gap-2" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-4 pb-24 md:p-8 md:pb-8">
        <SetupBanner />
        {dataMode === "local" && (
          <p className="mb-4 text-xs text-muted-foreground">
            Data stored in this browser (local mode).
          </p>
        )}
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card/95 px-1 py-2 backdrop-blur md:hidden">
        {nav.slice(0, 5).map((item) => {
          const Icon = icons[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </NavLink>
          );
        })}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium",
              isActive ? "text-primary" : "text-muted-foreground",
            )
          }
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
}
