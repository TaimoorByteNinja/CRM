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

// GET: Get a single purchase by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const { id } = params;
    
    const { data, error } = await supabase
      .from('user_purchases')
      .select('*')
      .eq('id', id)
      .eq('phone_number', phone)
      .single();
    
    if (error) {
      console.error('Error fetching purchase:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Get supplier information if exists
    if (data.supplier_id) {
      try {
        const { data: supplier } = await supabase
          .from('user_parties')
          .select('id, party_name, phone, email')
          .eq('id', data.supplier_id)
          .eq('phone_number', phone)
          .single();
        
        data.supplier = supplier;
        data.supplier_name = supplier?.party_name || '';
      } catch (error) {
        console.warn('Could not fetch supplier for purchase:', id);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update a purchase by ID
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { phone, ...purchaseData } = body;
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Get the current purchase to compare status changes
    const { data: currentPurchase, error: fetchError } = await supabase
      .from('user_purchases')
      .select('status, supplier_id, total_amount')
      .eq('id', id)
      .eq('phone_number', phone)
      .single();

    if (fetchError) {
      console.error('Error fetching current purchase:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 404 });
    }

    // Map to the actual database schema
    const purchase = {
      purchase_id: purchaseData.bill_number || purchaseData.purchase_id,
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
    };

    const { data, error } = await supabase
      .from('user_purchases')
      .update(purchase)
      .eq('id', id)
      .eq('phone_number', phone)
      .select()
      .single();

    if (error) {
      console.error('Error updating purchase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle party balance updates based on status changes
    const newStatus = purchase.status;
    const oldStatus = currentPurchase.status;
    const supplierId = purchase.supplier_id;
    const totalAmount = purchase.total_amount || 0;

    // If status changed from draft to active status and supplier exists
    if (oldStatus === 'draft' && newStatus !== 'draft' && supplierId && totalAmount > 0) {
      const balanceUpdated = await updatePartyBalance(
        supplierId, 
        totalAmount, 
        'subtract', // Subtract from supplier balance (we owe them)
        phone
      );
      
      if (!balanceUpdated) {
        console.warn('Failed to update party balance for purchase update:', id);
      }
    }
    // If status changed from active to draft and supplier exists
    else if (oldStatus !== 'draft' && newStatus === 'draft' && supplierId && currentPurchase.total_amount > 0) {
      const balanceUpdated = await updatePartyBalance(
        supplierId, 
        currentPurchase.total_amount, 
        'add', // Add back to supplier balance (reversing the transaction)
        phone
      );
      
      if (!balanceUpdated) {
        console.warn('Failed to reverse party balance for purchase update:', id);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a purchase by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const { id } = params;
    
    // Get the purchase to check if we need to reverse balance changes
    const { data: purchase, error: fetchError } = await supabase
      .from('user_purchases')
      .select('status, supplier_id, total_amount')
      .eq('id', id)
      .eq('phone_number', phone)
      .single();

    if (fetchError) {
      console.error('Error fetching purchase for deletion:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 404 });
    }

    // Delete the purchase
    const { error } = await supabase
      .from('user_purchases')
      .delete()
      .eq('id', id)
      .eq('phone_number', phone);

    if (error) {
      console.error('Error deleting purchase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Reverse balance changes if the purchase was not in draft status and had a supplier
    if (purchase.status !== 'draft' && purchase.supplier_id && purchase.total_amount > 0) {
      const balanceUpdated = await updatePartyBalance(
        purchase.supplier_id, 
        purchase.total_amount, 
        'add', // Add back to supplier balance (reversing the transaction)
        phone
      );
      
      if (!balanceUpdated) {
        console.warn('Failed to update party balance for purchase deletion:', id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
