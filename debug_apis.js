const { default: fetch } = require('node-fetch');

async function debugAPI() {
  const testPhone = '+923034091907';
  
  console.log('🔍 Debugging API Errors...\n');

  try {
    // Test Bank Accounts with detailed error response
    console.log('1️⃣ Testing Bank Accounts API with error details');
    const bankResponse = await fetch(`http://localhost:3000/api/business-hub/bank-accounts?phone=${encodeURIComponent(testPhone)}`);
    const bankData = await bankResponse.text();
    console.log('Bank Accounts Response:', bankResponse.status);
    console.log('Bank Accounts Data:', bankData);

    console.log('\n2️⃣ Testing Cash Transactions API with error details');
    const cashResponse = await fetch(`http://localhost:3000/api/business-hub/cash-transactions?phone=${encodeURIComponent(testPhone)}`);
    const cashData = await cashResponse.text();
    console.log('Cash Transactions Response:', cashResponse.status);
    console.log('Cash Transactions Data:', cashData);

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugAPI();
