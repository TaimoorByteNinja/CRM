import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');

    console.log('GET loan account - ID:', id, 'Phone:', phoneNumber);

    if (!phoneNumber) {
      console.log('Missing phone number parameter');
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // First check if record exists with this loan_id and phone number
    // Try by UUID first (if id looks like UUID), then by loan_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let existingRecord;
    let findError;
    
    if (isUUID) {
      // Try to find by UUID first
      const result = await supabaseServer
        .from('user_loan_accounts')
        .select('*')
        .eq('id', id)
        .eq('phone_number', phoneNumber)
        .single();
      existingRecord = result.data;
      findError = result.error;
    } else {
      // Find by loan_id
      const result = await supabaseServer
        .from('user_loan_accounts')
        .select('*')
        .eq('loan_id', id)
        .eq('phone_number', phoneNumber)
        .single();
      existingRecord = result.data;
      findError = result.error;
    }

    if (findError && findError.code !== 'PGRST116') {
      console.log('Error finding loan account:', findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!existingRecord) {
      console.log('Loan account not found for ID:', id, 'phone:', phoneNumber);
      return NextResponse.json({ error: 'Loan account not found' }, { status: 404 });
    }

    console.log('Found loan account:', existingRecord);
    return NextResponse.json(existingRecord);
  } catch (error) {
    console.error('Error in GET loan account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');

    console.log('PATCH loan account - ID:', id, 'Phone:', phoneNumber, 'Body:', body);

    if (!phoneNumber) {
      console.log('Missing phone number parameter');
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // First find the record by loan_id and phone
    // Try by UUID first (if id looks like UUID), then by loan_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let existingRecord;
    let findError;
    
    if (isUUID) {
      // Try to find by UUID first
      const result = await supabaseServer
        .from('user_loan_accounts')
        .select('id')
        .eq('id', id)
        .eq('phone_number', phoneNumber)
        .single();
      existingRecord = result.data;
      findError = result.error;
    } else {
      // Find by loan_id
      const result = await supabaseServer
        .from('user_loan_accounts')
        .select('id')
        .eq('loan_id', id)
        .eq('phone_number', phoneNumber)
        .single();
      existingRecord = result.data;
      findError = result.error;
    }

    if (findError) {
      console.log('Error finding loan account for update:', findError);
      return NextResponse.json({ error: 'Loan account not found' }, { status: 404 });
    }

    if (!existingRecord) {
      console.log('Loan account not found for update - ID:', id, 'phone:', phoneNumber);
      return NextResponse.json({ error: 'Loan account not found' }, { status: 404 });
    }

    // Update using the UUID id
    const { data, error } = await supabaseServer
      .from('user_loan_accounts')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingRecord.id)
      .select()
      .single();

    if (error) {
      console.log('Error updating loan account:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Successfully updated loan account:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH loan account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');

    console.log('DELETE loan account - ID:', id, 'Phone:', phoneNumber);

    if (!phoneNumber) {
      console.log('Missing phone number parameter');
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // First find the record by loan_id and phone
    // Try by UUID first (if id looks like UUID), then by loan_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let existingRecord;
    let findError;
    
    if (isUUID) {
      // Try to find by UUID first
      const result = await supabaseServer
        .from('user_loan_accounts')
        .select('id')
        .eq('id', id)
        .eq('phone_number', phoneNumber)
        .single();
      existingRecord = result.data;
      findError = result.error;
    } else {
      // Find by loan_id
      const result = await supabaseServer
        .from('user_loan_accounts')
        .select('id')
        .eq('loan_id', id)
        .eq('phone_number', phoneNumber)
        .single();
      existingRecord = result.data;
      findError = result.error;
    }

    if (findError) {
      console.log('Error finding loan account for deletion:', findError);
      return NextResponse.json({ error: 'Loan account not found' }, { status: 404 });
    }

    if (!existingRecord) {
      console.log('Loan account not found for deletion - ID:', id, 'phone:', phoneNumber);
      return NextResponse.json({ error: 'Loan account not found' }, { status: 404 });
    }

    // Delete using the UUID id
    const { error } = await supabaseServer
      .from('user_loan_accounts')
      .delete()
      .eq('id', existingRecord.id);

    if (error) {
      console.log('Error deleting loan account:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Successfully deleted loan account with UUID:', existingRecord.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE loan account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 