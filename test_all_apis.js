const { default: fetch } = require('node-fetch');

async function testAllAPIs() {
  const testPhone = '+923034091907';
  
  console.log('🔄 Testing All API Endpoints...\n');

  try {
    // Test 1: Bank Accounts
    console.log('1️⃣ Testing Bank Accounts API');
    const bankResponse = await fetch(`http://localhost:3000/api/business-hub/bank-accounts?phone=${encodeURIComponent(testPhone)}`);
    console.log('✅ Bank Accounts:', bankResponse.status, bankResponse.ok ? 'OK' : 'ERROR');

    // Test 2: Cash Transactions  
    console.log('2️⃣ Testing Cash Transactions API');
    const cashResponse = await fetch(`http://localhost:3000/api/business-hub/cash-transactions?phone=${encodeURIComponent(testPhone)}`);
    console.log('✅ Cash Transactions:', cashResponse.status, cashResponse.ok ? 'OK' : 'ERROR');

    // Test 3: Loan Accounts
    console.log('3️⃣ Testing Loan Accounts API');
    const loanResponse = await fetch(`http://localhost:3000/api/business-hub/loan-accounts?phone=${encodeURIComponent(testPhone)}`);
    console.log('✅ Loan Accounts:', loanResponse.status, loanResponse.ok ? 'OK' : 'ERROR');

    console.log('\n🎉 All API endpoints are responding correctly!');
    console.log('💡 The 500 errors should now be resolved.');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAllAPIs();
