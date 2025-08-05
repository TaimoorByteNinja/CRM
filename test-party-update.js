// Test party update functionality
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPartyUpdate() {
  console.log('🧪 Testing Party Update...');
  
  try {
    // Step 1: Create a test party first
    const testParty = {
      name: 'Update Test Customer ' + Date.now(),
      type: 'customer',
      phone: '1111111111',
      email: 'updatetest@example.com',
      address: '100 Update Street',
      city: 'Update City',
      state: 'Update State',
      pincode: '111111',
      gstin: 'UPDATE123456789',
      pan: 'UPDATE12345',
      credit_limit: 5000,
      balance: 100,
      status: 'active'
    };

    console.log('\n1. Creating test party...');
    const { data: createdParty, error: createError } = await supabase
      .from('parties')
      .insert([testParty])
      .select()
      .single();

    if (createError) {
      console.log('❌ Create error:', createError.message);
      return;
    }

    console.log('✅ Party created:', createdParty.name, 'ID:', createdParty.id);

    // Step 2: Test direct update
    console.log('\n2. Testing direct update...');
    const updates = {
      name: 'Updated Customer Name',
      phone: '2222222222',
      email: 'updated@example.com',
      credit_limit: 8000,
      balance: 200
    };

    const { data: updatedParty, error: updateError } = await supabase
      .from('parties')
      .update(updates)
      .eq('id', createdParty.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Update error:', updateError.message);
      console.log('Error details:', JSON.stringify(updateError, null, 2));
    } else {
      console.log('✅ Party updated successfully!');
      console.log('Updated party name:', updatedParty.name);
      console.log('Updated phone:', updatedParty.phone);
    }

    // Step 3: Test API wrapper update
    console.log('\n3. Testing API wrapper update...');
    
    // Import the API (we'll need to handle the module loading)
    try {
      const apiUpdates = {
        party_name: 'API Updated Name ' + Date.now(),
        party_type: 'supplier',
        phone: '3333333333',
        email: 'apiupdated@example.com',
        credit_limit: 12000,
        balance: 500
      };

      // Test the API mapping logic manually
      const dbUpdates = {
        name: apiUpdates.party_name || apiUpdates.name,
        type: apiUpdates.party_type || apiUpdates.type,
        phone: apiUpdates.phone,
        email: apiUpdates.email,
        address: apiUpdates.address,
        city: apiUpdates.city,
        state: apiUpdates.state,
        pincode: apiUpdates.pincode,
        gstin: apiUpdates.gstin,
        pan: apiUpdates.pan,
        credit_limit: apiUpdates.credit_limit || apiUpdates.creditLimit,
        balance: apiUpdates.current_balance || apiUpdates.balance,
        status: apiUpdates.is_active !== false ? 'active' : 'inactive',
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });

      console.log('Mapped updates:', JSON.stringify(dbUpdates, null, 2));

      const { data: apiUpdatedParty, error: apiUpdateError } = await supabase
        .from('parties')
        .update(dbUpdates)
        .eq('id', createdParty.id)
        .select()
        .single();

      if (apiUpdateError) {
        console.log('❌ API update error:', apiUpdateError.message);
        console.log('Error details:', JSON.stringify(apiUpdateError, null, 2));
      } else {
        console.log('✅ API update successful!');
        console.log('Final party name:', apiUpdatedParty.name);
        console.log('Final type:', apiUpdatedParty.type);
      }

    } catch (apiError) {
      console.log('❌ API test failed:', apiError.message);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Full error:', error);
  }
}

testPartyUpdate();
