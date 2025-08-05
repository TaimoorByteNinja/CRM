// Script to remove test purchases using direct database access
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const testPhone = '+923034091907';

async function removeTestPurchases() {
    try {
        console.log('Removing test purchases from database...');
        
        // Remove purchases where purchase_id starts with TEST-
        const { data: deletedData, error } = await supabase
            .from('user_purchases')
            .delete()
            .eq('phone_number', testPhone)
            .like('purchase_id', 'TEST-%')
            .select();
        
        if (error) {
            console.error('Error deleting test purchases:', error);
        } else {
            console.log(`✅ Removed ${deletedData?.length || 0} test purchases:`, deletedData);
        }
        
        // Also check for any other test data patterns
        const { data: remainingData, error: fetchError } = await supabase
            .from('user_purchases')
            .select('*')
            .eq('phone_number', testPhone);
            
        if (fetchError) {
            console.error('Error fetching remaining purchases:', fetchError);
        } else {
            console.log(`Remaining purchases: ${remainingData?.length || 0}`);
            remainingData?.forEach(purchase => {
                console.log(`- ${purchase.purchase_id}: ${purchase.total_amount}`);
            });
        }
        
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

removeTestPurchases();
