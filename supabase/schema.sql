-- Pathfinder job tracker schema (run in Supabase SQL Editor)

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  employment_status text,
  target_role text,
  target_company text,
  linkedin_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  website text,
  domain text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Job applications
create type public.application_status as enum (
  'applied', 'interview', 'offer', 'rejected', 'accepted'
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  company_name text not null,
  company_logo_url text,
  role_title text not null,
  status public.application_status not null default 'applied',
  location text,
  salary text,
  job_url text,
  source text,
  priority text,
  remote_type text,
  applied_date date,
  interview_date timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contacts
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  name text not null,
  email text,
  phone text,
  role text,
  contact_type text default 'recruiter',
  linkedin_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  doc_type text not null,
  file_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Resumes
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content jsonb default '{}',
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Work experience
create table if not exists public.work_experience (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  position text not null,
  start_date date,
  end_date date,
  is_current boolean default false,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.job_applications enable row level security;
alter table public.contacts enable row level security;
alter table public.documents enable row level security;
alter table public.resumes enable row level security;
alter table public.work_experience enable row level security;

create policy "Users own profiles" on public.profiles
  for all using (auth.uid() = id);

create policy "Users own companies" on public.companies
  for all using (auth.uid() = user_id);

create policy "Users own applications" on public.job_applications
  for all using (auth.uid() = user_id);

create policy "Users own contacts" on public.contacts
  for all using (auth.uid() = user_id);

create policy "Users own documents" on public.documents
  for all using (auth.uid() = user_id);

create policy "Users own resumes" on public.resumes
  for all using (auth.uid() = user_id);

create policy "Users own work_experience" on public.work_experience
  for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage bucket for documents (create in dashboard: documents, private)
-- policies: user can upload/read own files under user_id folder
