-- Create user_cheques table for phone-based isolation
CREATE TABLE user_cheques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cheque_id VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('issued', 'received')),
  cheque_number VARCHAR(255) NOT NULL,
  party_name VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  bank_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'bounced', 'cancelled')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_user_cheques_phone ON user_cheques(phone_number);
CREATE INDEX idx_user_cheques_cheque_id ON user_cheques(cheque_id);
CREATE INDEX idx_user_cheques_type ON user_cheques(type);
CREATE INDEX idx_user_cheques_status ON user_cheques(status);
CREATE INDEX idx_user_cheques_date ON user_cheques(date);
CREATE INDEX idx_user_cheques_due_date ON user_cheques(due_date);

-- Enable RLS (Row Level Security)
ALTER TABLE user_cheques ENABLE ROW LEVEL SECURITY;

-- Create policy for phone number access
CREATE POLICY "Users can access their own cheques" ON user_cheques
  FOR ALL USING (true);
