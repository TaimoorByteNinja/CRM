import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper function to update party balance
async function updatePartyBalance(partyId: string, amount: number, operation: 'add' | 'subtract', phoneNumber: string) {
  try {
    // Get current party balance from user-specific table
    const { data: party, error: fetchError } = await supabase
      .from('user_parties')
      .select('balance, total_transactions')
      .eq('id', partyId)
      .eq('phone_number', phoneNumber)
      .single();

    if (fetchError) {
      console.error('Error fetching party:', fetchError);
      return false;
    }

    // Calculate new balance
    const currentBalance = party.balance || 0;
    const newBalance = operation === 'add' 
      ? currentBalance + amount 
      : currentBalance - amount;

    // Update party balance and transaction count
    const { error: updateError } = await supabase
      .from('user_parties')
      .update({
        balance: newBalance,
        total_transactions: (party.total_transactions || 0) + 1,
        last_transaction: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', partyId)
      .eq('phone_number', phoneNumber);

    if (updateError) {
      console.error('Error updating party balance:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updatePartyBalance:', error);
    return false;
  }
}

// GET: List all purchases for a specific user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_purchases')
      .select('*')
      .eq('phone_number', phone)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user purchases:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If we have purchases, try to get supplier information separately
    const purchasesWithSuppliers = await Promise.all((data || []).map(async (purchase) => {
      if (purchase.supplier_id) {
        try {
          // Try to find supplier by UUID id first, then by party_id
          let { data: supplier } = await supabase
            .from('user_parties')
            .select('id, party_name, phone, email')
            .eq('id', purchase.supplier_id)
            .eq('phone_number', phone)
            .single();
          
          // If not found by id, try by party_id
          if (!supplier) {
            const { data: supplierByPartyId } = await supabase
              .from('user_parties')
              .select('id, party_name, phone, email')
              .eq('party_id', purchase.supplier_id)
              .eq('phone_number', phone)
              .single();
            supplier = supplierByPartyId;
          }
          
          return {
            ...purchase,
            supplier: supplier || null,
            supplier_name: supplier?.party_name || purchase.supplier_name || 'No Supplier'
          };
        } catch (error) {
          console.warn('Could not fetch supplier for purchase:', purchase.id);
          return purchase;
        }
      }
      return purchase;
    }));

    return NextResponse.json(purchasesWithSuppliers);
  } catch (error) {
    console.error('Error in purchases GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new purchase for a specific user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, ...purchaseData } = body;
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    
    // Map to the actual database schema (old structure)
    const purchase = {
      purchase_id: purchaseData.bill_number || purchaseData.purchase_id || `PUR-${Date.now()}`,
      supplier_id: purchaseData.supplier_id || null,
      supplier_name: purchaseData.supplier_name || '',
      purchase_date: purchaseData.purchase_date || new Date().toISOString().split('T')[0],
      total_amount: purchaseData.total || purchaseData.total_amount || 0,
      paid_amount: purchaseData.paid_amount || 0,
      balance_amount: purchaseData.balance_amount || (purchaseData.total || purchaseData.total_amount || 0),
      status: purchaseData.status || 'active',
      purchase_data: {
        bill_number: purchaseData.bill_number,
        subtotal: purchaseData.subtotal || 0,
        tax: purchaseData.tax || 0,
        tax_rate: purchaseData.tax_rate || 0,
        discount: purchaseData.discount || 0,
        payment_status: purchaseData.payment_status || 'pending',
        payment_method: purchaseData.payment_method || '',
        notes: purchaseData.notes || '',
        ...purchaseData
      },
      phone_number: phone,
    };

    // Insert the purchase
    const { data: newPurchase, error: insertError } = await supabase
      .from('user_purchases')
      .insert([purchase])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user purchase:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    // Also insert into user_business_transactions table (for overview page analytics)
    const purchaseItems = purchaseData.items || [];
    const firstItem = purchaseItems[0] || {};
    
    const businessTransactionData = {
      phone_number: phone,
      type: 'purchase',
      total_price: purchase.total_amount || 0,
      payment_status: purchaseData.payment_status || 'pending',
      customer_supplier_name: purchase.supplier_name || 'Supplier',
      item_name: firstItem.itemName || firstItem.item_name || 'Purchase Item',
      quantity: firstItem.quantity || 1,
      timestamp: new Date().toISOString()
    };
    
    console.log('💼 Also inserting purchase into user_business_transactions:', businessTransactionData);
    
    const { error: businessTransactionError } = await supabase
      .from('user_business_transactions')
      .insert([businessTransactionData]);
    
    if (businessTransactionError) {
      console.error('⚠️ Failed to insert purchase into user_business_transactions:', businessTransactionError);
      // Don't fail the entire operation, just log the error
    } else {
      console.log('✅ Successfully inserted purchase into user_business_transactions');
    }

    // Update party balance if supplier is specified and purchase is not draft
    if (purchase.supplier_id && purchase.status !== 'draft' && purchase.total_amount > 0) {
      const balanceUpdated = await updatePartyBalance(
        purchase.supplier_id, 
        purchase.total_amount, 
        'subtract', // Subtract from supplier balance (we owe them)
        phone
      );
      
      if (!balanceUpdated) {
        console.warn('Failed to update party balance for purchase:', newPurchase.id);
      }
    }

    return NextResponse.json(newPurchase, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}