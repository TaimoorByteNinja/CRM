// Test script to verify user data isolation
const testUserIsolation = async () => {
  const API_BASE = 'http://localhost:3001/api/business-hub';
  
  console.log('🧪 Testing User Data Isolation...\n');
  
  // Test with first user phone number
  const phone1 = '+1234567890';
  console.log(`📱 Testing with phone: ${phone1}`);
  
  try {
    // Test overview API
    const overviewResponse1 = await fetch(`${API_BASE}/overview?phone=${encodeURIComponent(phone1)}`);
    const overview1 = await overviewResponse1.json();
    console.log('Overview data for phone1:', overview1);
    
    // Test sales API
    const salesResponse1 = await fetch(`${API_BASE}/sales?phone=${encodeURIComponent(phone1)}`);
    const sales1 = await salesResponse1.json();
    console.log('Sales count for phone1:', sales1?.length || 0);
    
    // Test parties API
    const partiesResponse1 = await fetch(`${API_BASE}/parties?phone=${encodeURIComponent(phone1)}`);
    const parties1 = await partiesResponse1.json();
    console.log('Parties count for phone1:', parties1?.length || 0);
    
    // Test items API
    const itemsResponse1 = await fetch(`${API_BASE}/items?phone=${encodeURIComponent(phone1)}`);
    const items1 = await itemsResponse1.json();
    console.log('Items count for phone1:', items1?.length || 0);
    
  } catch (error) {
    console.error('Error testing phone1:', error);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test with second user phone number
  const phone2 = '+9876543210';
  console.log(`📱 Testing with phone: ${phone2}`);
  
  try {
    // Test overview API
    const overviewResponse2 = await fetch(`${API_BASE}/overview?phone=${encodeURIComponent(phone2)}`);
    const overview2 = await overviewResponse2.json();
    console.log('Overview data for phone2:', overview2);
    
    // Test sales API
    const salesResponse2 = await fetch(`${API_BASE}/sales?phone=${encodeURIComponent(phone2)}`);
    const sales2 = await salesResponse2.json();
    console.log('Sales count for phone2:', sales2?.length || 0);
    
    // Test parties API
    const partiesResponse2 = await fetch(`${API_BASE}/parties?phone=${encodeURIComponent(phone2)}`);
    const parties2 = await partiesResponse2.json();
    console.log('Parties count for phone2:', parties2?.length || 0);
    
    // Test items API
    const itemsResponse2 = await fetch(`${API_BASE}/items?phone=${encodeURIComponent(phone2)}`);
    const items2 = await itemsResponse2.json();
    console.log('Items count for phone2:', items2?.length || 0);
    
  } catch (error) {
    console.error('Error testing phone2:', error);
  }
  
  console.log('\n✅ User isolation test completed!');
  console.log('📋 Expected: Each phone number should have independent data (empty arrays for new users)');
};

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment - need to import fetch
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    testUserIsolation();
  }).catch(() => {
    console.error('node-fetch not available, trying with built-in fetch');
    testUserIsolation();
  });
} else {
  // Browser environment
  testUserIsolation();
}
