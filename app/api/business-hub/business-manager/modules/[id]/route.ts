import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      type,
      items,
      settings,
      position,
      size,
      color,
      icon,
      totalStock,
      pricePerUnit,
      phone_number
    } = body

    if (!phone_number) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const updateData = {
      name,
      type,
      items,
      settings,
      position,
      size,
      color,
      icon,
      total_stock: totalStock,
      price_per_unit: pricePerUnit,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseServer
      .from('user_business_modules')
      .update(updateData)
      .eq('id', params.id)
      .eq('phone_number', phone_number)
      .select()
      .single()

    if (error) {
      console.error('Error updating business module:', error)
      return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Transform the response to match the frontend interface
    const transformedData = {
      id: data.id,
      name: data.name,
      type: data.type,
      items: data.items,
      settings: data.settings,
      position: data.position,
      size: data.size,
      color: data.color,
      icon: data.icon,
      totalStock: data.total_stock,
      pricePerUnit: data.price_per_unit,
      phone_number: data.phone_number,
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error in business module PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from('user_business_modules')
      .delete()
      .eq('id', params.id)
      .eq('phone_number', phone)

    if (error) {
      console.error('Error deleting business module:', error)
      return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in business module DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
