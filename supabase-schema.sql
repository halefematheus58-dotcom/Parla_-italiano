-- Rode este SQL no SQL Editor do seu projeto Supabase.
-- Cada usuário só pode ler e alterar o próprio progresso.
create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  streak integer not null default 0 check (streak >= 0),
  last_study_date date,
  lessons_completed jsonb not null default '[]'::jsonb,
  study_dates jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "Users can read own progress"
on public.progress for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own progress"
on public.progress for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own progress"
on public.progress for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on public.progress to authenticated;
