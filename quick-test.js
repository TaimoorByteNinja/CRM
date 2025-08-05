const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://txpufkxjnxhpnmydwdng.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cHVma3hqbnhocG5teWR3ZG5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ5MjQzOSwiZXhwIjoyMDY4MDY4NDM5fQ.mc9o0WbV_STZSmU8TdwBOT6L5ZpmvQepUNTSKF3b5is'
);

async function quickTest() {
  try {
    console.log('🧪 Quick Supabase test...');
    
    // Test creating an item with the correct schema
    const newItem = {
      name: 'Test Product from App',
      sku: 'TEST-001',
      sale_price: 99.99,
      purchase_price: 79.99,
      stock: 100,
      min_stock: 10,
      description: 'Test product created from the app',
      tax_rate: 18,
      status: 'active',
      type: 'product'
    };
    
    console.log('📦 Creating item:', newItem);
    const { data: itemResult, error: itemError } = await supabase
      .from('items')
      .insert(newItem)
      .select()
      .single();
    
    if (itemError) {
      console.error('❌ Item creation failed:', itemError);
    } else {
      console.log('✅ Item created successfully:', itemResult.id, itemResult.name);
    }
    
    // Test creating a party
    const newParty = {
      name: 'Test Customer from App',
      type: 'customer',
      phone: '1234567890',
      email: 'test@app.com',
      address: '123 Test Street',
      balance: 0,
      status: 'active'
    };
    
    console.log('👥 Creating party:', newParty);
    const { data: partyResult, error: partyError } = await supabase
      .from('parties')
      .insert(newParty)
      .select()
      .single();
    
    if (partyError) {
      console.error('❌ Party creation failed:', partyError);
    } else {
      console.log('✅ Party created successfully:', partyResult.id, partyResult.name);
    }
    
    // Test getting all items
    const { data: allItems, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .limit(5);
    
    if (itemsError) {
      console.error('❌ Failed to get items:', itemsError);
    } else {
      console.log('📦 Total items in database:', allItems.length);
    }
    
    // Test getting all parties  
    const { data: allParties, error: partiesError } = await supabase
      .from('parties')
      .select('*')
      .limit(5);
    
    if (partiesError) {
      console.error('❌ Failed to get parties:', partiesError);
    } else {
      console.log('👥 Total parties in database:', allParties.length);
    }
    
    console.log('🎯 Quick test completed successfully!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

quickTest();
