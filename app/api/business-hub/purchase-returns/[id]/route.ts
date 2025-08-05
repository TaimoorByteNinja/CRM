import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper function to update party balance
async function updatePartyBalance(partyId: string, amount: number, operation: 'add' | 'subtract') {
  try {
    // Get current party balance
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('balance, total_transactions')
      .eq('id', partyId)
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
      .from('parties')
      .update({
        balance: newBalance,
        total_transactions: (party.total_transactions || 0) + 1,
        last_transaction: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', partyId);

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

// GET: Get a single purchase return by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('purchase_returns')
    .select(`
      *,
      parties:supplier_id (
        id,
        name,
        phone,
        email,
        city,
        state,
        balance
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH: Update a purchase return by ID
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Get the current purchase return to compare status changes
    const { data: currentReturn, error: fetchError } = await supabase
      .from('purchase_returns')
      .select('status, supplier_id, total')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 });
    }

    const purchaseReturn = {
      return_number: body.return_number,
      supplier_id: body.supplier_id || null,
      original_purchase_id: body.original_purchase_id || null,
      subtotal: body.subtotal || 0,
      tax: body.tax || 0,
      tax_rate: body.tax_rate || 0,
      discount: body.discount || 0,
      total: body.total || 0,
      status: body.status || 'draft',
      payment_status: body.payment_status || 'pending',
      payment_method: body.payment_method || '',
      notes: body.notes || '',
      date: body.date || new Date().toISOString().split('T')[0],
    };

    const { data, error } = await supabase
      .from('purchase_returns')
      .update(purchaseReturn)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Handle party balance updates based on status changes
    const newStatus = purchaseReturn.status;
    const oldStatus = currentReturn.status;
    const supplierId = purchaseReturn.supplier_id;
    const totalAmount = purchaseReturn.total || 0;

    // If status changed from draft to active status and supplier exists
    if (oldStatus === 'draft' && newStatus !== 'draft' && supplierId && totalAmount > 0) {
      const balanceUpdated = await updatePartyBalance(
        supplierId, 
        totalAmount, 
        'add' // Add to supplier balance (we get refunded)
      );
      
      if (!balanceUpdated) {
        console.warn('Failed to update party balance for purchase return update:', id);
      }
    }
    // If status changed from active to draft and supplier exists
    else if (oldStatus !== 'draft' && newStatus === 'draft' && supplierId && totalAmount > 0) {
      const balanceUpdated = await updatePartyBalance(
        supplierId, 
        totalAmount, 
        'subtract' // Subtract from supplier balance (reversing the transaction)
      );
      
      if (!balanceUpdated) {
        console.warn('Failed to update party balance for purchase return update:', id);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating purchase return:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a purchase return by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get the purchase return to check if we need to reverse balance changes
    const { data: purchaseReturn, error: fetchError } = await supabase
      .from('purchase_returns')
      .select('status, supplier_id, total')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 });
    }

    // Delete the purchase return
    const { error } = await supabase.from('purchase_returns').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // If purchase return was active and had a supplier, reverse the balance change
    if (purchaseReturn.status !== 'draft' && purchaseReturn.supplier_id && purchaseReturn.total > 0) {
      const balanceUpdated = await updatePartyBalance(
        purchaseReturn.supplier_id, 
        purchaseReturn.total, 
        'subtract' // Subtract from supplier balance (reversing the transaction)
      );
      
      if (!balanceUpdated) {
        console.warn('Failed to update party balance for purchase return deletion:', id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting purchase return:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 