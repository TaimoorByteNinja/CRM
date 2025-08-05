// Simple test party creation with correct schema
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPartyCreation() {
  console.log('🧪 Testing Party Creation with Correct Schema...');
  
  try {
    // Test party data matching actual table structure
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

    console.log('Creating party:', testParty.name);
    
    const { data, error } = await supabase
      .from('parties')
      .insert([testParty])
      .select()
      .single();

    if (error) {
      console.log('❌ Insert error:', error.message);
    } else {
      console.log('✅ Party created successfully!');
      console.log('ID:', data.id);
      console.log('Name:', data.name);
      console.log('Type:', data.type);
    }

    // Test fetch
    console.log('\n📋 Fetching all parties...');
    const { data: allParties, error: fetchError } = await supabase
      .from('parties')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (fetchError) {
      console.log('❌ Fetch error:', fetchError.message);
    } else {
      console.log(`✅ Found ${allParties.length} active parties`);
      allParties.slice(0, 3).forEach(party => {
        console.log(`- ${party.name} (${party.type})`);
      });
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testPartyCreation();
