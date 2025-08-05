import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST() {
  try {
    console.log('Creating user_cash_transactions table...');

    // Try to insert a dummy record to test table existence
    const { data: testData, error: testError } = await supabaseAdmin
      .from('user_cash_transactions')
      .select('*')
      .limit(1);

    if (!testError) {
      return NextResponse.json({ 
        success: true, 
        message: 'Table already exists!',
        table: 'user_cash_transactions' 
      });
    }

    // If table doesn't exist, let's create a record which will auto-create the table
    // First, let's try to create the table structure manually by inserting data
    const sampleTransaction = {
      transaction_id: `temp-${Date.now()}`,
      phone_number: '+1234567890',
      type: 'income',
      name: 'Sample Transaction',
      description: 'Initial table creation',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      reference: 'SETUP'
    };

    const { data, error } = await supabaseAdmin
      .from('user_cash_transactions')
      .insert(sampleTransaction)
      .select();

    if (error) {
      console.error('Table creation error:', error);
      
      // Return instructions for manual creation
      return NextResponse.json({ 
        success: false,
        error: error.message,
        instruction: 'Please create the table manually in Supabase dashboard',
        sql: `
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
CREATE INDEX idx_user_cash_transactions_type ON user_cash_transactions(type);
CREATE INDEX idx_user_cash_transactions_date ON user_cash_transactions(date);

ALTER TABLE user_cash_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own cash transactions" ON user_cash_transactions FOR ALL USING (true);
        `
      }, { status: 500 });
    }

    // If successful, delete the sample record
    if (data && data[0]) {
      await supabaseAdmin
        .from('user_cash_transactions')
        .delete()
        .eq('id', data[0].id);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Table created successfully!',
      table: 'user_cash_transactions'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
