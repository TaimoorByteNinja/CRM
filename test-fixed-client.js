const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://txpufkxjnxhpnmydwdng.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cHVma3hqbnhocG5teWR3ZG5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ5MjQzOSwiZXhwIjoyMDY4MDY4NDM5fQ.mc9o0WbV_STZSmU8TdwBOT6L5ZpmvQepUNTSKF3b5is';

const supabase = createClient(supabaseUrl, supabaseKey);

// Items API - Matches actual database schema
const itemsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Items API error:', error);
      throw error;
    }
    
    // Map database fields to expected interface
    return data?.map(item => ({
      id: item.id,
      item_name: item.name,
      item_code: item.sku || '',
      sale_price: item.sale_price,
      purchase_price: item.purchase_price,
      current_stock: item.stock,
      description: item.description,
      tax_rate: item.tax_rate,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at
    })) || [];
  },

  async create(itemData) {
    console.log('Creating item with data:', itemData);
    
    // Map interface fields to database fields
    const dbData = {
      name: itemData.item_name || itemData.name,
      sku: itemData.item_code || itemData.sku || '',
      sale_price: itemData.sale_price || itemData.unit_price || 0,
      purchase_price: itemData.purchase_price || 0,
      stock: itemData.current_stock || itemData.stock || 0,
      min_stock: itemData.min_stock || 0,
      description: itemData.description || '',
      tax_rate: itemData.tax_rate || 0,
      status: itemData.status || 'active',
      type: itemData.type || 'product'
    };

    console.log('Mapped data for database:', dbData);

    const { data, error } = await supabase
      .from('items')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Create item error:', error);
      throw error;
    }
    
    return {
      id: data.id,
      item_name: data.name,
      item_code: data.sku,
      sale_price: data.sale_price,
      purchase_price: data.purchase_price,
      current_stock: data.stock,
      description: data.description,
      status: data.status,
      created_at: data.created_at
    };
  }
};

// Parties API
const partiesAPI = {
  async getAll(type) {
    let query = supabase
      .from('parties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Parties API error:', error);
      throw error;
    }
    
    return data?.map(party => ({
      id: party.id,
      party_name: party.name,
      party_type: party.type,
      phone: party.phone,
      email: party.email,
      address: party.address,
      current_balance: party.balance,
      status: party.status,
      created_at: party.created_at
    })) || [];
  },

  async create(partyData) {
    console.log('Creating party with data:', partyData);
    
    const dbData = {
      name: partyData.party_name || partyData.name,
      type: partyData.party_type || partyData.type,
      phone: partyData.phone || '',
      email: partyData.email || '',
      address: partyData.address || '',
      balance: partyData.current_balance || 0,
      status: partyData.status || 'active'
    };

    const { data, error } = await supabase
      .from('parties')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Create party error:', error);
      throw error;
    }
    
    return {
      id: data.id,
      party_name: data.name,
      party_type: data.type,
      phone: data.phone,
      email: data.email,
      address: data.address,
      current_balance: data.balance,
      status: data.status,
      created_at: data.created_at
    };
  }
};

// Test function
async function testFixedClient() {
  console.log('🧪 Testing fixed Supabase client...');
  
  // Test connection
  try {
    const { data, error } = await supabase.from('settings').select('*').limit(1);
    if (error) throw error;
    console.log('✅ Connection successful');
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return;
  }
  
  // Test creating an item
  console.log('\n📦 Testing item creation...');
  try {
    const newItem = await itemsAPI.create({
      item_name: 'Fixed API Test Product',
      sale_price: 150,
      purchase_price: 120,
      current_stock: 25,
      description: 'Product created with fixed API'
    });
    console.log('✅ Item created successfully:', newItem);
  } catch (error) {
    console.error('❌ Item creation failed:', error);
  }
  
  // Test getting all items
  console.log('\n📦 Testing get all items...');
  try {
    const items = await itemsAPI.getAll();
    console.log('✅ Items retrieved:', items.length, 'total items');
    if (items.length > 0) {
      console.log('Sample item:', items[0]);
    }
  } catch (error) {
    console.error('❌ Get items failed:', error);
  }
  
  // Test creating a party
  console.log('\n👥 Testing party creation...');
  try {
    const newParty = await partiesAPI.create({
      party_name: 'Fixed API Test Customer',
      party_type: 'customer',
      phone: '8888888888',
      email: 'fixed-api@test.com'
    });
    console.log('✅ Party created successfully:', newParty);
  } catch (error) {
    console.error('❌ Party creation failed:', error);
  }
  
  // Test getting all parties
  console.log('\n👥 Testing get all parties...');
  try {
    const parties = await partiesAPI.getAll();
    console.log('✅ Parties retrieved:', parties.length, 'total parties');
    if (parties.length > 0) {
      console.log('Sample party:', parties[0]);
    }
  } catch (error) {
    console.error('❌ Get parties failed:', error);
  }
  
  console.log('\n🎯 Fixed client testing complete!');
}

testFixedClient().catch(console.error);
