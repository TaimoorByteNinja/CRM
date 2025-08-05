// Complete integration test for all business hub modules
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://txpufkxjnxhpnmydwdng.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cHVma3hqbnhocG5teWR3ZG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTI0MzksImV4cCI6MjA2ODA2ODQzOX0.kgf6HZRrKMRgO76Mb2lhHBo1dV-FJyGSDPfyfoFRwTI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCompleteIntegration() {
  console.log('🚀 Starting Complete Business Hub Integration Test');
  console.log('='.repeat(60));
  
  const testResults = {
    items: false,
    parties: false,
    sales: false,
    purchases: false,
    database_connection: false
  };
  
  try {
    // Test 1: Database Connection
    console.log('\n1️⃣ Testing Database Connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('items')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
    } else {
      console.log('✅ Database connection successful');
      testResults.database_connection = true;
    }
    
    // Test 2: Items Module
    console.log('\n2️⃣ Testing Items Module...');
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .limit(5);
    
    if (itemsError) {
      console.error('❌ Items module failed:', itemsError);
    } else {
      console.log(`✅ Items module working - Found ${items.length} items`);
      testResults.items = true;
      
      // Show sample item structure
      if (items.length > 0) {
        console.log('📋 Sample item structure:', {
          id: items[0].id,
          name: items[0].name,
          sku: items[0].sku,
          sale_price: items[0].sale_price,
          stock: items[0].stock
        });
      }
    }
    
    // Test 3: Parties Module
    console.log('\n3️⃣ Testing Parties Module...');
    const { data: parties, error: partiesError } = await supabase
      .from('parties')
      .select('*')
      .limit(5);
    
    if (partiesError) {
      console.error('❌ Parties module failed:', partiesError);
    } else {
      console.log(`✅ Parties module working - Found ${parties.length} parties`);
      testResults.parties = true;
      
      if (parties.length > 0) {
        console.log('👥 Sample party structure:', {
          id: parties[0].id,
          name: parties[0].name,
          type: parties[0].type,
          phone: parties[0].phone
        });
      }
    }
    
    // Test 4: Sales Module
    console.log('\n4️⃣ Testing Sales Module...');
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .limit(5);
    
    if (salesError) {
      console.error('❌ Sales module failed:', salesError);
    } else {
      console.log(`✅ Sales module working - Found ${sales.length} sales`);
      testResults.sales = true;
      
      if (sales.length > 0) {
        console.log('💰 Sample sale structure:', {
          id: sales[0].id,
          invoice_number: sales[0].invoice_number,
          total_amount: sales[0].total_amount,
          status: sales[0].status
        });
      }
    }
    
    // Test 5: Purchases Module
    console.log('\n5️⃣ Testing Purchases Module...');
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('*')
      .limit(5);
    
    if (purchasesError) {
      console.error('❌ Purchases module failed:', purchasesError);
    } else {
      console.log(`✅ Purchases module working - Found ${purchases.length} purchases`);
      testResults.purchases = true;
      
      if (purchases.length > 0) {
        console.log('🛒 Sample purchase structure:', {
          id: purchases[0].id,
          invoice_number: purchases[0].invoice_number,
          total_amount: purchases[0].total_amount,
          status: purchases[0].status
        });
      }
    }
    
    // Test Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    
    Object.entries(testResults).forEach(([module, passed]) => {
      const status = passed ? '✅' : '❌';
      const name = module.replace('_', ' ').toUpperCase();
      console.log(`${status} ${name}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log('\n🎯 Overall Status:', passedTests === totalTests ? 
      `✅ ALL TESTS PASSED (${passedTests}/${totalTests})` : 
      `⚠️ PARTIAL SUCCESS (${passedTests}/${totalTests})`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 COMPLETE SUPABASE INTEGRATION SUCCESSFUL!');
      console.log('📱 Your Electron app is fully connected to Supabase');
      console.log('🔧 All business hub modules are working correctly');
    }
    
  } catch (error) {
    console.error('\n💥 Integration test failed with error:', error);
  }
}

testCompleteIntegration();
