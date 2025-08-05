-- Create user_cash_transactions table
CREATE TABLE IF NOT EXISTS public.user_cash_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('sale', 'purchase', 'expense', 'income', 'adjustment')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_phone ON public.user_cash_transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_transaction_id ON public.user_cash_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_type ON public.user_cash_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_cash_transactions_date ON public.user_cash_transactions(date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_cash_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow users to only access their own data
CREATE POLICY "Users can view own cash transactions" ON public.user_cash_transactions
  FOR SELECT USING (phone_number = current_setting('request.jwt.claims', true)::json->>'phone');

CREATE POLICY "Users can insert own cash transactions" ON public.user_cash_transactions
  FOR INSERT WITH CHECK (phone_number = current_setting('request.jwt.claims', true)::json->>'phone');

CREATE POLICY "Users can update own cash transactions" ON public.user_cash_transactions
  FOR UPDATE USING (phone_number = current_setting('request.jwt.claims', true)::json->>'phone');

CREATE POLICY "Users can delete own cash transactions" ON public.user_cash_transactions
  FOR DELETE USING (phone_number = current_setting('request.jwt.claims', true)::json->>'phone');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_cash_transactions_updated_at
    BEFORE UPDATE ON public.user_cash_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
