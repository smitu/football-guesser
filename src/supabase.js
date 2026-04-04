import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vmvfpbecsqlnswkaffna.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wO2aqg7g10OYqzRiT89vlw_ZywvNcrh";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
