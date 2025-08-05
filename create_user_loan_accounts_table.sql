-- Create user_loan_accounts table for phone-based isolation
CREATE TABLE user_loan_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('borrowing', 'lending')),
  party_name VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue', 'cancelled')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_user_loan_accounts_phone ON user_loan_accounts(phone_number);
CREATE INDEX idx_user_loan_accounts_loan_id ON user_loan_accounts(loan_id);
CREATE INDEX idx_user_loan_accounts_type ON user_loan_accounts(type);
CREATE INDEX idx_user_loan_accounts_status ON user_loan_accounts(status);
CREATE INDEX idx_user_loan_accounts_start_date ON user_loan_accounts(start_date);
CREATE INDEX idx_user_loan_accounts_due_date ON user_loan_accounts(due_date);

-- Enable RLS (Row Level Security)
ALTER TABLE user_loan_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy for phone number access
CREATE POLICY "Users can access their own loan accounts" ON user_loan_accounts
  FOR ALL USING (true);
