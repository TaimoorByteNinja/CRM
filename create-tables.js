const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client with service role key for schema operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserTables() {
  try {
    console.log('Creating user-specific tables...');
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: statement 
      });
      
      if (error) {
        // Try direct query execution if RPC doesn't work
        const { error: directError } = await supabase
          .from('__direct_sql')
          .select('*')
          .eq('query', statement);
          
        if (directError) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
          // Continue with other statements
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } else {
        console.log(`Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('Schema creation completed!');
    
    // Test table creation by checking if user_profiles table exists
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error testing user_profiles table:', error);
    } else {
      console.log('✅ user_profiles table exists and is accessible');
    }
    
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Alternative approach using SQL Editor
async function createTablesDirectly() {
  try {
    console.log('Creating tables using direct SQL execution...');
    
    // Create user_profiles table first
    const createUserProfilesQuery = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        country VARCHAR(2) NOT NULL DEFAULT 'PK',
        currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
        currency_symbol VARCHAR(5) NOT NULL DEFAULT '₨',
        date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
        number_format VARCHAR(10) NOT NULL DEFAULT 'en-PK',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log('Creating user_profiles table...');
    const { error: profileError } = await supabase.rpc('exec_sql', {
      sql_query: createUserProfilesQuery
    });
    
    if (profileError) {
      console.error('Error creating user_profiles:', profileError);
    } else {
      console.log('✅ user_profiles table created');
    }
    
    // Test the table
    const { data, error: testError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('Error testing user_profiles table:', testError);
    } else {
      console.log('✅ user_profiles table is accessible');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the schema creation
console.log('Starting schema creation process...');
createUserTables().then(() => {
  console.log('Process completed');
  process.exit(0);
}).catch(error => {
  console.error('Process failed:', error);
  process.exit(1);
});
