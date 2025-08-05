-- Craft CRM User Data Management Schema
-- Run this SQL script in your Supabase SQL Editor

-- First, drop existing tables if they exist (optional - only if you want to start fresh)
-- DROP TABLE IF EXISTS user_bank_accounts CASCADE;
-- DROP TABLE IF EXISTS user_expenses CASCADE;
-- DROP TABLE IF EXISTS user_purchases CASCADE;
-- DROP TABLE IF EXISTS user_items CASCADE;
-- DROP TABLE IF EXISTS user_parties CASCADE;
-- DROP TABLE IF EXISTS user_customers CASCADE;
-- DROP TABLE IF EXISTS user_sales CASCADE;
-- DROP TABLE IF EXISTS user_settings CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- 1. User Profiles Table (Main user identification)
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

-- 2. User Settings Table (All application settings)
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL REFERENCES user_profiles(phone_number) ON DELETE CASCADE,
    settings_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone_number)
);

-- 3. User Sales Table
CREATE TABLE IF NOT EXISTS user_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL REFERENCES user_profiles(phone_number) ON DELETE CASCADE,
    sale_id VARCHAR(100) NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    party_id VARCHAR(100),
    party_name VARCHAR(255),
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance_amount DECIMAL(15,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    sale_data JSONB, -- Store complete sale object for flexibility
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone_number, sale_id)
);

-- 4. User Customers Table
CREATE TABLE IF NOT EXISTS user_customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL REFERENCES user_profiles(phone_number) ON DELETE CASCADE,
    customer_id VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    customer_data JSONB, -- Store complete customer object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone_number, customer_id)
);

-- 5. User Parties Table (Suppliers, Customers, etc.)
CREATE TABLE IF NOT EXISTS user_parties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL REFERENCES user_profiles(phone_number) ON DELETE CASCADE,
    party_id VARCHAR(100) NOT NULL,
    party_name VARCHAR(255) NOT NULL,
    party_type VARCHAR(50), -- customer, supplier, etc.
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    balance DECIMAL(15,2) DEFAULT 0,
    party_data JSONB, -- Store complete party object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone_number, party_id)
);

-- 6. User Items Table
CREATE TABLE IF NOT EXISTS user_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL REFERENCES user_profiles(phone_number) ON DELETE CASCADE,
    item_id VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_code VARCHAR(100),
    category VARCHAR(100),
    unit VARCHAR(50),
    sale_price DECIMAL(15,2) DEFAULT 0,
    purchase_price DECIMAL(15,2) DEFAULT 0,
    stock_quantity DECIMAL(15,2) DEFAULT 0,
    min_stock DECIMAL(15,2) DEFAULT 0,
    item_data JSONB, -- Store complete item object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone_number, item_id)
);

-- 7. User Purchases Table
CREATE TABLE IF NOT EXISTS user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL REFERENCES user_profiles(phone_number) ON DELETE CASCADE,
    purchase_id VARCHAR(100) NOT NULL,
    supplier_id VARCHAR(100),
    supplier_name VARCHAR(255),
    purchase_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    purchase_data JSONB, -- Store complete purchase object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone_number, purchase_id)
);

-- 8. User Expenses Table
CREATE TABLE IF NOT EXISTS user_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL REFERENCES user_profiles(phone_number) ON DELETE CASCADE,
    expense_id VARCHAR(100) NOT NULL,
    expense_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    expense_data JSONB, -- Store complete expense object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone_number, expense_id)
);

-- 9. User Bank Accounts Table
CREATE TABLE IF NOT EXISTS user_bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL REFERENCES user_profiles(phone_number) ON DELETE CASCADE,
    account_id VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255),
    account_number VARCHAR(100),
    account_type VARCHAR(50),
    balance DECIMAL(15,2) DEFAULT 0,
    account_data JSONB, -- Store complete account object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone_number, account_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_settings_phone ON user_settings(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_sales_phone ON user_sales(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_sales_date ON user_sales(invoice_date);
CREATE INDEX IF NOT EXISTS idx_user_customers_phone ON user_customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_parties_phone ON user_parties(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_items_phone ON user_items(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_purchases_phone ON user_purchases(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_expenses_phone ON user_expenses(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_bank_accounts_phone ON user_bank_accounts(phone_number);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers to all tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sales_updated_at BEFORE UPDATE ON user_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_customers_updated_at BEFORE UPDATE ON user_customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_parties_updated_at BEFORE UPDATE ON user_parties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_items_updated_at BEFORE UPDATE ON user_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_purchases_updated_at BEFORE UPDATE ON user_purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_expenses_updated_at BEFORE UPDATE ON user_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_bank_accounts_updated_at BEFORE UPDATE ON user_bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Users can only access their own data
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to access only their own data
-- Note: In a production environment, you might want to use proper authentication
-- For now, we'll allow all operations for simplicity
CREATE POLICY "Allow all operations on user_profiles" ON user_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_settings" ON user_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_sales" ON user_sales FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_customers" ON user_customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_parties" ON user_parties FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_items" ON user_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_purchases" ON user_purchases FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_expenses" ON user_expenses FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_bank_accounts" ON user_bank_accounts FOR ALL USING (true);

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'user_%'
ORDER BY table_name;
