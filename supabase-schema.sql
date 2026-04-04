-- ═══════════════════════════════════════════
-- GOLTIDO — Database Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor → New query)
-- ═══════════════════════════════════════════

-- 1. PROFILES — user display info
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read all profiles"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. GAME RESULTS — each completed game session
create table public.game_results (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  game_mode text not null,  -- 'minute', 'score', 'scorer', 'transfer', 'learn', 'stadium'
  total_score int not null default 0,
  rounds_played int not null default 0,
  rounds_correct int not null default 0,
  details jsonb default '[]',  -- array of per-round details
  played_at timestamptz default now()
);

alter table public.game_results enable row level security;

create policy "Users can read all results"
  on public.game_results for select using (true);

create policy "Users can insert own results"
  on public.game_results for insert with check (auth.uid() = user_id);


-- 3. LEADERBOARD VIEW — best score per user per mode
create or replace view public.leaderboard as
select
  gr.user_id,
  p.display_name,
  gr.game_mode,
  max(gr.total_score) as best_score,
  count(*) as games_played,
  max(gr.played_at) as last_played
from public.game_results gr
join public.profiles p on p.id = gr.user_id
group by gr.user_id, p.display_name, gr.game_mode;


-- 4. LEARN PROGRESS — per-category learning stats
create table public.learn_progress (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  questions_answered int not null default 0,
  questions_correct int not null default 0,
  best_streak int not null default 0,
  updated_at timestamptz default now(),
  unique(user_id, category)
);

alter table public.learn_progress enable row level security;

create policy "Users can read own learn progress"
  on public.learn_progress for select using (auth.uid() = user_id);

create policy "Users can insert own learn progress"
  on public.learn_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own learn progress"
  on public.learn_progress for update using (auth.uid() = user_id);


-- 5. USER STATS VIEW — aggregated profile stats
create or replace view public.user_stats as
select
  p.id as user_id,
  p.display_name,
  count(gr.id) as total_games,
  coalesce(round(avg(gr.total_score), 0), 0) as avg_score,
  coalesce(max(gr.total_score), 0) as best_score,
  (select game_mode from public.game_results where user_id = p.id group by game_mode order by count(*) desc limit 1) as favorite_mode,
  min(gr.played_at) as first_game,
  max(gr.played_at) as last_game
from public.profiles p
left join public.game_results gr on gr.user_id = p.id
group by p.id, p.display_name;


-- 6. INDEXES
create index idx_game_results_user on public.game_results(user_id);
create index idx_game_results_mode on public.game_results(game_mode);
create index idx_game_results_score on public.game_results(total_score desc);
create index idx_learn_progress_user on public.learn_progress(user_id);
