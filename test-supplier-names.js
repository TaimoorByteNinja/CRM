// Test supplier name resolution
const testPhone = '+923034091907';

async function testSupplierNames() {
    try {
        console.log('Testing supplier name resolution...');
        
        // Get all purchases
        const response = await fetch(`http://localhost:3000/api/business-hub/purchases/?phone=${encodeURIComponent(testPhone)}`);
        
        if (response.ok) {
            const purchases = await response.json();
            console.log(`Found ${purchases.length} purchases:`);
            
            purchases.forEach((purchase, index) => {
                console.log(`\n${index + 1}. Purchase: ${purchase.purchase_id}`);
                console.log(`   Supplier ID: ${purchase.supplier_id}`);
                console.log(`   Supplier Name: ${purchase.supplier_name}`);
                console.log(`   Supplier Object:`, purchase.supplier);
                console.log(`   Total: ${purchase.total_amount}`);
            });
            
            // Also test getting parties to see what suppliers are available
            console.log('\n--- Available Parties ---');
            const partiesResponse = await fetch(`http://localhost:3000/api/business-hub/parties/?phone=${encodeURIComponent(testPhone)}`);
            if (partiesResponse.ok) {
                const parties = await partiesResponse.json();
                const suppliers = parties.filter(p => p.party_type === 'supplier' || p.party_type === 'both');
                console.log(`Found ${suppliers.length} suppliers:`);
                suppliers.forEach(supplier => {
                    console.log(`- ${supplier.party_name} (ID: ${supplier.id}, Party ID: ${supplier.party_id})`);
                });
            }
            
        } else {
            console.error('Failed to fetch purchases:', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testSupplierNames();
