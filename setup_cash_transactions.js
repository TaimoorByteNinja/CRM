const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables (you'll need to set these)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Please set your Supabase environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCashTransactionsTable() {
  try {
    console.log('Creating user_cash_transactions table...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(path.join(__dirname, 'create_cash_transactions_table.sql'), 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
    
    if (error) {
      console.error('Error creating table:', error);
      
      // Alternative approach - execute each statement separately
      console.log('Trying alternative approach...');
      
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing:', statement.substring(0, 50) + '...');
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement });
          if (stmtError) {
            console.error('Error executing statement:', stmtError);
            console.error('Statement:', statement);
          }
        }
      }
    } else {
      console.log('Table created successfully!');
    }
    
    // Verify the table was created
    const { data: tables, error: listError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_cash_transactions');
    
    if (listError) {
      console.error('Error checking table:', listError);
    } else if (tables && tables.length > 0) {
      console.log('✅ user_cash_transactions table exists!');
    } else {
      console.log('❌ Table was not created');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createCashTransactionsTable();
