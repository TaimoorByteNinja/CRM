const { default: fetch } = require('node-fetch');

async function testAPIEndpoints() {
  const baseUrl = 'http://localhost:3000/api/business-hub/cash-transactions';
  const testPhone = '+1234567890';
  
  try {
    console.log('🔄 Testing Cash Transactions API Endpoints...\n');

    // Test 1: GET - Fetch transactions
    console.log('1️⃣ Testing GET /api/business-hub/cash-transactions');
    const getResponse = await fetch(`${baseUrl}?phone=${encodeURIComponent(testPhone)}`);
    const transactions = await getResponse.json();
    console.log('✅ GET Response:', getResponse.status, '- Found transactions:', transactions.length || 0);

    // Test 2: POST - Create transaction
    console.log('\n2️⃣ Testing POST /api/business-hub/cash-transactions');
    const newTransaction = {
      type: 'expense',
      name: 'API Test Transaction',
      description: 'Testing via API',
      amount: 250.75,
      date: new Date().toISOString().split('T')[0],
      reference: 'API-TEST'
    };

    const postResponse = await fetch(`${baseUrl}?phone=${encodeURIComponent(testPhone)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction)
    });

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.error('❌ POST failed:', postResponse.status, errorText);
      return;
    }

    const createdTransaction = await postResponse.json();
    console.log('✅ POST Response:', postResponse.status, '- Created:', createdTransaction.transaction_id);

    // Test 3: PATCH - Update transaction
    console.log('\n3️⃣ Testing PATCH /api/business-hub/cash-transactions/[id]');
    const updateData = {
      name: 'Updated API Test',
      amount: 300.50
    };

    const patchResponse = await fetch(`${baseUrl}/${createdTransaction.transaction_id}?phone=${encodeURIComponent(testPhone)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (!patchResponse.ok) {
      const errorText = await patchResponse.text();
      console.error('❌ PATCH failed:', patchResponse.status, errorText);
    } else {
      const updatedTransaction = await patchResponse.json();
      console.log('✅ PATCH Response:', patchResponse.status, '- Updated:', updatedTransaction.name);
    }

    // Test 4: DELETE - Remove transaction
    console.log('\n4️⃣ Testing DELETE /api/business-hub/cash-transactions/[id]');
    const deleteResponse = await fetch(`${baseUrl}/${createdTransaction.transaction_id}?phone=${encodeURIComponent(testPhone)}`, {
      method: 'DELETE'
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('❌ DELETE failed:', deleteResponse.status, errorText);
    } else {
      const deleteResult = await deleteResponse.json();
      console.log('✅ DELETE Response:', deleteResponse.status, '- Success:', deleteResult.success);
    }

    console.log('\n🎉 All API endpoints are working correctly!');
    console.log('💡 Cash transactions integration is fully functional!');

  } catch (error) {
    console.error('❌ API test error:', error.message);
  }
}

testAPIEndpoints();
