import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (v: string | undefined) => v || undefined;

export const variables = defineEnvVars({
  PUBLIC_SUPABASE_URL: { description: 'Supabase project URL' },
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: { description: 'Supabase publishable (anon) key' },
  SUPABASE_SECRET_KEY: { schema: optional, description: 'Optional service key; enables strict RLS later' },
  TELEGRAM_ALERT_BOT_TOKEN: { schema: optional, description: 'Bot token for upload alerts' },
  TELEGRAM_ALERT_CHAT_ID: { schema: optional, description: 'Chat ID receiving upload alerts' }
});
