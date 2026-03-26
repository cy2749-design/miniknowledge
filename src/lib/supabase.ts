// Supabase client placeholder
// The app works fully with localStorage until these env vars are set.
//
// To connect Supabase:
// 1. Create a project at https://supabase.com
// 2. Run the SQL from src/types/database.ts in the Supabase SQL editor
// 3. Add to .env.local:
//    VITE_SUPABASE_URL=https://xxxx.supabase.co
//    VITE_SUPABASE_ANON_KEY=eyJ...
// 4. Add the same vars in Vercel dashboard → Settings → Environment Variables

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase: SupabaseClient | null = url && key
  ? createClient(url, key)
  : null

export const isSupabaseEnabled = !!supabase

// Dev hint
console.info(`[MiniKnowledge] Storage: ${isSupabaseEnabled ? 'Supabase ✓' : 'localStorage (no Supabase env vars)'}`)
