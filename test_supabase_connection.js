const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables not found');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('user_cash_transactions').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.message.includes('relation "user_cash_transactions" does not exist')) {
        console.log('⚠️  Table does not exist yet. Please create it using the SQL script.');
      } else {
        console.error('❌ Connection error:', error.message);
      }
    } else {
      console.log('✅ Connected successfully!');
      console.log('✅ user_cash_transactions table exists');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();
