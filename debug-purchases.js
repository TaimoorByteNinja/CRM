// Debug script to test purchases API endpoint
const testPhone = '+923034091907';

async function testPurchasesAPI() {
    try {
        console.log('Testing Purchases API...');
        
        const response = await fetch(`http://localhost:3000/api/business-hub/purchases/?phone=${encodeURIComponent(testPhone)}`);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('Purchases data:', JSON.stringify(data, null, 2));
            console.log('Number of purchases:', data.length);
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testPurchasesAPI();
