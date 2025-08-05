// Check party types and data
const testPhone = '+923034091907';

async function checkPartyTypes() {
    try {
        console.log('Checking all parties and their types...');
        
        const partiesResponse = await fetch(`http://localhost:3000/api/business-hub/parties/?phone=${encodeURIComponent(testPhone)}`);
        if (partiesResponse.ok) {
            const parties = await partiesResponse.json();
            console.log(`Found ${parties.length} total parties:`);
            
            parties.forEach(party => {
                console.log(`- Name: "${party.party_name}" | Type: "${party.party_type}" | ID: ${party.id}`);
            });
            
            // Group by type
            const byType = parties.reduce((acc, party) => {
                const type = party.party_type || 'undefined';
                if (!acc[type]) acc[type] = [];
                acc[type].push(party.party_name);
                return acc;
            }, {});
            
            console.log('\nGrouped by type:');
            Object.entries(byType).forEach(([type, names]) => {
                console.log(`${type}: ${names.join(', ')}`);
            });
            
        } else {
            console.error('Failed to fetch parties:', partiesResponse.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

checkPartyTypes();
