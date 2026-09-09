import "server-only";
import { createClient } from "@supabase/supabase-js";

// service role = RLS 없음. 서버 전용 (Route Handler / RSC / Server Action).
export const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
