-- Run if you already created tables without company_logo_url
alter table public.job_applications
  add column if not exists company_logo_url text;
