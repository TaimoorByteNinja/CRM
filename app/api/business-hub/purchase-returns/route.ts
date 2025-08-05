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

// GET: List all purchase returns
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Get purchase returns (stored as purchases with return status)
    const { data, error } = await supabase
      .from('user_purchases')
      .select('*')
      .eq('phone_number', phone)
      .eq('status', 'return')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching purchase returns:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get supplier information for each return
    const returnsWithSuppliers = await Promise.all((data || []).map(async (purchaseReturn) => {
      if (purchaseReturn.supplier_id) {
        try {
          const { data: supplier } = await supabase
            .from('user_parties')
            .select('id, party_name, phone, email')
            .eq('id', purchaseReturn.supplier_id)
            .eq('phone_number', phone)
            .single();
          
          return {
            ...purchaseReturn,
            supplier: supplier,
            supplier_name: supplier?.party_name || ''
          };
        } catch (error) {
          return {
            ...purchaseReturn,
            supplier: null,
            supplier_name: ''
          };
        }
      }
      return {
        ...purchaseReturn,
        supplier: null,
        supplier_name: ''
      };
    }));
    
    return NextResponse.json(returnsWithSuppliers);
  } catch (error) {
    console.error('Error in GET purchase returns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new purchase return
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, ...returnData } = body;
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    
    // Store purchase return as a special purchase record with 'return' status
    // Using the correct database schema to match your user_purchases table
    const purchaseReturn = {
      bill_number: returnData.return_number || `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique return ID
      supplier_id: returnData.supplier_id || null,
      subtotal: returnData.subtotal || 0,
      tax: returnData.tax || 0,
      tax_rate: returnData.tax_rate || 0,
      discount: returnData.discount || 0,
      total: -(returnData.total || 0), // Negative amount for returns
      status: 'return', // Special status for returns
      payment_status: returnData.payment_status || 'pending',
      payment_method: returnData.payment_method || '',
      notes: returnData.notes || '',
      purchase_data: {
        return_number: returnData.return_number,
        original_purchase_id: returnData.original_purchase_id,
        supplier_name: returnData.supplier_name || '',
        date: returnData.date || new Date().toISOString().split('T')[0],
        ...returnData
      },
      phone_number: phone,
    };

    // Insert the purchase return
    const { data: newReturn, error: insertError } = await supabase
      .from('user_purchases')
      .insert([purchaseReturn])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating purchase return:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    // Update party balance if supplier is specified (returns add to supplier balance)
    if (purchaseReturn.supplier_id && Math.abs(purchaseReturn.total) > 0) {
      const balanceUpdated = await updatePartyBalance(
        purchaseReturn.supplier_id, 
        Math.abs(purchaseReturn.total), 
        'add', // Add to supplier balance (we get refunded)
        phone
      );
      
      if (!balanceUpdated) {
        console.warn('Failed to update party balance for purchase return:', newReturn.id);
      }
    }

    // Get supplier information if exists (same as purchases API)
    if (newReturn.supplier_id) {
      try {
        const { data: supplier } = await supabase
          .from('user_parties')
          .select('id, party_name, phone, email')
          .eq('id', newReturn.supplier_id)
          .eq('phone_number', phone)
          .single();
        
        newReturn.supplier = supplier;
        newReturn.supplier_name = supplier?.party_name || '';
      } catch (error) {
        console.warn('Could not fetch supplier for purchase return:', newReturn.id);
      }
    }

    return NextResponse.json(newReturn, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase return:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 