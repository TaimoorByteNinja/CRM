import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

// POST: Create sample sales data
export async function POST() {
  try {
    // First, create a sample party (customer)
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .insert([
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 234 567 8900',
          address: '123 Main St, City, State 12345',
          type: 'customer'
        }
      ])
      .select()
      .single();

    if (partyError && partyError.code !== '23505') { // Ignore duplicate key error
      console.error('Party creation error:', partyError);
      return NextResponse.json({ error: partyError.message }, { status: 500 });
    }

    // Get existing party if insert failed due to duplicate
    let customerId = party?.id;
    if (!customerId) {
      const { data: existingParty } = await supabase
        .from('parties')
        .select('id')
        .eq('email', 'john.doe@example.com')
        .single();
      customerId = existingParty?.id;
    }

    // Create sample sales
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([
        {
          invoice_number: 'INV-001',
          party_id: customerId,
          invoice_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          subtotal: 350.00,
          discount_amount: 0.00,
          tax_amount: 35.00,
          total_amount: 385.00,
          paid_amount: 0.00,
          balance_amount: 385.00,
          payment_status: 'unpaid',
          notes: 'Sample sale for testing print functionality'
        }
      ])
      .select()
      .single();

    if (saleError) {
      console.error('Sale creation error:', saleError);
      return NextResponse.json({ error: saleError.message }, { status: 500 });
    }

    // Create sample sale items
    const { data: saleItems, error: itemsError } = await supabase
      .from('sale_items')
      .insert([
        {
          sale_id: sale.id,
          item_name: 'Product A',
          quantity: 2,
          unit_price: 100.00,
          discount_amount: 0.00,
          tax_amount: 20.00,
          total_amount: 200.00
        },
        {
          sale_id: sale.id,
          item_name: 'Product B',
          quantity: 1,
          unit_price: 150.00,
          discount_amount: 0.00,
          tax_amount: 15.00,
          total_amount: 150.00
        }
      ])
      .select();

    if (itemsError) {
      console.error('Sale items creation error:', itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Sample data created successfully',
      sale,
      saleItems
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to create sample data' }, { status: 500 });
  }
}
