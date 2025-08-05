import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper function to map API data to frontend format
function mapPartyFromApi(party: any) {
  return {
    id: party.id,
    name: party.name,
    type: party.type,
    phone: party.phone,
    email: party.email,
    address: party.address,
    city: party.city,
    state: party.state,
    pincode: party.pincode,
    gstin: party.gstin,
    pan: party.pan,
    creditLimit: party.credit_limit,
    balance: party.balance,
    status: party.status,
    createdAt: party.created_at,
    updatedAt: party.updated_at,
    totalTransactions: party.total_transactions,
    lastTransaction: party.last_transaction,
  };
}

// Helper function to map frontend data to API format
function mapPartyToApi(party: any) {
  return {
    name: party.name,
    type: party.type,
    phone: party.phone,
    email: party.email,
    address: party.address,
    city: party.city,
    state: party.state,
    pincode: party.pincode,
    gstin: party.gstin,
    pan: party.pan,
    credit_limit: party.creditLimit,
    balance: party.balance,
    status: party.status,
    total_transactions: party.totalTransactions,
    last_transaction: party.lastTransaction,
  };
}

// GET: Get a single party by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase.from('parties').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  
  // Map the data to frontend format
  const mappedData = mapPartyFromApi(data);
  return NextResponse.json(mappedData);
}

// PATCH: Update a party by ID
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  
  // Map the data to API format
  const apiData = mapPartyToApi(body);
  
  // Update the updated_at timestamp
  const updateData = {
    ...apiData,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase.from('parties').update(updateData).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  
  // Map the response back to frontend format
  const mappedData = mapPartyFromApi(data);
  return NextResponse.json(mappedData);
}

// DELETE: Delete a party by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from('parties').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
} 