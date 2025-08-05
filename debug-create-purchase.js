// Debug script to test purchases POST endpoint
const testPhone = '+923034091907';

async function testCreatePurchase() {
    try {
        console.log('Testing Purchases POST API...');
        
        const newPurchase = {
            bill_number: 'TEST-001',
            supplier_id: null,
            subtotal: 100,
            tax: 18,
            tax_rate: 18,
            discount: 0,
            total: 118,
            status: 'draft',
            payment_status: 'pending',
            payment_method: '',
            notes: 'Test purchase',
            phone: testPhone
        };
        
        const response = await fetch('http://localhost:3000/api/business-hub/purchases/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPurchase)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('Created purchase:', JSON.stringify(data, null, 2));
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testCreatePurchase();
