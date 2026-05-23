## LittleNest Live Keys

Use these exact names.

| Where | Key name | What to put |
| --- | --- | --- |
| Expo app env file | `EXPO_PUBLIC_SUPABASE_URL` | `https://lolesbmajbrhbsmvxgos.supabase.co` |
| Expo app env file | `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable key |
| Supabase Edge Function secrets | `OPENAI_API_KEY` | Your OpenAI API key |
| Supabase Edge Function secrets | `GEMINI_API_KEY` | Your Gemini API key |
| Supabase Edge Function secrets | `OPENAI_MODEL` | `gpt-5-mini` |
| Supabase Edge Function secrets | `GEMINI_MODEL` | `gemini-2.5-flash` |

Dashboard pages:

- Supabase project: https://supabase.com/dashboard/project/lolesbmajbrhbsmvxgos
- Supabase API keys: https://supabase.com/dashboard/project/lolesbmajbrhbsmvxgos/settings/api-keys
- Supabase Edge Function secrets: https://supabase.com/dashboard/project/lolesbmajbrhbsmvxgos/functions/secrets
- OpenAI keys: https://platform.openai.com/api-keys
- Gemini keys: https://aistudio.google.com/app/apikey

Important:

- `apps/mobile/.env.local` is for your local Expo app.
- `supabase/functions/.env` is only for local function testing on this machine.
- For the live hosted Supabase project, you still need to add `OPENAI_API_KEY` and `GEMINI_API_KEY` in the Supabase dashboard secrets page.
