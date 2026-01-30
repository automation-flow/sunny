import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const year = searchParams.get('year') || new Date().getFullYear().toString()
  const search = searchParams.get('search')
  const category_id = searchParams.get('category_id')
  const beneficiary = searchParams.get('beneficiary')

  let query = supabase
    .from('transactions')
    .select('*, category:categories(*), account:accounts(*), client:clients(*)')
    .is('deleted_at', null)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date', { ascending: false })

  if (search) {
    query = query.or(`supplier_name.ilike.%${search}%,notes.ilike.%${search}%`)
  }

  if (category_id) {
    query = query.eq('category_id', category_id)
  }

  if (beneficiary) {
    query = query.eq('beneficiary', beneficiary)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  // Get exchange rate if currency is not ILS
  let exchangeRate = 1.0
  if (body.currency !== 'ILS') {
    // For now, use a simple rate. In production, fetch from API
    const rates: Record<string, number> = { USD: 3.65, EUR: 3.95, GBP: 4.55 }
    exchangeRate = rates[body.currency] || 1.0
  }

  // Get tax percent from category if not provided
  let taxPercent = body.applied_tax_percent
  if (taxPercent === undefined) {
    const { data: category } = await supabase
      .from('categories')
      .select('tax_recognition_percent')
      .eq('id', body.category_id)
      .single()
    taxPercent = category?.tax_recognition_percent || 1.0
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      date: body.date,
      supplier_name: body.supplier_name,
      amount: body.amount,
      currency: body.currency || 'ILS',
      exchange_rate_to_ils: exchangeRate,
      category_id: body.category_id,
      account_id: body.account_id,
      beneficiary: body.beneficiary || 'Business',
      applied_tax_percent: taxPercent,
      client_id: body.client_id || null,
      invoice_url: body.invoice_url || null,
      notes: body.notes || null,
    })
    .select('*, category:categories(*), account:accounts(*), client:clients(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
