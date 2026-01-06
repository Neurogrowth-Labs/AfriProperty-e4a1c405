
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axsioolyuuonsyrwacdr.supabase.co';
const supabaseKey = 'sb_publishable_lEbbGFPFoul95QlM-3NiFw_o1O5Iato';

export const supabase = createClient(supabaseUrl, supabaseKey);
