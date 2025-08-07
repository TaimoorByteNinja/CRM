import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const { data: modules, error } = await supabaseServer
      .from('user_business_modules')
      .select('*')
      .eq('phone_number', phone)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching business modules:', error)
      return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
    }

    // Transform the response to match the frontend interface
    const transformedModules = (modules || []).map((module: any) => ({
      id: module.id,
      name: module.name,
      type: module.type,
      items: module.items,
      settings: module.settings,
      position: module.position,
      size: module.size,
      color: module.color,
      icon: module.icon,
      totalStock: module.total_stock || 0,
      pricePerUnit: module.price_per_unit || 0,
      phone_number: module.phone_number,
      created_at: module.created_at,
      updated_at: module.updated_at
    }))

    return NextResponse.json(transformedModules)
  } catch (error) {
    console.error('Error in business modules GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
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

    const moduleData = {
      id: id || `module_${Date.now()}`,
      name,
      type: type || 'inventory',
      items: items || [],
      settings: settings || {},
      position: position || { x: 0, y: 0 },
      size: size || { width: 300, height: 200 },
      color,
      icon: icon || 'Package',
      total_stock: totalStock || 0,
      price_per_unit: pricePerUnit || 0,
      phone_number,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseServer
      .from('user_business_modules')
      .insert([moduleData])
      .select()
      .single()

    if (error) {
      console.error('Error creating business module:', error)
      return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
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
    console.error('Error in business modules POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
