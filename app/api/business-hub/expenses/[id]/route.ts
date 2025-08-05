import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Get a single expense by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_expenses')
      .select('*')
      .eq('id', id)
      .eq('phone_number', phone)
      .single();
      
    if (error) {
      console.error('Error fetching expense:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Try to get party information from expense_data
    let expenseWithParty = { ...data };
    const partyId = data.expense_data?.party_id;
    if (partyId) {
      try {
        // Try to find party by UUID id first, then by party_id
        let { data: party } = await supabase
          .from('user_parties')
          .select('id, party_name, phone, email')
          .eq('id', partyId)
          .eq('phone_number', phone)
          .single();
        
        // If not found by id, try by party_id
        if (!party) {
          const { data: partyByPartyId } = await supabase
            .from('user_parties')
            .select('id, party_name, phone, email')
            .eq('party_id', partyId)
            .eq('phone_number', phone)
            .single();
          party = partyByPartyId;
        }
        
        expenseWithParty = {
          ...data,
          party: party || null,
          party_name: party?.party_name || 'No Party'
        };
      } catch (error) {
        console.warn('Could not fetch party for expense:', id);
      }
    }

    return NextResponse.json(expenseWithParty);
  } catch (err) {
    console.error('Error in expense GET:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update an expense by ID with phone-based isolation
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const phone = body.phone;
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // First verify the expense belongs to this user
    const { data: existingExpense, error: fetchError } = await supabase
      .from('user_expenses')
      .select('*')
      .eq('id', id)
      .eq('phone_number', phone)
      .single();
      
    if (fetchError || !existingExpense) {
      return NextResponse.json({ error: 'Expense not found or access denied' }, { status: 404 });
    }

    // Use actual database field structure
    const expense = {
      expense_id: body.expense_number || body.expense_id || existingExpense.expense_id,
      expense_name: body.description || body.expense_name || existingExpense.expense_name,
      expense_date: body.date || body.expense_date || existingExpense.expense_date,
      amount: parseFloat(body.amount) || existingExpense.amount,
      category: body.category || existingExpense.category,
      description: body.notes || body.description || existingExpense.description,
      expense_data: {
        ...existingExpense.expense_data,
        ...body // Merge all new data into expense_data
      }
    };
    
    const { data, error } = await supabase
      .from('user_expenses')
      .update(expense)
      .eq('id', id)
      .eq('phone_number', phone)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating expense:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get party information from expense_data if available
    const partyId = data.expense_data?.party_id;
    if (partyId) {
      try {
        let { data: party } = await supabase
          .from('user_parties')
          .select('id, party_name, phone, email')
          .eq('id', partyId)
          .eq('phone_number', phone)
          .single();
        
        if (!party) {
          const { data: partyByPartyId } = await supabase
            .from('user_parties')
            .select('id, party_name, phone, email')
            .eq('party_id', partyId)
            .eq('phone_number', phone)
            .single();
          party = partyByPartyId;
        }
        
        return NextResponse.json({
          ...data,
          party: party || null,
          party_name: party?.party_name || 'No Party'
        });
      } catch (error) {
        console.warn('Could not fetch party for updated expense:', id);
        return NextResponse.json(data);
      }
    }
    
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error in expense PATCH:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete an expense by ID with phone-based isolation
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // First verify the expense belongs to this user
    const { data: existingExpense, error: fetchError } = await supabase
      .from('user_expenses')
      .select('*')
      .eq('id', id)
      .eq('phone_number', phone)
      .single();
      
    if (fetchError || !existingExpense) {
      return NextResponse.json({ error: 'Expense not found or access denied' }, { status: 404 });
    }

    const { error } = await supabase
      .from('user_expenses')
      .delete()
      .eq('id', id)
      .eq('phone_number', phone);
      
    if (error) {
      console.error('Error deleting expense:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in expense DELETE:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 