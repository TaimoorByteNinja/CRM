import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Get a single item by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('🔍 GET item by ID:', id);
    
    const { data, error } = await supabase
      .from('user_items')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('❌ Error fetching item by ID:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    console.log('✅ Found item:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in GET item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update an item by ID
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    
    console.log('🔄 PATCH item:', id, 'with data:', body);
    
    // Extract phone number from request headers or body
    const phoneNumber = req.headers.get('x-phone-number') || body.phone;
    if (!phoneNumber) {
      console.error('❌ Phone number required for item update');
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    
    // Remove phone from body to avoid updating it in the database
    const { phone, ...updateData } = body;
    
    const { data, error } = await supabase
      .from('user_items')
      .update(updateData)
      .eq('id', id)
      .eq('phone_number', phoneNumber)
      .select()
      .single();
      
    if (error) {
      console.error('❌ Error updating item:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    console.log('✅ Updated item:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in PATCH item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete an item by ID
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log('🗑️ DELETE item:', id);
    
    const { error } = await supabase
      .from('user_items')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('❌ Error deleting item:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    console.log('✅ Deleted item successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error in DELETE item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 