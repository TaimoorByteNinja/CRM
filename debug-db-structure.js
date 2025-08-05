// Debug script to test what columns exist in user_purchases table
const testPhone = '+923034091907';

async function testDatabaseStructure() {
    try {
        console.log('Testing database structure for purchases...');
        
        // Try to create with minimal required fields first
        const minimalPurchase = {
            phone: testPhone,
            purchase_id: 'TEST-001',
            total_amount: 100
        };
        
        console.log('Attempting minimal purchase creation...');
        const response1 = await fetch('http://localhost:3000/api/business-hub/purchases/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(minimalPurchase)
        });
        
        console.log('Minimal purchase response status:', response1.status);
        if (!response1.ok) {
            const errorText1 = await response1.text();
            console.log('Minimal purchase error:', errorText1);
        } else {
            const data1 = await response1.json();
            console.log('Minimal purchase success:', JSON.stringify(data1, null, 2));
        }

        // Try with old schema structure
        const oldSchemaPurchase = {
            phone: testPhone,
            purchase_id: 'TEST-002', 
            supplier_id: null,
            supplier_name: '',
            purchase_date: new Date().toISOString().split('T')[0],
            total_amount: 150,
            paid_amount: 0,
            balance_amount: 150,
            status: 'active'
        };
        
        console.log('\nAttempting old schema purchase creation...');
        const response2 = await fetch('http://localhost:3000/api/business-hub/purchases/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(oldSchemaPurchase)
        });
        
        console.log('Old schema purchase response status:', response2.status);
        if (!response2.ok) {
            const errorText2 = await response2.text();
            console.log('Old schema purchase error:', errorText2);
        } else {
            const data2 = await response2.json();
            console.log('Old schema purchase success:', JSON.stringify(data2, null, 2));
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testDatabaseStructure();
