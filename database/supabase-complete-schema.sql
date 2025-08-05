-- =====================================================
-- COMBINED CRM - COMPLETE SUPABASE DATABASE SCHEMA
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  general_settings JSONB DEFAULT '{
    "enablePasscode": false,
    "businessCurrency": "Rs",
    "decimalPlaces": 2,
    "tinNumber": false,
    "stopNegativeStock": false,
    "autoBackup": false,
    "transactionHistory": true,
    "screenZoom": 100,
    "multiFirm": false,
    "selectedCountry": "IN",
    "selectedCurrency": "INR",
    "selectedCurrencySymbol": "₹",
    "selectedNumberFormat": "en-IN",
    "selectedDateFormat": "DD/MM/YYYY"
  }'::JSONB,
  transaction_settings JSONB DEFAULT '{
    "invoiceNumber": true,
    "addTime": false,
    "cashSaleDefault": false,
    "billingName": false,
    "customerPO": false,
    "displayPurchasePrice": true,
    "showLastSalePrice": false,
    "freeItemQuantity": false,
    "count": false,
    "transactionTax": true,
    "transactionDiscount": true,
    "roundOffTotal": true,
    "quickEntry": false,
    "noInvoicePreview": false,
    "passcodeEdit": false,
    "discountPayments": false,
    "linkPayments": false,
    "dueDates": false,
    "showProfit": false
  }'::JSONB,
  invoice_settings JSONB DEFAULT '{
    "layoutTheme": "tally",
    "companyName": "craft CRM",
    "companyLogo": true,
    "companyAddress": "A-41 whadat colony whadat road lahore",
    "companyEmail": "taimoorazam38@gmail.com",
    "companyPhone": "3034091907",
    "showCompanyLogo": true,
    "showCompanyAddress": true,
    "showCompanyContact": true,
    "invoiceTitle": "Tax Invoice",
    "showInvoiceNumber": true,
    "showDate": true,
    "showDueDate": true,
    "showCustomerInfo": true,
    "showFooter": true,
    "footerText": "Thank you for your business!",
    "paperSize": "A4",
    "orientation": "Portrait"
  }'::JSONB,
  party_settings JSONB DEFAULT '{
    "partyGrouping": false,
    "shippingAddress": false,
    "managePartyStatus": false,
    "enablePaymentReminder": false,
    "paymentReminderDays": 7,
    "enableLoyaltyPoint": false,
    "sendSMSToParty": false,
    "sendTransactionUpdate": false,
    "sendSMSCopy": false,
    "partyBalance": false,
    "webInvoiceLink": false,
    "autoSMSFor": {
      "sale": false,
      "purchase": false,
      "payment": false,
      "quotation": false,
      "proforma": false,
      "delivery": false
    }
  }'::JSONB,
  item_settings JSONB DEFAULT '{
    "enableItem": true,
    "barcodeScanning": false,
    "stockMaintenance": true,
    "manufacturing": false,
    "showLowStockDialog": true,
    "itemsUnit": true,
    "defaultUnit": true,
    "itemCategory": true,
    "partyWiseItemRate": false,
    "description": true,
    "itemWiseTax": true,
    "itemWiseDiscount": true,
    "updateSalePrice": false,
    "wholesalePrice": false
  }'::JSONB,
  message_settings JSONB DEFAULT '{
    "sendSMSToParty": false,
    "sendTransactionUpdate": false,
    "sendSMSCopy": false,
    "partyBalance": false,
    "webInvoiceLink": false,
    "messageTemplates": {
      "sales": "Greetings from [Firm_Name]. Sale Invoice Amount: [Invoice_Amount], Balance: [Transaction_Balance]. Thanks for your business.",
      "purchase": "Greetings from [Firm_Name]. Purchase Invoice Amount: [Invoice_Amount], Balance: [Transaction_Balance]. Thank you.",
      "payment": "Greetings from [Firm_Name]. Payment Amount: [Payment_Amount], Balance: [Transaction_Balance]. Thank you."
    }
  }'::JSONB,
  tax_settings JSONB DEFAULT '{
    "taxRates": [
      {"id": "1", "name": "GST 18%", "rate": 18, "type": "percentage", "isDefault": true},
      {"id": "2", "name": "GST 12%", "rate": 12, "type": "percentage", "isDefault": false},
      {"id": "3", "name": "GST 5%", "rate": 5, "type": "percentage", "isDefault": false}
    ],
    "taxGroups": [
      {"id": "1", "name": "Standard Tax", "taxes": ["1"], "totalRate": 18}
    ]
  }'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_code TEXT,
  hsn_code TEXT,
  category TEXT,
  unit TEXT DEFAULT 'pcs',
  sale_price DECIMAL(12, 2) DEFAULT 0,
  purchase_price DECIMAL(12, 2) DEFAULT 0,
  opening_stock INTEGER DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  godown TEXT,
  gst_rate TEXT DEFAULT '18%',
  taxable BOOLEAN DEFAULT true,
  barcode TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. PARTIES TABLE (Customers & Suppliers)
