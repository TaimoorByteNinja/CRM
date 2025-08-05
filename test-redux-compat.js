// Test if Redux store with fixed Supabase client works
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://txpufkxjnxhpnmydwdng.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cHVma3hqbnhocG5teWR3ZG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTI0MzksImV4cCI6MjA2ODA2ODQzOX0.kgf6HZRrKMRgO76Mb2lhHBo1dV-FJyGSDPfyfoFRwTI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testReduxCompatibility() {
  console.log('🧪 Testing Redux-compatible Supabase client...');
  
  try {
    // Test the exact same API calls that Redux will make
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Failed to fetch items:', error);
      return;
    }
    
    console.log('✅ Successfully fetched items:', data.length);
    
    // Test creating an item using anon key (should work with proper RLS policies)
    const newItem = {
      name: 'Redux Test Item',
      sku: 'REDUX-001',
      sale_price: 199.99,
      purchase_price: 149.99,
      stock: 50,
      min_stock: 5,
      description: 'Item created via Redux-compatible client',
      tax_rate: 12,
      status: 'active',
      type: 'product'
    };
    
    const { data: createResult, error: createError } = await supabase
      .from('items')
      .insert(newItem)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Failed to create item:', createError);
      // This might fail due to RLS policies with anon key
      console.log('📝 Note: This is expected if RLS policies require authentication');
    } else {
      console.log('✅ Successfully created item via anon key:', createResult.id);
    }
    
    console.log('🎯 Redux compatibility test complete!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testReduxCompatibility();
