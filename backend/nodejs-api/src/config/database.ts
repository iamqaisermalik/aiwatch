import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function connectDatabase() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);

    if (error) {
      throw error;
    }

    logger.info('Database connection successful');
    return true;

  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}