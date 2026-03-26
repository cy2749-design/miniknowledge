// Supabase database schema types
// These mirror the SQL schema in the plan.
// Connect by setting VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY

export interface DbProfile {
  id: string              // uuid, references auth.users
  username: string | null
  preferred_language: 'en' | 'zh'
  created_at: string
}

export interface DbLearningSession {
  id: string
  user_id: string
  title: string
  source_type: 'url' | 'text'
  source_url: string | null
  source_text: string | null
  language: 'en' | 'zh'
  status: 'in-progress' | 'completed'
  score: number | null
  total_quiz: number | null
  created_at: string
  completed_at: string | null
}

export interface DbSessionCard {
  id: string
  session_id: string
  card_index: number
  card_type: 'content' | 'quiz' | 'review' | 'trueFalse' | 'output' | 'complete'
  card_data: Record<string, unknown>  // full card object as jsonb
  created_at: string
}

export interface DbSessionExtras {
  id: string
  session_id: string
  deeper_explanation: string | null
  real_world_examples: string[] | null
  session_summary: string | null
  created_at: string
}

export interface DbUserAnswer {
  id: string
  session_id: string
  card_index: number
  selected: string     // option letter or 'T'/'F'
  correct: boolean
  created_at: string
}

// Supabase SQL to create these tables:
// (Run in Supabase SQL editor)
//
// create table profiles (
//   id uuid references auth.users primary key,
//   username text,
//   preferred_language text default 'en',
//   created_at timestamptz default now()
// );
//
// create table learning_sessions (
//   id uuid primary key default gen_random_uuid(),
//   user_id uuid references profiles(id) on delete cascade,
//   title text not null,
//   source_type text not null,
//   source_url text,
//   source_text text,
//   language text default 'en',
//   status text default 'in-progress',
//   score integer,
//   total_quiz integer,
//   created_at timestamptz default now(),
//   completed_at timestamptz
// );
//
// create table session_cards (
//   id uuid primary key default gen_random_uuid(),
//   session_id uuid references learning_sessions(id) on delete cascade,
//   card_index integer not null,
//   card_type text not null,
//   card_data jsonb not null,
//   created_at timestamptz default now()
// );
//
// create table session_extras (
//   id uuid primary key default gen_random_uuid(),
//   session_id uuid references learning_sessions(id) on delete cascade,
//   deeper_explanation text,
//   real_world_examples jsonb,
//   session_summary text,
//   created_at timestamptz default now()
// );
//
// create table user_answers (
//   id uuid primary key default gen_random_uuid(),
//   session_id uuid references learning_sessions(id) on delete cascade,
//   card_index integer not null,
//   selected text not null,
//   correct boolean not null,
//   created_at timestamptz default now()
// );
