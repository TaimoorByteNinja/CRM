import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper function to map API data to frontend format
function mapPartyFromApi(party: any) {
  const partyData = party.party_data || {};
  return {
    id: party.id,
    name: party.party_name,
    type: party.party_type,
    phone: party.phone,
    email: party.email,
    address: party.address,
    city: partyData.city,
    state: partyData.state,
    pincode: partyData.pincode,
    gstin: partyData.gstin,
    pan: partyData.pan,
    creditLimit: partyData.credit_limit || 0,
    balance: party.balance || 0,
    status: partyData.status || 'active',
    createdAt: party.created_at,
    updatedAt: party.updated_at,
    totalTransactions: partyData.total_transactions || 0,
    lastTransaction: partyData.last_transaction,
    contact_person: partyData.contact_person,
    payment_terms: partyData.payment_terms || 0,
    is_active: partyData.is_active !== false
  };
}

// Helper function to map frontend data to API format
function mapPartyToApi(party: any) {
  return {
    party_id: party.id || `party_${Date.now()}`,
    party_name: party.name,
    party_type: party.type,
    phone: party.phone,
    email: party.email,
    address: party.address,
    balance: party.balance || 0,
    party_data: {
      // Store additional data in JSONB field
      city: party.city,
      state: party.state,
      pincode: party.pincode,
      gstin: party.gstin,
      pan: party.pan,
      credit_limit: party.creditLimit || party.credit_limit || 0,
      status: party.status || 'active',
      total_transactions: party.totalTransactions || 0,
      last_transaction: party.lastTransaction,
      contact_person: party.contact_person,
      payment_terms: party.payment_terms || 0,
      is_active: party.status === 'active'
    }
  };
}

// GET: List all parties
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phoneNumber = searchParams.get('phone');

  // If no phone number provided, return empty data
  if (!phoneNumber) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from('user_parties')
    .select('*')
    .eq('phone_number', phoneNumber)
    .order('created_at', { ascending: false });
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Map the data to frontend format
  const mappedData = data.map(mapPartyFromApi);
  return NextResponse.json(mappedData);
}

// POST: Create a new party
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { searchParams } = new URL(req.url);
  const phoneNumber = searchParams.get('phone');

  // If no phone number provided, reject the request
  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }
  
  // Map the data to API format and add phone number
  const apiData = {
    ...mapPartyToApi(body),
    phone_number: phoneNumber
  };
  
  const { data, error } = await supabase
    .from('user_parties')
    .insert([apiData])
    .select()
    .single();
    
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  
  // Map the response back to frontend format
  const mappedData = mapPartyFromApi(data);
  return NextResponse.json(mappedData, { status: 201 });
} 