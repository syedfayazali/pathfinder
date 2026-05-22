export type ApplicationStatus =
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "accepted";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  employment_status: string | null;
  target_role: string | null;
  target_company: string | null;
  linkedin_url: string | null;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  domain: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  company_id: string | null;
  company_name: string;
  company_logo_url: string | null;
  role_title: string;
  status: ApplicationStatus;
  location: string | null;
  salary: string | null;
  job_url: string | null;
  source: string | null;
  priority: string | null;
  remote_type: string | null;
  applied_date: string | null;
  interview_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  company_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  contact_type: string | null;
  linkedin_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  name: string;
  doc_type: string;
  file_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  content: ResumeContent;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResumeContent {
  summary?: string;
  skills?: string[];
  experience?: WorkExperience[];
  education?: EducationEntry[];
}

export interface WorkExperience {
  id?: string;
  company: string;
  position: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
}

export interface WorkExperienceRecord extends WorkExperience {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface EducationEntry {
  institution?: string;
  degree?: string;
  field?: string;
  end_date?: string;
}

export interface EmailDetection {
  company_name: string;
  role?: string;
  status: ApplicationStatus | "unknown";
  summary?: string;
  interview_date?: string;
}
