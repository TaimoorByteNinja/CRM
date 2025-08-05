const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection and create missing tables
async function testAndFixSupabase() {
  const supabase = createClient(
    'https://txpufkxjnxhpnmydwdng.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cHVma3hqbnhocG5teWR3ZG5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ5MjQzOSwiZXhwIjoyMDY4MDY4NDM5fQ.mc9o0WbV_STZSmU8TdwBOT6L5ZpmvQepUNTSKF3b5is'
  );

  console.log('🔍 Testing Supabase connection...');

  // Test basic connection
  const { data: connectionTest, error: connectionError } = await supabase
    .from('settings')
    .select('*')
    .limit(1);

  if (connectionError) {
    console.error('❌ Connection failed:', connectionError);
    return;
  }

  console.log('✅ Supabase connection successful!');

  // Test all required tables
  const requiredTables = ['settings', 'items', 'parties', 'sales', 'purchases', 'payments', 'expenses'];
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ Table '${table}' error:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists (${data?.length || 0} records)`);
      }
    } catch (err) {
      console.error(`❌ Table '${table}' failed:`, err.message);
    }
  }

  // Test creating a simple item
  console.log('\n🧪 Testing item creation...');
  const { data: newItem, error: itemError } = await supabase
    .from('items')
    .insert({
      item_name: 'Test Item',
      sale_price: 100,
      purchase_price: 80,
      current_stock: 10
    })
    .select()
    .single();

  if (itemError) {
    console.error('❌ Failed to create test item:', itemError);
  } else {
    console.log('✅ Test item created successfully:', newItem);
  }

  // Test creating a simple party
  console.log('\n🧪 Testing party creation...');
  const { data: newParty, error: partyError } = await supabase
    .from('parties')
    .insert({
      party_name: 'Test Customer',
      party_type: 'customer',
      phone: '1234567890'
    })
    .select()
    .single();

  if (partyError) {
    console.error('❌ Failed to create test party:', partyError);
  } else {
    console.log('✅ Test party created successfully:', newParty);
  }

  console.log('\n🎯 Testing complete!');
}

testAndFixSupabase().catch(console.error);
