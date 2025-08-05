const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key available:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const createCashTransactionsTable = async () => {
  try {
    console.log('Creating user_cash_transactions table...');
    
    // First, let's check if the table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('user_cash_transactions')
      .select('*')
      .limit(1);

    if (!checkError) {
      console.log('✅ user_cash_transactions table already exists!');
      return;
    }

    console.log('Table does not exist, creating it...');

    // Since we can't execute raw SQL easily, let's try using the REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: `
          CREATE TABLE IF NOT EXISTS user_cash_transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            transaction_id VARCHAR(255) UNIQUE NOT NULL,
            phone_number VARCHAR(20) NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('sale', 'purchase', 'expense', 'income', 'adjustment')),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            amount DECIMAL(15,2) NOT NULL DEFAULT 0,
            date DATE NOT NULL DEFAULT CURRENT_DATE,
            reference VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_phone ON user_cash_transactions(phone_number);
          CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_transaction_id ON user_cash_transactions(transaction_id);
          CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_type ON user_cash_transactions(type);
          CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_date ON user_cash_transactions(date);

          ALTER TABLE user_cash_transactions ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "Users can access their own cash transactions" ON user_cash_transactions;
          CREATE POLICY "Users can access their own cash transactions" ON user_cash_transactions
            FOR ALL USING (true);
        `
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create table via REST API:', errorText);
      
      // Fallback: Try creating a dummy record to trigger table creation
      console.log('Trying alternative approach...');
      
      // This will fail but might give us more info
      const { data, error } = await supabase
        .from('user_cash_transactions')
        .insert({
          transaction_id: 'test-123',
          phone_number: '+1234567890',
          type: 'income',
          name: 'Test Transaction',
          description: 'Test',
          amount: 100,
          date: '2025-01-01'
        });

      console.log('Insert result:', { data, error });
    } else {
      console.log('✅ Table created successfully via REST API!');
    }

  } catch (error) {
    console.error('Error:', error);
    console.log('\n📝 Please create the table manually using the Supabase dashboard:');
    console.log('Go to: https://supabase.com/dashboard/project/txpufkxjnxhpnmydwdng/editor');
    console.log('And run this SQL:');
    console.log(`
CREATE TABLE IF NOT EXISTS user_cash_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('sale', 'purchase', 'expense', 'income', 'adjustment')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_phone ON user_cash_transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_transaction_id ON user_cash_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_type ON user_cash_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_date ON user_cash_transactions(date);

ALTER TABLE user_cash_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own cash transactions" ON user_cash_transactions;
CREATE POLICY "Users can access their own cash transactions" ON user_cash_transactions
  FOR ALL USING (true);
    `);
  }
};

createCashTransactionsTable();
