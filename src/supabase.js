import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://rqeqjsunotkapntlaepo.supabase.co';
const supabaseKey = 'sb_publishable_bOer5KgDccVf6uvdXwAnEA_dg4042Ic';

export const supabase =createClient(supabaseUrl, supabaseKey) ;