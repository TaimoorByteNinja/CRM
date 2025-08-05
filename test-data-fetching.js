// Test to verify purchase and expense APIs are working correctly
const testPhone = '+923034091907';

async function testDataFetching() {
    try {
        console.log('=== Testing Purchase Data Fetching ===');
        const purchasesResponse = await fetch(`http://localhost:3000/api/business-hub/purchases/?phone=${encodeURIComponent(testPhone)}`);
        
        if (purchasesResponse.ok) {
            const purchases = await purchasesResponse.json();
            console.log(`✅ Purchases API working: Found ${purchases.length} purchases`);
            
            purchases.forEach((purchase, index) => {
                console.log(`${index + 1}. Purchase ${purchase.purchase_id}:`);
                console.log(`   - Supplier: ${purchase.supplier?.party_name || purchase.supplier_name || 'No Supplier'}`);
                console.log(`   - Total: ${purchase.total_amount}`);
                console.log(`   - Status: ${purchase.status}`);
            });
        } else {
            console.error('❌ Purchases API failed:', purchasesResponse.status);
            const errorText = await purchasesResponse.text();
            console.error('Error:', errorText);
        }

        console.log('\n=== Testing Expense Data Fetching ===');
        const expensesResponse = await fetch(`http://localhost:3000/api/business-hub/expenses/?phone=${encodeURIComponent(testPhone)}`);
        
        if (expensesResponse.ok) {
            const expenses = await expensesResponse.json();
            console.log(`✅ Expenses API working: Found ${expenses.length} expenses`);
            
            expenses.forEach((expense, index) => {
                console.log(`${index + 1}. Expense ${expense.expense_number}:`);
                console.log(`   - Party: ${expense.party?.party_name || expense.party_name || 'No Party'}`);
                console.log(`   - Amount: ${expense.amount}`);
                console.log(`   - Status: ${expense.status}`);
            });
        } else {
            console.error('❌ Expenses API failed:', expensesResponse.status);
            const errorText = await expensesResponse.text();
            console.error('Error:', errorText);
        }

        console.log('\n=== Testing Phone Number Integration ===');
        console.log(`Testing with phone: ${testPhone}`);
        console.log('Both APIs should filter data by this phone number only.');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

testDataFetching();
