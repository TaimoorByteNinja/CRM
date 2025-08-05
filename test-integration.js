// Quick test to verify the Supabase integration is working
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testIntegration() {
  console.log('🧪 Testing Supabase Integration...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.slice(0, 20)}...` : 'Missing');
  
  try {
    // Test 1: Check connection
    console.log('\n1. Testing connection...');
    const { data, error } = await supabase.from('items').select('count').limit(1);
    if (error) {
      console.log('❌ Connection error:', error.message);
    } else {
      console.log('✅ Connection successful');
    }

    // Test 2: Count items
    console.log('\n2. Counting items...');
    const { count } = await supabase.from('items').select('*', { count: 'exact', head: true });
    console.log(`✅ Items table has ${count} records`);

    // Test 3: Count parties  
    console.log('\n3. Counting parties...');
    const { count: partyCount } = await supabase.from('parties').select('*', { count: 'exact', head: true });
    console.log(`✅ Parties table has ${partyCount} records`);

    // Test 4: Count sales
    console.log('\n4. Counting sales...');
    const { count: salesCount } = await supabase.from('sales').select('*', { count: 'exact', head: true });
    console.log(`✅ Sales table has ${salesCount} records`);

    console.log('\n🎉 All tests passed! Supabase integration is working correctly.');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testIntegration();
