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

// GET: List all expenses for a specific user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_expenses')
      .select('*')
      .eq('phone_number', phone)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user expenses:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If we have expenses, try to get party information from expense_data
    const expensesWithParties = await Promise.all((data || []).map(async (expense) => {
      // Get party_id from expense_data JSON field
      const partyId = expense.expense_data?.party_id;
      
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
          
          return {
            ...expense,
            party: party || null,
            party_name: party?.party_name || 'No Party'
          };
        } catch (error) {
          console.warn('Could not fetch party for expense:', expense.id);
          return expense;
        }
      }
      return expense;
    }));

    return NextResponse.json(expensesWithParties);
  } catch (err) {
    console.error('Error in expenses GET:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new expense for a specific user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, ...expenseData } = body;
    
    console.log('📥 Expenses POST request body:', JSON.stringify(body, null, 2));
    
    if (!phone) {
      console.error('❌ No phone number provided');
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    
    // Use actual database structure discovered through testing
    const expense = {
      expense_id: expenseData.expense_number || expenseData.expense_id || `EXP-${Date.now()}`,
      expense_name: expenseData.description || expenseData.expense_name || 'Expense',
      expense_date: expenseData.date || expenseData.expense_date || new Date().toISOString().split('T')[0],
      amount: parseFloat(expenseData.amount) || 0,
      category: expenseData.category || '',
      description: expenseData.notes || expenseData.description || '',
      phone_number: phone,
      expense_data: expenseData // Store complete data in JSON field
    };
    
    console.log('📝 Processed expense data:', JSON.stringify(expense, null, 2));

    // Validation will be handled by database constraints

    const { data, error } = await supabase
      .from('user_expenses')
      .insert([expense])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error creating user expense:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint 
      }, { status: 400 });
    }

    // Update party balance if party is specified and expense is paid
    // Note: Disabled until party_id field is confirmed in database schema
    /*
    if (expense.party_id && expense.status === 'paid' && expense.total_amount > 0) {
      const balanceUpdated = await updatePartyBalance(
        expense.party_id, 
        expense.total_amount, 
        'subtract', // Subtract from party balance (we pay them)
        phone
      );
      
      if (!balanceUpdated) {
        console.warn('Failed to update party balance for expense:', data.id);
      }
    }
    */

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Error creating expense:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 