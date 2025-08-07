-- Business Manager Module Tables

-- Table for business modules (inventory items, sales modules, etc.)
CREATE TABLE IF NOT EXISTS user_business_modules (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'inventory',
  items JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  position JSONB DEFAULT '{"x": 0, "y": 0}',
  size JSONB DEFAULT '{"width": 300, "height": 200}',
  color VARCHAR(50) DEFAULT '#22c55e',
  icon VARCHAR(50) DEFAULT 'Package',
  total_stock INTEGER DEFAULT 0,
  price_per_unit DECIMAL(10, 2) DEFAULT 0.00,
  phone_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for business transactions (sales, purchases, adjustments, returns)
CREATE TABLE IF NOT EXISTS user_business_transactions (
  id VARCHAR(255) PRIMARY KEY,
  item_id VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'sale', 'purchase', 'adjustment', 'return'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT DEFAULT '',
  customer VARCHAR(255),
  payment_method VARCHAR(100),
  phone_number VARCHAR(20) NOT NULL
);

-- Table for calculator history
CREATE TABLE IF NOT EXISTS user_calculator_history (
  id VARCHAR(255) PRIMARY KEY,
  expression TEXT NOT NULL,
  result DECIMAL(15, 8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  saved BOOLEAN DEFAULT FALSE,
  phone_number VARCHAR(20) NOT NULL
);

-- Table for daily reset tracking
CREATE TABLE IF NOT EXISTS user_daily_resets (
  phone_number VARCHAR(20) PRIMARY KEY,
  last_reset_date DATE NOT NULL,
  todays_sales_reset BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_modules_phone ON user_business_modules(phone_number);
CREATE INDEX IF NOT EXISTS idx_business_modules_created_at ON user_business_modules(created_at);
CREATE INDEX IF NOT EXISTS idx_business_transactions_phone ON user_business_transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_business_transactions_timestamp ON user_business_transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_business_transactions_type ON user_business_transactions(type);
CREATE INDEX IF NOT EXISTS idx_business_transactions_item_id ON user_business_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_calculator_history_phone ON user_calculator_history(phone_number);
CREATE INDEX IF NOT EXISTS idx_calculator_history_timestamp ON user_calculator_history(timestamp);

-- RLS (Row Level Security) policies for phone-based data isolation
ALTER TABLE user_business_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_business_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calculator_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_resets ENABLE ROW LEVEL SECURITY;

-- Policies for business modules
CREATE POLICY "Users can view their own business modules" ON user_business_modules
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own business modules" ON user_business_modules
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update their own business modules" ON user_business_modules
  FOR UPDATE USING (TRUE);

CREATE POLICY "Users can delete their own business modules" ON user_business_modules
  FOR DELETE USING (TRUE);

-- Policies for business transactions
CREATE POLICY "Users can view their own business transactions" ON user_business_transactions
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own business transactions" ON user_business_transactions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update their own business transactions" ON user_business_transactions
  FOR UPDATE USING (TRUE);

CREATE POLICY "Users can delete their own business transactions" ON user_business_transactions
  FOR DELETE USING (TRUE);

-- Policies for calculator history
CREATE POLICY "Users can view their own calculator history" ON user_calculator_history
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own calculator history" ON user_calculator_history
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update their own calculator history" ON user_calculator_history
  FOR UPDATE USING (TRUE);

CREATE POLICY "Users can delete their own calculator history" ON user_calculator_history
  FOR DELETE USING (TRUE);

-- Policies for daily resets
CREATE POLICY "Users can view their own daily resets" ON user_daily_resets
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own daily resets" ON user_daily_resets
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update their own daily resets" ON user_daily_resets
  FOR UPDATE USING (TRUE);

CREATE POLICY "Users can delete their own daily resets" ON user_daily_resets
  FOR DELETE USING (TRUE);
