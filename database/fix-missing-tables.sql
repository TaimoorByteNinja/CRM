-- Fix Missing Tables and Initial Data for Combined CRM

-- Create payments table if missing
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_type VARCHAR(10) CHECK (payment_type IN ('in', 'out')) NOT NULL,
  party_id UUID REFERENCES public.parties(id),
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'cash',
  reference VARCHAR(100),
  description TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create bank_accounts table if missing
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100),
  bank_name VARCHAR(255),
  account_type VARCHAR(50) DEFAULT 'savings',
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create cash_accounts table if missing
CREATE TABLE IF NOT EXISTS public.cash_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL DEFAULT 'Cash in Hand',
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create party_transactions table if missing
CREATE TABLE IF NOT EXISTS public.party_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID REFERENCES public.parties(id) NOT NULL,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('sale', 'purchase', 'payment_in', 'payment_out')) NOT NULL,
  reference_id UUID, -- Can reference sales, purchases, or payments
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  balance_effect VARCHAR(10) CHECK (balance_effect IN ('debit', 'credit')) NOT NULL,
  description TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default settings if empty
INSERT INTO public.settings (id, category, settings_data)
SELECT 
  gen_random_uuid(),
  'general',
  '{
    "businessName": "Your Business Name",
    "businessAddress": "Business Address",
    "businessPhone": "Phone Number",
    "businessEmail": "email@business.com",
    "businessCurrency": "USD",
    "businessCountry": "US",
    "businessLogo": "",
    "businessGST": "",
    "businessPAN": ""
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.settings WHERE category = 'general');

INSERT INTO public.settings (id, category, settings_data)
SELECT 
  gen_random_uuid(),
  'invoice',
  '{
    "invoicePrefix": "INV",
    "invoiceNumberFormat": "sequential",
    "invoiceTemplate": "default",
    "showItemCode": true,
    "showItemTax": true,
    "showItemDiscount": true,
    "showShipping": false,
    "showNotes": true,
    "showTerms": true,
    "autoSave": true,
    "defaultDueDays": 30
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.settings WHERE category = 'invoice');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_party_id ON public.payments(party_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_party_transactions_party_id ON public.party_transactions(party_id);
CREATE INDEX IF NOT EXISTS idx_party_transactions_date ON public.party_transactions(transaction_date);

-- Enable RLS (Row Level Security) if not enabled
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY IF NOT EXISTS "Enable read access for authenticated users" ON public.payments
FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Enable insert access for authenticated users" ON public.payments
FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Enable update access for authenticated users" ON public.payments
FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Enable delete access for authenticated users" ON public.payments
FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Add similar policies for other tables
CREATE POLICY IF NOT EXISTS "Enable all access for authenticated users" ON public.bank_accounts
FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Enable all access for authenticated users" ON public.cash_accounts
FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Enable all access for authenticated users" ON public.party_transactions
FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
