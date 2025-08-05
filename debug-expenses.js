// Debug script to test expenses API endpoint
const testPhone = '+923034091907';

async function testExpensesAPI() {
    try {
        console.log('Testing Expenses API...');
        
        const response = await fetch(`http://localhost:3000/api/business-hub/expenses/?phone=${encodeURIComponent(testPhone)}`);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('Expenses data:', JSON.stringify(data, null, 2));
            console.log('Number of expenses:', data.length);
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testExpensesAPI();
