-- Create user_cash_transactions table
CREATE TABLE IF NOT EXISTS user_cash_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL REFERENCES user_profiles(phone_number) ON DELETE CASCADE,
    transaction_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('sale', 'purchase', 'expense', 'income', 'adjustment')),
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    reference VARCHAR(255),
    transaction_data JSONB, -- Store complete transaction object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone_number, transaction_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_phone ON user_cash_transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_date ON user_cash_transactions(date);
CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_type ON user_cash_transactions(type);

-- Add trigger for updated_at
CREATE TRIGGER update_user_cash_transactions_updated_at 
    BEFORE UPDATE ON user_cash_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE user_cash_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on user_cash_transactions" 
    ON user_cash_transactions 
    FOR ALL 
    USING (true);

-- Add comments for documentation
COMMENT ON TABLE user_cash_transactions IS 'Cash transactions for users with phone-based isolation';
COMMENT ON COLUMN user_cash_transactions.phone_number IS 'Foreign key to user_profiles';
COMMENT ON COLUMN user_cash_transactions.transaction_id IS 'User-defined transaction identifier';
COMMENT ON COLUMN user_cash_transactions.transaction_data IS 'Complete transaction object in JSON format';
