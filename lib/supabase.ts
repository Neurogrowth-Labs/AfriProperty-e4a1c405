import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axsioolyuuonsyrwacdr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4c2lvb2x5dXVvbnN5cndhY2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MDUzNTksImV4cCI6MjA4MTk4MTM1OX0.FZyUdTYOQ5Kl295WE60Zpqgn8MzbWYJK5kHs_Zca23M';

export const supabase = createClient(supabaseUrl, supabaseKey);
