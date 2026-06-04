import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://dwwukaznjkoefortlues.supabase.co';
const supabaseKey = 'sb_publishable_KkwgITLtF91MJ2KfrQSyDg_b2XgXZss';

export const supabase = createClient(supabaseUrl, supabaseKey);
