import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = "https://faaqjemovtyulorpdgrd.supabase.co";
const supabaseAnonKey: string =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYXFqZW1vdnR5dWxvcnBkZ3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5ODA4NDcsImV4cCI6MjA0MTU1Njg0N30.D1_Znkv-_WNBIoRZhlX4RRxnvOGsM5NkEhbvqc-1f5o";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
