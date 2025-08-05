// Test party creation to debug the issue
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPartyCreation() {
  console.log('🧪 Testing Party Creation...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.slice(0, 20)}...` : 'Missing');
  
  try {
    // Test party data with correct schema
    const testParty = {
      name: 'Test Customer ' + Date.now(),
      type: 'customer',
      phone: '1234567890',
      email: 'test@example.com',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      gstin: 'TEST123456789',
      pan: 'TEST12345',
      credit_limit: 10000,
      balance: 0,
      status: 'active'
    };

    console.log('\n1. Testing direct Supabase insert with correct schema...');
    console.log('Party data:', JSON.stringify(testParty, null, 2));
    
    const { data, error } = await supabase
      .from('parties')
      .insert([testParty])
      .select()
      .single();

    if (error) {
      console.log('❌ Insert error:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Party created successfully!');
      console.log('Created party:', JSON.stringify(data, null, 2));
    }

    // Test 2: Test via API wrapper
    console.log('\n2. Testing via API wrapper...');
    const { partiesAPI } = require('./lib/supabase-business-client');
    
    const testPartyForAPI = {
      party_name: 'API Test Customer ' + Date.now(),
      party_type: 'customer',
      phone: '9876543210',
      email: 'apitest@example.com',
      address: '456 API Street',
      city: 'API City',
      state: 'API State',
      pincode: '654321',
      gstin: 'API123456789',
      pan: 'API12345',
      credit_limit: 5000,
      balance: 100,
    };

    const apiResult = await partiesAPI.create(testPartyForAPI);
    console.log('✅ API party created successfully!');
    console.log('Created via API:', JSON.stringify(apiResult, null, 2));

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Full error:', error);
  }
}

testPartyCreation();
