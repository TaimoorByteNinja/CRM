import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_bank_accounts')
      .select('*')
      .eq('id', id)
      .eq('phone_number', phoneNumber)
      .single();

    if (error) {
      console.error('GET bank account error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET API route error:', error);
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

    console.log('PATCH request:', { id, body, phoneNumber });

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // First find the record by account_id
    const { data: existingRecord, error: findError } = await supabase
      .from('user_bank_accounts')
      .select('*')
      .eq('account_id', id)
      .eq('phone_number', phoneNumber)
      .single();

    console.log('Existing record for update:', { existingRecord, findError });

    if (findError || !existingRecord) {
      console.error('Record not found for update:', findError);
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    // Update using the actual UUID id
    const { data, error } = await supabase
      .from('user_bank_accounts')
      .update(body)
      .eq('id', existingRecord.id)
      .eq('phone_number', phoneNumber)
      .select()
      .single();

    if (error) {
      console.error('PATCH bank account error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Successfully updated bank account:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('PATCH API route error:', error);
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

    console.log('DELETE request:', { id, phoneNumber });

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // First check if the record exists
    const { data: existingRecord, error: findError } = await supabase
      .from('user_bank_accounts')
      .select('*')
      .eq('account_id', id)
      .eq('phone_number', phoneNumber)
      .single();

    console.log('Existing record check:', { existingRecord, findError });

    if (findError || !existingRecord) {
      console.error('Record not found:', findError);
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    // Delete using the actual UUID id
    const { error } = await supabase
      .from('user_bank_accounts')
      .delete()
      .eq('id', existingRecord.id)
      .eq('phone_number', phoneNumber);

    if (error) {
      console.error('DELETE bank account error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Successfully deleted bank account:', existingRecord.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 