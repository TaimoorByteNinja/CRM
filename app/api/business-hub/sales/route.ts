import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing:', { supabaseUrl, supabaseAnonKey });
}

const supabase = createClient(
  supabaseUrl!,
  supabaseAnonKey!
);

// GET: List all sales with their items and party details
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get('phone');

    console.log('🔥 Sales API GET called with phone:', phoneNumber);

    // If no phone number provided, return empty data
    if (!phoneNumber) {
      console.log('❌ No phone number provided to sales API');
      return NextResponse.json([]);
    }

    console.log('🔍 Querying user_sales table for phone:', phoneNumber);
    // First, get all sales for this user
    const { data: salesData, error: salesError } = await supabase
      .from('user_sales')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false });
    
    if (salesError) {
      console.error('Sales fetch error:', salesError);
      return NextResponse.json({ error: salesError.message }, { status: 500 });
    }

    // Then get items and parties for each sale
    const salesWithDetails = await Promise.all(
      salesData.map(async (sale) => {
        // Get sale items from sale_data JSONB column
        const saleItems = sale.sale_data?.items || [];

        // Get party details from user_parties
        const { data: party } = await supabase
          .from('user_parties')
          .select('name, email, phone, address')
          .eq('phone_number', phoneNumber)
          .eq('party_id', sale.party_id)
          .single();

        return {
          ...sale,
          items: saleItems,
          party_name: party?.name || sale.party_name || 'Customer',
          customer_email: party?.email || '',
          customer_phone: party?.phone || '',
          customer_address: party?.address || ''
        };
      })
    );

    console.log('✅ Sales API: Returning sales data:', { count: salesWithDetails.length, salesWithDetails });
    return NextResponse.json(salesWithDetails);
  } catch (error) {
    console.error('Sales API error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

// POST: Create a new sale
export async function POST(req: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing in POST:', { supabaseUrl, supabaseAnonKey });
    return NextResponse.json({ error: 'Supabase environment variables are missing.' }, { status: 500 });
  }
  
  const body = await req.json();
  console.log('Received sale POST body:', body);
  
  // Extract phone number from body or reject if missing
  const { phone, ...saleData } = body;
  if (!phone) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }
  
  // Map the sale data to the user_sales table format
  const mappedSaleData = {
    phone_number: phone,
    sale_id: saleData.id || `sale_${Date.now()}`,
    invoice_number: saleData.invoiceNumber || saleData.invoice_number || `INV-${Date.now()}`,
    party_id: saleData.party_id || saleData.partyId,
    party_name: saleData.party_name || saleData.partyName,
    invoice_date: saleData.invoice_date || saleData.date || new Date().toISOString().split('T')[0],
    due_date: saleData.due_date || saleData.dueDate,
    subtotal: saleData.subtotal || 0,
    discount_amount: saleData.discount_amount || saleData.discount || 0,
    tax_amount: saleData.tax_amount || saleData.tax || 0,
    total_amount: saleData.total_amount || saleData.total || saleData.amount || 0,
    paid_amount: saleData.paid_amount || saleData.paidAmount || 0,
    balance_amount: saleData.balance_amount || saleData.balanceAmount || 0,
    payment_status: saleData.payment_status || saleData.paymentStatus || 'unpaid',
    status: saleData.status || 'active',
    notes: saleData.notes || '',
    is_active: saleData.is_active !== false,
    sale_data: saleData // Store complete sale object for flexibility
  };
  
  // Insert into user_sales table (for sales page)
  const { data, error } = await supabase
    .from('user_sales')
    .insert([mappedSaleData])
    .select()
    .single();
    
  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  
  // Also insert into user_business_transactions table (for overview page analytics)
  const items = saleData.items || [];
  const firstItem = items[0] || {};
  
  const businessTransactionData = {
    phone_number: phone,
    type: 'sale',
    total_price: saleData.total_amount || saleData.total || saleData.amount || 0,
    payment_status: saleData.payment_status || saleData.paymentStatus || 'unpaid',
    customer_supplier_name: saleData.party_name || saleData.partyName || 'Customer',
    item_name: firstItem.itemName || firstItem.item_name || 'Sale Item',
    quantity: firstItem.quantity || 1,
    timestamp: new Date().toISOString()
  };
  
  console.log('💼 Also inserting into user_business_transactions:', businessTransactionData);
  
  const { error: businessTransactionError } = await supabase
    .from('user_business_transactions')
    .insert([businessTransactionData]);
  
  if (businessTransactionError) {
    console.error('⚠️ Failed to insert into user_business_transactions:', businessTransactionError);
    // Don't fail the entire operation, just log the error
  } else {
    console.log('✅ Successfully inserted into user_business_transactions');
  }
  
  console.log('Supabase insert success:', data);
  return NextResponse.json(data, { status: 201 });
} 