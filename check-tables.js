const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  const tables = [
    'user_profiles',
    'user_settings', 
    'user_sales',
    'user_customers',
    'user_parties',
    'user_items',
    'user_purchases',
    'user_expenses',
    'user_bank_accounts'
  ];
  
  console.log('Checking existing tables...\n');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: EXISTS (${data.length} rows found)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

checkTables().then(() => {
  console.log('\nTable check completed');
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
