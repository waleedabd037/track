import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Missing Supabase environment variables. Check .env.local.');

// Server-only client. Never import this module into a client component.
export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
