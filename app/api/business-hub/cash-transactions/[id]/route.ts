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

    console.log('GET cash transaction - ID:', id, 'Phone:', phoneNumber);

    if (!phoneNumber) {
      console.log('Missing phone number parameter');
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // First check if record exists with this transaction_id and phone number
    // Try by UUID first (if id looks like UUID), then by transaction_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let existingRecord;
    let findError;
    
    if (isUUID) {
      // Try to find by UUID first
      const result = await supabaseServer
        .from('user_cash_transactions')
        .select('*')
        .eq('id', id)
        .eq('phone_number', phoneNumber)
        .single();
      existingRecord = result.data;
      findError = result.error;
    } else {
      // Find by transaction_id
      const result = await supabaseServer
        .from('user_cash_transactions')
        .select('*')
        .eq('transaction_id', id)
        .eq('phone_number', phoneNumber)
        .single();
      existingRecord = result.data;
      findError = result.error;
    }

    if (findError && findError.code !== 'PGRST116') {
      console.log('Error finding cash transaction:', findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!existingRecord) {
      console.log('Cash transaction not found for transaction_id:', id, 'phone:', phoneNumber);
      return NextResponse.json({ error: 'Cash transaction not found' }, { status: 404 });
    }

    console.log('Found cash transaction:', existingRecord);
    return NextResponse.json(existingRecord);
  } catch (error) {
    console.error('Error in GET cash transaction:', error);
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

    console.log('PATCH cash transaction - ID:', id, 'Phone:', phoneNumber, 'Body:', body);

    if (!phoneNumber) {
      console.log('Missing phone number parameter');
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // First find the record by transaction_id and phone
    // Try by UUID first (if id looks like UUID), then by transaction_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let existingRecord;
    let findError;
    
    if (isUUID) {
      // Try to find by UUID first
      const result = await supabaseServer
        .from('user_cash_transactions')
        .select('id')
        .eq('id', id)
        .eq('phone_number', phoneNumber)
        .single();
      existingRecord = result.data;
      findError = result.error;
    } else {
      // Find by transaction_id
      const result = await supabaseServer
        .from('user_cash_transactions')
        .select('id')
        .eq('transaction_id', id)
        .eq('phone_number', phoneNumber)
        .single();
      existingRecord = result.data;
      findError = result.error;
    }

    if (findError) {
      console.log('Error finding cash transaction for update:', findError);
      return NextResponse.json({ error: 'Cash transaction not found' }, { status: 404 });
    }

    if (!existingRecord) {
      console.log('Cash transaction not found for update - ID:', id, 'phone:', phoneNumber);
      return NextResponse.json({ error: 'Cash transaction not found' }, { status: 404 });
    }

    // Update using the UUID id
    const { data, error } = await supabaseServer
      .from('user_cash_transactions')
      .update(body)
      .eq('id', existingRecord.id)
      .select()
      .single();

    if (error) {
      console.log('Error updating cash transaction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Successfully updated cash transaction:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH cash transaction:', error);
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

    console.log('DELETE cash transaction - ID:', id, 'Phone:', phoneNumber);

    if (!phoneNumber) {
      console.log('Missing phone number parameter');
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // First find the record by transaction_id and phone
    // Try by UUID first (if id looks like UUID), then by transaction_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let existingRecord;
    let findError;
    
    if (isUUID) {
      // Try to find by UUID first
      const result = await supabaseServer
        .from('user_cash_transactions')
        .select('id')
        .eq('id', id)
        .eq('phone_number', phoneNumber)
        .single();
      existingRecord = result.data;
      findError = result.error;
    } else {
      // Find by transaction_id
      const result = await supabaseServer
        .from('user_cash_transactions')
        .select('id')
        .eq('transaction_id', id)
        .eq('phone_number', phoneNumber)
        .single();
      existingRecord = result.data;
      findError = result.error;
    }

    if (findError) {
      console.log('Error finding cash transaction for deletion:', findError);
      return NextResponse.json({ error: 'Cash transaction not found' }, { status: 404 });
    }

    if (!existingRecord) {
      console.log('Cash transaction not found for deletion - ID:', id, 'phone:', phoneNumber);
      return NextResponse.json({ error: 'Cash transaction not found' }, { status: 404 });
    }

    // Delete using the UUID id
    const { error } = await supabaseServer
      .from('user_cash_transactions')
      .delete()
      .eq('id', existingRecord.id);

    if (error) {
      console.log('Error deleting cash transaction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Successfully deleted cash transaction with UUID:', existingRecord.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE cash transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 