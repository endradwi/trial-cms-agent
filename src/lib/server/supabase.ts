import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY } from '$app/env/private';

// ponytail: server-only client pakai publishable key + RLS terbuka. Ganti ke SUPABASE_SECRET_KEY + RLS ketat saat auth dipasang.
export const supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY || PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false }
});
