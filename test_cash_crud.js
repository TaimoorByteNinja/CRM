const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCashTransactionsCRUD() {
  try {
    console.log('🧪 Testing Cash Transactions CRUD Operations...\n');
    
    const testPhone = '+1234567890';
    
    // Test 1: Create a cash transaction
    console.log('1️⃣ Testing CREATE operation...');
    const newTransaction = {
      transaction_id: `cash-${Date.now()}`,
      phone_number: testPhone,
      type: 'income',
      name: 'Test Income',
      description: 'Testing cash transaction creation',
      amount: 500.00,
      date: new Date().toISOString().split('T')[0],
      reference: 'TEST-001'
    };

    const { data: created, error: createError } = await supabase
      .from('user_cash_transactions')
      .insert(newTransaction)
      .select()
      .single();

    if (createError) {
      console.error('❌ Create failed:', createError);
      return;
    }
    console.log('✅ Created transaction:', created.transaction_id);

    // Test 2: Read the transaction
    console.log('\n2️⃣ Testing READ operation...');
    const { data: read, error: readError } = await supabase
      .from('user_cash_transactions')
      .select('*')
      .eq('phone_number', testPhone)
      .eq('transaction_id', created.transaction_id)
      .single();

    if (readError) {
      console.error('❌ Read failed:', readError);
      return;
    }
    console.log('✅ Read transaction:', read.name, '-', read.amount);

    // Test 3: Update the transaction
    console.log('\n3️⃣ Testing UPDATE operation...');
    const { data: updated, error: updateError } = await supabase
      .from('user_cash_transactions')
      .update({
        name: 'Updated Test Income',
        amount: 750.00,
        description: 'Updated description'
      })
      .eq('id', created.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      return;
    }
    console.log('✅ Updated transaction:', updated.name, '-', updated.amount);

    // Test 4: List all transactions for the phone number
    console.log('\n4️⃣ Testing LIST operation...');
    const { data: list, error: listError } = await supabase
      .from('user_cash_transactions')
      .select('*')
      .eq('phone_number', testPhone)
      .order('created_at', { ascending: false });

    if (listError) {
      console.error('❌ List failed:', listError);
      return;
    }
    console.log('✅ Found transactions:', list.length);

    // Test 5: Delete the transaction
    console.log('\n5️⃣ Testing DELETE operation...');
    const { error: deleteError } = await supabase
      .from('user_cash_transactions')
      .delete()
      .eq('id', created.id);

    if (deleteError) {
      console.error('❌ Delete failed:', deleteError);
      return;
    }
    console.log('✅ Deleted transaction successfully');

    // Test 6: Verify deletion
    console.log('\n6️⃣ Verifying deletion...');
    const { data: verifyDelete, error: verifyError } = await supabase
      .from('user_cash_transactions')
      .select('*')
      .eq('id', created.id)
      .single();

    if (verifyError && verifyError.code === 'PGRST116') {
      console.log('✅ Deletion verified - record not found');
    } else {
      console.error('❌ Deletion verification failed:', verifyError);
    }

    console.log('\n🎉 All CRUD operations completed successfully!');
    console.log('💡 Your cash transactions integration is ready to use!');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testCashTransactionsCRUD();
