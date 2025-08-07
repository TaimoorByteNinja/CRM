import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const phoneNumber = url.searchParams.get('phone');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    console.log('🔄 Recent Transactions: Fetching for phone:', phoneNumber);

    // Fetch recent transactions from user_business_transactions
    const { data: transactions, error } = await supabase
      .from('user_business_transactions')
      .select(`
        id,
        type,
        total_price,
        timestamp,
        payment_status,
        customer_supplier_name,
        item_name,
        quantity
      `)
      .eq('phone_number', phoneNumber)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Recent Transactions: Database error:', error);
      
      // Check if it's a table not found error
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.warn('⚠️ user_business_transactions table not found. Returning empty array.');
        console.warn('💡 Please run the updated SQL schema in Supabase dashboard.');
        
        // Return empty data instead of error
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'No transactions found - database table not set up yet'
        });
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Recent Transactions: Found', transactions?.length || 0, 'transactions');

    // Transform the data for frontend consumption
    const transformedTransactions = (transactions || []).map(transaction => ({
      id: transaction.id,
      type: transaction.type === 'sale' ? 'Sale' : 'Purchase',
      party: transaction.customer_supplier_name || 'Unknown Party',
      amount: transaction.total_price || 0,
      status: transaction.payment_status === 'paid' ? 'Paid' : 'Pending',
      time: new Date(transaction.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      item: transaction.item_name,
      quantity: transaction.quantity,
      rawDate: transaction.timestamp
    }));

    return NextResponse.json({
      success: true,
      data: transformedTransactions,
      count: transformedTransactions.length
    });

  } catch (error) {
    console.error('❌ Recent Transactions: API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent transactions' },
      { status: 500 }
    );
  }
}
