// Test the updated API with the new debugging
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Replicate the API logic with the same mapping as the actual API
async function testAPILogic() {
  console.log('🧪 Testing Updated API Logic...');
  
  try {
    // Step 1: Create a test party
    const testParty = {
      party_name: 'Debug Test Customer ' + Date.now(),
      party_type: 'customer',
      phone: '5555555555',
      email: 'debug@example.com',
      address: '500 Debug Street',
      city: 'Debug City',
      state: 'Debug State',
      pincode: '555555',
      gstin: 'DEBUG123456789',
      pan: 'DEBUG12345',
      credit_limit: 15000,
      balance: 300,
      is_active: true
    };

    console.log('➕ Creating party with data:', testParty);

    // Map for creation (same as API)
    const dbParty = {
      name: testParty.party_name || testParty.name,
      type: testParty.party_type || testParty.type,
      phone: testParty.phone,
      email: testParty.email,
      address: testParty.address,
      city: testParty.city,
      state: testParty.state,
      pincode: testParty.pincode,
      gstin: testParty.gstin,
      pan: testParty.pan,
      credit_limit: testParty.credit_limit || testParty.creditLimit || 0,
      balance: testParty.current_balance || testParty.balance || testParty.opening_balance || 0,
      status: testParty.is_active !== false ? 'active' : 'inactive',
    };

    const { data: createdParty, error: createError } = await supabase
      .from('parties')
      .insert([dbParty])
      .select()
      .single();

    if (createError) {
      console.log('❌ Create failed:', createError);
      return;
    }

    console.log('✅ Party created:', createdParty.name, 'ID:', createdParty.id);

    // Step 2: Test update with the API mapping logic
    const updates = {
      party_name: 'Updated Debug Customer',
      party_type: 'supplier',
      phone: '6666666666',
      email: 'updated-debug@example.com',
      credit_limit: 20000,
      current_balance: 500,
      is_active: true
    };

    console.log('🔄 Updating party with data:', updates);

    // Map for update (same as API)
    const dbUpdates = {
      name: updates.party_name || updates.name,
      type: updates.party_type || updates.type,
      phone: updates.phone,
      email: updates.email,
      address: updates.address,
      city: updates.city,
      state: updates.state,
      pincode: updates.pincode,
      gstin: updates.gstin,
      pan: updates.pan,
      credit_limit: updates.credit_limit || updates.creditLimit,
      balance: updates.current_balance || updates.balance,
      status: updates.is_active !== false ? 'active' : 'inactive',
    };

    // Remove undefined values
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });

    console.log('📤 Mapped database updates:', dbUpdates);

    const { data: updatedParty, error: updateError } = await supabase
      .from('parties')
      .update(dbUpdates)
      .eq('id', createdParty.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Update failed:', updateError);
    } else {
      console.log('✅ Party updated successfully!');
      console.log('Final party:', {
        id: updatedParty.id,
        name: updatedParty.name,
        type: updatedParty.type,
        phone: updatedParty.phone,
        email: updatedParty.email,
        credit_limit: updatedParty.credit_limit,
        balance: updatedParty.balance,
        status: updatedParty.status
      });
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testAPILogic();
