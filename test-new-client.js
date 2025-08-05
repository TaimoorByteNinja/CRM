const { itemsAPI, partiesAPI, salesAPI, testConnection } = require('./lib/supabase-fixed-client.ts');

async function testNewClient() {
  console.log('🧪 Testing new Supabase client...');
  
  // Test connection
  const connectionResult = await testConnection();
  if (!connectionResult.success) {
    console.error('Connection failed:', connectionResult.error);
    return;
  }
  
  // Test creating an item
  console.log('\n📦 Testing item creation...');
  try {
    const newItem = await itemsAPI.create({
      item_name: 'Test Product',
      sale_price: 100,
      purchase_price: 80,
      current_stock: 50,
      description: 'Test product for API testing'
    });
    console.log('✅ Item created:', newItem);
  } catch (error) {
    console.error('❌ Item creation failed:', error);
  }
  
  // Test getting all items
  console.log('\n📦 Testing get all items...');
  try {
    const items = await itemsAPI.getAll();
    console.log('✅ Items retrieved:', items.length, 'items');
  } catch (error) {
    console.error('❌ Get items failed:', error);
  }
  
  // Test creating a party
  console.log('\n👥 Testing party creation...');
  try {
    const newParty = await partiesAPI.create({
      party_name: 'Test Customer',
      party_type: 'customer',
      phone: '9876543210',
      email: 'test@customer.com'
    });
    console.log('✅ Party created:', newParty);
  } catch (error) {
    console.error('❌ Party creation failed:', error);
  }
  
  // Test getting all parties
  console.log('\n👥 Testing get all parties...');
  try {
    const parties = await partiesAPI.getAll();
    console.log('✅ Parties retrieved:', parties.length, 'parties');
  } catch (error) {
    console.error('❌ Get parties failed:', error);
  }
  
  console.log('\n🎯 Testing complete!');
}

testNewClient().catch(console.error);
