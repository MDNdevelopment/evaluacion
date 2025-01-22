import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = "https://faaqjemovtyulorpdgrd.supabase.co";
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    storage: localStorage,
  },
});
