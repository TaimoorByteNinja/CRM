import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Get a single sale by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const phoneNumber = url.searchParams.get('phone');
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_sales')
      .select('*')
      .eq('id', id)
      .eq('phone_number', phoneNumber)
      .single();
      
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sale:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update a sale by ID
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const url = new URL(req.url);
    const phoneNumber = url.searchParams.get('phone');
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    console.log('🔄 Updating sale:', { id, phoneNumber, body });

    const { data, error } = await supabase
      .from('user_sales')
      .update(body)
      .eq('id', id)
      .eq('phone_number', phoneNumber)
      .select()
      .single();
      
    if (error) {
      console.error('Sale update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    console.log('✅ Sale updated successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a sale by ID
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const url = new URL(req.url);
    const phoneNumber = url.searchParams.get('phone');
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_sales')
      .delete()
      .eq('id', id)
      .eq('phone_number', phoneNumber);
      
    if (error) {
      console.error('Sale delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 