-- =====================================================
CREATE TABLE IF NOT EXISTS parties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  party_name TEXT NOT NULL,
  party_type TEXT CHECK (party_type IN ('customer', 'supplier', 'both')) DEFAULT 'customer',
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gstin TEXT,
  opening_balance DECIMAL(12, 2) DEFAULT 0,
  current_balance DECIMAL(12, 2) DEFAULT 0,
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  payment_terms INTEGER DEFAULT 0, -- days
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. SALES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  party_id UUID REFERENCES parties(id),
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  balance_amount DECIMAL(12, 2) DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('paid', 'partial', 'unpaid')) DEFAULT 'unpaid',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. SALE ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  item_name TEXT NOT NULL,
  quantity DECIMAL(10, 3) DEFAULT 1,
  unit_price DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. PURCHASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  bill_number TEXT NOT NULL,
  party_id UUID REFERENCES parties(id),
  bill_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  balance_amount DECIMAL(12, 2) DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('paid', 'partial', 'unpaid')) DEFAULT 'unpaid',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. PURCHASE ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  item_name TEXT NOT NULL,
  quantity DECIMAL(10, 3) DEFAULT 1,
  unit_price DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  payment_number TEXT NOT NULL,
  party_id UUID REFERENCES parties(id),
  payment_type TEXT CHECK (payment_type IN ('received', 'paid')) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'cheque', 'bank_transfer', 'upi', 'card')) DEFAULT 'cash',
  reference_number TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. EXPENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  expense_number TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'cheque', 'bank_transfer', 'upi', 'card')) DEFAULT 'cash',
  expense_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. BANK ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT,
  account_type TEXT CHECK (account_type IN ('savings', 'current', 'od')) DEFAULT 'savings',
  opening_balance DECIMAL(12, 2) DEFAULT 0,
  current_balance DECIMAL(12, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at);

