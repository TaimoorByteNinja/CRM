import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  console.log('GET /api/business-hub/loan-accounts called');
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
      .from('user_loan_accounts')
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
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('GET API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/business-hub/loan-accounts called');
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
    
    // Generate a unique loan_id if not provided
    const loanId = body.loan_id || `loan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const dataWithPhone = {
      ...body,
      loan_id: loanId,
      phone_number: phoneNumber
    };
    
    console.log('Data to insert:', dataWithPhone);
    
    const { data, error } = await supabaseServer
      .from('user_loan_accounts')
      .insert([dataWithPhone])
      .select()
      .single();

    console.log('Supabase insert result:', { data, error });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error.details || 'No additional details'
      }, { status: 500 });
    }

    console.log('Successfully created loan account:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('POST API route error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 