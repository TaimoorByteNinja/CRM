import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const { data: transactions, error } = await supabaseServer
      .from('user_business_transactions')
      .select('*')
      .eq('phone_number', phone)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching business transactions:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    // Transform the response to match the frontend interface
    const transformedTransactions = (transactions || []).map((transaction: any) => ({
      id: transaction.id,
      itemId: transaction.item_id,
      itemName: transaction.item_name,
      quantity: transaction.quantity,
      unitPrice: transaction.unit_price,
      totalPrice: transaction.total_price,
      type: transaction.type,
      timestamp: transaction.timestamp,
      notes: transaction.notes,
      customer: transaction.customer,
      paymentMethod: transaction.payment_method,
      phone_number: transaction.phone_number
    }))

    return NextResponse.json(transformedTransactions)
  } catch (error) {
    console.error('Error in business transactions GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      itemId,
      itemName,
      quantity,
      unitPrice,
      totalPrice,
      type,
      timestamp,
      notes,
      customer,
      paymentMethod,
      phone_number
    } = body

    if (!phone_number) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const transactionData = {
      id: id || `transaction_${Date.now()}`,
      item_id: itemId,
      item_name: itemName,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      type,
      timestamp: timestamp || new Date().toISOString(),
      notes: notes || '',
      customer,
      payment_method: paymentMethod,
      phone_number
    }

    const { data, error } = await supabaseServer
      .from('user_business_transactions')
      .insert([transactionData])
      .select()
      .single()

    if (error) {
      console.error('Error creating business transaction:', error)
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }

    // Transform the response to match the frontend interface
    const transformedData = {
      id: data.id,
      itemId: data.item_id,
      itemName: data.item_name,
      quantity: data.quantity,
      unitPrice: data.unit_price,
      totalPrice: data.total_price,
      type: data.type,
      timestamp: data.timestamp,
      notes: data.notes,
      customer: data.customer,
      paymentMethod: data.payment_method,
      phone_number: data.phone_number
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error in business transactions POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
