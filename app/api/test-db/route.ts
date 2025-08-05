import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Get table structure by querying with limit 1 to see what columns exist
    const { data, error } = await supabase
      .from('user_purchases')
      .select('*')
      .limit(1);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the column structure
    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
    
    return NextResponse.json({ 
      columns,
      sampleData: data?.[0] || null,
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error testing database:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