-- Items indexes
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_item_name ON items(item_name);
CREATE INDEX IF NOT EXISTS idx_items_barcode ON items(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_active ON items(is_active);

-- Parties indexes
CREATE INDEX IF NOT EXISTS idx_parties_user_id ON parties(user_id);
CREATE INDEX IF NOT EXISTS idx_parties_party_name ON parties(party_name);
CREATE INDEX IF NOT EXISTS idx_parties_party_type ON parties(party_type);
CREATE INDEX IF NOT EXISTS idx_parties_phone ON parties(phone);
CREATE INDEX IF NOT EXISTS idx_parties_email ON parties(email);
CREATE INDEX IF NOT EXISTS idx_parties_gstin ON parties(gstin) WHERE gstin IS NOT NULL;

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_number ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_party_id ON sales(party_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_date ON sales(invoice_date);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);

-- Sale items indexes
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_item_id ON sale_items(item_id);

-- Purchases indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_bill_number ON purchases(bill_number);
CREATE INDEX IF NOT EXISTS idx_purchases_party_id ON purchases(party_id);
CREATE INDEX IF NOT EXISTS idx_purchases_bill_date ON purchases(bill_date);

-- Purchase items indexes
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_item_id ON purchase_items(item_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_party_id ON payments(party_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);

-- Bank accounts indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_account_number ON bank_accounts(account_number);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at column
DROP TRIGGER IF EXISTS trigger_settings_updated_at ON settings;
CREATE TRIGGER trigger_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_items_updated_at ON items;
CREATE TRIGGER trigger_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_parties_updated_at ON parties;
CREATE TRIGGER trigger_parties_updated_at
  BEFORE UPDATE ON parties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_sales_updated_at ON sales;
CREATE TRIGGER trigger_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_purchases_updated_at ON purchases;
CREATE TRIGGER trigger_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_payments_updated_at ON payments;
CREATE TRIGGER trigger_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_expenses_updated_at ON expenses;
CREATE TRIGGER trigger_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_bank_accounts_updated_at ON bank_accounts;
CREATE TRIGGER trigger_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORED PROCEDURES FOR BUSINESS LOGIC
-- =====================================================

-- Function to update item stock after sale
CREATE OR REPLACE FUNCTION update_item_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Update item stock when sale item is inserted
  UPDATE items 
  SET current_stock = current_stock - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.item_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update item stock after purchase
CREATE OR REPLACE FUNCTION update_item_stock_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Update item stock when purchase item is inserted
  UPDATE items 
  SET current_stock = current_stock + NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.item_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update party balance after transaction
CREATE OR REPLACE FUNCTION update_party_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'sales' THEN
    -- Update customer balance (increase for unpaid sales)
    UPDATE parties 
    SET current_balance = current_balance + NEW.balance_amount,
        updated_at = NOW()
    WHERE id = NEW.party_id;
  ELSIF TG_TABLE_NAME = 'purchases' THEN
    -- Update supplier balance (increase for unpaid purchases)
    UPDATE parties 
    SET current_balance = current_balance - NEW.balance_amount,
        updated_at = NOW()
    WHERE id = NEW.party_id;
  ELSIF TG_TABLE_NAME = 'payments' THEN
    -- Update party balance based on payment type
    IF NEW.payment_type = 'received' THEN
      UPDATE parties 
      SET current_balance = current_balance - NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.party_id;
    ELSE
      UPDATE parties 
      SET current_balance = current_balance + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.party_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply stock update triggers
DROP TRIGGER IF EXISTS trigger_update_stock_after_sale ON sale_items;
CREATE TRIGGER trigger_update_stock_after_sale
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_item_stock_after_sale();

DROP TRIGGER IF EXISTS trigger_update_stock_after_purchase ON purchase_items;
CREATE TRIGGER trigger_update_stock_after_purchase
  AFTER INSERT ON purchase_items
  FOR EACH ROW
  EXECUTE FUNCTION update_item_stock_after_purchase();

-- Apply balance update triggers
DROP TRIGGER IF EXISTS trigger_update_party_balance_sales ON sales;
CREATE TRIGGER trigger_update_party_balance_sales
  AFTER INSERT OR UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_party_balance();

DROP TRIGGER IF EXISTS trigger_update_party_balance_purchases ON purchases;
CREATE TRIGGER trigger_update_party_balance_purchases
  AFTER INSERT OR UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_party_balance();

DROP TRIGGER IF EXISTS trigger_update_party_balance_payments ON payments;
CREATE TRIGGER trigger_update_party_balance_payments
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_party_balance();

-- =====================================================
-- ROW LEVEL SECURITY (OPTIONAL)
-- =====================================================

-- Enable RLS on all tables (uncomment if needed)
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for user data isolation (uncomment if using RLS)
-- CREATE POLICY "Users can manage their own data" ON settings FOR ALL USING (user_id = auth.uid()::text);
-- CREATE POLICY "Users can manage their own items" ON items FOR ALL USING (user_id = auth.uid()::text);
-- CREATE POLICY "Users can manage their own parties" ON parties FOR ALL USING (user_id = auth.uid()::text);
-- CREATE POLICY "Users can manage their own sales" ON sales FOR ALL USING (user_id = auth.uid()::text);
-- CREATE POLICY "Users can manage their own purchases" ON purchases FOR ALL USING (user_id = auth.uid()::text);
-- CREATE POLICY "Users can manage their own payments" ON payments FOR ALL USING (user_id = auth.uid()::text);
-- CREATE POLICY "Users can manage their own expenses" ON expenses FOR ALL USING (user_id = auth.uid()::text);
-- CREATE POLICY "Users can manage their own bank accounts" ON bank_accounts FOR ALL USING (user_id = auth.uid()::text);

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert default settings for demo user
INSERT INTO settings (user_id) VALUES ('default-user') ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Sales summary view
CREATE OR REPLACE VIEW sales_summary AS
SELECT 
  s.user_id,
  s.id,
  s.invoice_number,
  s.invoice_date,
  p.party_name as customer_name,
  s.total_amount,
  s.paid_amount,
  s.balance_amount,
  s.payment_status,
  COUNT(si.id) as item_count
FROM sales s
LEFT JOIN parties p ON s.party_id = p.id
LEFT JOIN sale_items si ON s.id = si.sale_id
WHERE s.is_active = true
GROUP BY s.id, p.party_name;

-- Purchase summary view
CREATE OR REPLACE VIEW purchase_summary AS
SELECT 
  p.user_id,
  p.id,
  p.bill_number,
  p.bill_date,
  pt.party_name as supplier_name,
  p.total_amount,
  p.paid_amount,
  p.balance_amount,
  p.payment_status,
  COUNT(pi.id) as item_count
FROM purchases p
LEFT JOIN parties pt ON p.party_id = pt.id
LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
WHERE p.is_active = true
GROUP BY p.id, pt.party_name;

-- Stock summary view
CREATE OR REPLACE VIEW stock_summary AS
SELECT 
  user_id,
  id,
  item_name,
  current_stock,
  minimum_stock,
  sale_price,
  purchase_price,
  (current_stock * sale_price) as stock_value,
  CASE 
    WHEN current_stock <= minimum_stock THEN 'Low Stock'
    WHEN current_stock = 0 THEN 'Out of Stock'
    ELSE 'In Stock'
  END as stock_status
FROM items
WHERE is_active = true;

-- Party balance summary view
CREATE OR REPLACE VIEW party_balance_summary AS
SELECT 
  user_id,
  id,
  party_name,
  party_type,
  current_balance,
  credit_limit,
  CASE 
    WHEN current_balance > credit_limit THEN 'Over Limit'
    WHEN current_balance > 0 THEN 'Outstanding'
    WHEN current_balance < 0 THEN 'Advance'
    ELSE 'Clear'
  END as balance_status
FROM parties
WHERE is_active = true;

COMMENT ON TABLE settings IS 'User-specific application settings and preferences';
COMMENT ON TABLE items IS 'Product/service catalog with stock management';
COMMENT ON TABLE parties IS 'Customers and suppliers management';
COMMENT ON TABLE sales IS 'Sales invoices and transactions';
COMMENT ON TABLE purchases IS 'Purchase bills and transactions';
COMMENT ON TABLE payments IS 'Payment in/out transactions';
COMMENT ON TABLE expenses IS 'Business expense tracking';
COMMENT ON TABLE bank_accounts IS 'Bank account management';
