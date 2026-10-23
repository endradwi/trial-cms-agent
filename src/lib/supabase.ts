import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://xzspptnoaazsrffpxwvn.supabase.co';
const supabaseKey = process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ZwAhPYzVbH7L14Yb1vL1iw_r9rHqPss';

export const supabase = createClient(supabaseUrl, supabaseKey);
