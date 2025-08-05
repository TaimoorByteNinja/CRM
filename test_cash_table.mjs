const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCashTransactions() {
  try {
    console.log('Testing cash transactions table...');
    
    // Test phone number
    const testPhone = '+1234567890';
    
    // Try to fetch existing data first
    const { data: existingData, error: fetchError } = await supabase
      .from('user_cash_transactions')
      .select('*')
      .eq('phone_number', testPhone)
      .limit(1);

    if (!fetchError) {
      console.log('✅ Table exists! Found records:', existingData?.length || 0);
      return;
    }

    console.log('Table might not exist. Error:', fetchError.message);
    
    // Try to create a test record
    const testTransaction = {
      transaction_id: `test-${Date.now()}`,
      phone_number: testPhone,
      type: 'income',
      name: 'Test Transaction',
      description: 'Table creation test',
      amount: 100,
      date: new Date().toISOString().split('T')[0],
      reference: 'TEST'
    };

    const { data, error } = await supabase
      .from('user_cash_transactions')
      .insert(testTransaction)
      .select();

    if (error) {
      console.error('❌ Error creating test record:', error);
      console.log('\n📝 Manual table creation required. SQL:');
      console.log(`
CREATE TABLE user_cash_transactions (
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

CREATE INDEX idx_user_cash_transactions_phone ON user_cash_transactions(phone_number);
CREATE INDEX idx_user_cash_transactions_transaction_id ON user_cash_transactions(transaction_id);
ALTER TABLE user_cash_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own cash transactions" ON user_cash_transactions FOR ALL USING (true);
      `);
    } else {
      console.log('✅ Test record created successfully:', data);
      
      // Clean up the test record
      if (data && data[0]) {
        await supabase
          .from('user_cash_transactions')
          .delete()
          .eq('id', data[0].id);
        console.log('✅ Test record cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Connection error:', error);
  }
}

testCashTransactions();
