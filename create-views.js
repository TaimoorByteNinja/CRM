require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createViews() {
  console.log('Creating sales_summary view...');
  
  // First, let's check if we have sales data
  const { data: salesCheck, error: salesError } = await supabase
    .from('sales')
    .select('count')
    .limit(1);
    
  if (salesError) {
    console.error('Error checking sales table:', salesError);
    return;
  }
  
  console.log('Sales table exists, creating view...');
  
  const salesSummarySQL = `
    CREATE OR REPLACE VIEW sales_summary AS
    SELECT 
      s.user_id,
      s.id,
      s.invoice_number,
      s.invoice_date,
      p.name as customer_name,
      s.total_amount,
      s.paid_amount,
      s.balance_amount,
      s.payment_status,
      COUNT(si.id) as item_count
    FROM sales s
    LEFT JOIN parties p ON s.party_id = p.id
    LEFT JOIN sale_items si ON s.id = si.sale_id
    WHERE s.is_active = true
    GROUP BY s.id, p.name, s.user_id, s.invoice_number, s.invoice_date, s.total_amount, s.paid_amount, s.balance_amount, s.payment_status;
  `;
  
  // Execute the SQL directly
  const { data, error } = await supabase.rpc('query', {
    query: salesSummarySQL
  });
  
  if (error) {
    console.error('Error creating sales_summary view:', error);
    
    // Try alternative approach using the SQL editor endpoint
    console.log('Trying alternative approach...');
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        sql: salesSummarySQL
      })
    });
    
    if (response.ok) {
      console.log('Successfully created sales_summary view via alternative method');
    } else {
      console.error('Alternative method also failed:', await response.text());
    }
  } else {
    console.log('Successfully created sales_summary view');
  }
  
  // Test the view
  const { data: testData, error: testError } = await supabase
    .from('sales_summary')
    .select('*')
    .limit(1);
    
  if (testError) {
    console.error('Error testing sales_summary view:', testError);
  } else {
    console.log('sales_summary view is working!', testData);
  }
}

createViews().catch(console.error);
