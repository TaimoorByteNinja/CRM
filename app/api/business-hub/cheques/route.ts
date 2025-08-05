import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  console.log('GET /api/business-hub/cheques called');
  try {
    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get('phone');

    console.log('GET request phone number:', phoneNumber);

    // If no phone number provided, return empty data
    if (!phoneNumber) {
      console.log('No phone number provided, returning empty array');
      return NextResponse.json([]);
    }

    const { data, error } = await supabaseServer
      .from('user_cheques')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false });

    console.log('GET Supabase query result:', { 
      data, 
      error,
      phoneNumber,
      dataCount: data?.length || 0
    });

    if (error) {
      console.error('GET Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('GET API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/business-hub/cheques called');
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');

    console.log('POST Request details:', {
      body,
      phoneNumber,
      url: request.url,
      searchParams: Object.fromEntries(searchParams.entries())
    });

    // If no phone number provided, reject the request
    if (!phoneNumber) {
      console.error('No phone number provided');
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    
    console.log('Request body:', body);
    
    // Generate a unique cheque_id if not provided
    const chequeId = body.cheque_id || `cheque-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const dataWithPhone = {
      ...body,
      cheque_id: chequeId,
      phone_number: phoneNumber
    };
    
    console.log('Data to insert:', dataWithPhone);
    
    const { data, error } = await supabaseServer
      .from('user_cheques')
      .insert([dataWithPhone])
      .select()
      .single();

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }

    console.log('Successfully created cheque:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 