-- Settings table for storing user preferences
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  general_settings JSONB,
  transaction_settings JSONB,
  invoice_settings JSONB,
  party_settings JSONB,
  item_settings JSONB,
  message_settings JSONB,
  tax_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at);

-- RLS policies (if you're using Row Level Security)
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to manage their own settings
-- CREATE POLICY "Users can manage their own settings" ON settings
--   FOR ALL USING (user_id = auth.uid()::text);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS trigger_settings_updated_at ON settings;
CREATE TRIGGER trigger_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();
