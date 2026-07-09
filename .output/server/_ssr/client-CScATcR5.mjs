import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
const SUPABASE_URL = "https://guawziyyhbcbzbsgrmab.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YXd6aXl5aGJjYnpic2dybWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MDgzNTAsImV4cCI6MjA5NDk4NDM1MH0.maVLYBdDbzLmroTJLm7SQEPslkz_j8Oiyn2CJ2jSNbk";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true
  }
});
export {
  supabase as s
};
