import type { ApplicationStatus } from "@/types";

export const APP_NAME = "Pathfinder";

export const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/applications", label: "Applications", icon: "Briefcase" },
  { path: "/pipeline", label: "Pipeline", icon: "Kanban" },
  { path: "/companies", label: "Companies", icon: "Building2" },
  { path: "/contacts", label: "Contacts", icon: "Users" },
  { path: "/documents", label: "Documents", icon: "FileText" },
  { path: "/settings", label: "Settings", icon: "Settings" },
] as const;

export const STATUSES: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "applied", label: "Applied", color: "bg-blue-500/20 text-blue-300" },
  { value: "interview", label: "Interview", color: "bg-amber-500/20 text-amber-300" },
  { value: "offer", label: "Offer", color: "bg-emerald-500/20 text-emerald-300" },
  { value: "rejected", label: "Rejected", color: "bg-red-500/20 text-red-300" },
  { value: "accepted", label: "Accepted", color: "bg-violet-500/20 text-violet-300" },
];

export const JOB_SOURCES = [
  "LinkedIn",
  "Indeed",
  "Glassdoor",
  "ZipRecruiter",
  "Monster",
  "Naukri",
  "Naukri Gulf",
  "Bayt",
  "Referral",
  "Company Website",
  "Other",
];

export const REMOTE_TYPES = ["Remote", "Hybrid", "Onsite"];

export const DOC_TYPES = [
  "Resume",
  "Cover Letter",
  "Offer Letter",
  "Experience Letter",
  "Certificate",
  "Other",
];

export const CONTACT_TYPES = ["Recruiter", "HR", "Manager", "Reference", "Other"];
