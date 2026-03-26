-- MiniKnowledge v2 — Supabase 建表 SQL
-- 在 Supabase 控制台 → SQL Editor 中粘贴并执行

-- 1. 用户资料表（依赖 Supabase Auth 内置的 auth.users）
create table if not exists profiles (
  id                 uuid references auth.users on delete cascade primary key,
  username           text,
  preferred_language text not null default 'en',
  created_at         timestamptz not null default now()
);

-- 用户注册后自动创建 profile
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2. 学习会话表
create table if not exists learning_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  title        text not null,
  source_type  text not null check (source_type in ('url', 'text')),
  source_url   text,
  source_text  text,
  language     text not null default 'en' check (language in ('en', 'zh')),
  status       text not null default 'in-progress' check (status in ('in-progress', 'completed')),
  score        integer,
  total_quiz   integer,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

-- 3. 卡片内容表
create table if not exists session_cards (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references learning_sessions(id) on delete cascade not null,
  card_index  integer not null,
  card_type   text not null check (card_type in ('content','quiz','review','trueFalse','output','complete')),
  card_data   jsonb not null,
  created_at  timestamptz not null default now(),
  unique (session_id, card_index)
);

-- 4. 深度解析 / 案例 / 总结
create table if not exists session_extras (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid references learning_sessions(id) on delete cascade not null unique,
  deeper_explanation  text,
  real_world_examples jsonb,
  session_summary     text,
  created_at          timestamptz not null default now()
);

-- 5. 用户答题记录
create table if not exists user_answers (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references learning_sessions(id) on delete cascade not null,
  card_index integer not null,
  selected   text not null,
  correct    boolean not null,
  created_at timestamptz not null default now(),
  unique (session_id, card_index)
);

-- Row Level Security（让用户只能看到自己的数据）
alter table profiles enable row level security;
alter table learning_sessions enable row level security;
alter table session_cards enable row level security;
alter table session_extras enable row level security;
alter table user_answers enable row level security;

create policy "Users can manage own profile"
  on profiles for all using (auth.uid() = id);

create policy "Users can manage own sessions"
  on learning_sessions for all using (auth.uid() = user_id);

create policy "Users can manage own cards"
  on session_cards for all
  using (exists (select 1 from learning_sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy "Users can manage own extras"
  on session_extras for all
  using (exists (select 1 from learning_sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy "Users can manage own answers"
  on user_answers for all
  using (exists (select 1 from learning_sessions s where s.id = session_id and s.user_id = auth.uid()));
