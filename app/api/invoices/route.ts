import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const year = searchParams.get('year') || new Date().getFullYear().toString()
  const status = searchParams.get('status')
  const client_id = searchParams.get('client_id')

  // First, update overdue invoices
  const today = new Date().toISOString().split('T')[0]
  await supabase
    .from('invoices')
    .update({ status: 'Overdue' })
    .eq('status', 'Sent')
    .lt('due_date', today)
    .is('deleted_at', null)

  let query = supabase
    .from('invoices')
    .select('*, client:clients(*)')
    .is('deleted_at', null)
    .gte('date_issued', `${year}-01-01`)
    .lte('date_issued', `${year}-12-31`)
    .order('date_issued', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (client_id) {
    query = query.eq('client_id', client_id)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calculate summary
  const summary = {
    total_outstanding: data?.filter(inv => inv.status !== 'Paid').reduce((sum, inv) => sum + (inv.amount_ils || 0), 0) || 0,
    total_overdue: data?.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + (inv.amount_ils || 0), 0) || 0,
    count_by_status: {
      Draft: data?.filter(inv => inv.status === 'Draft').length || 0,
      Sent: data?.filter(inv => inv.status === 'Sent').length || 0,
      Overdue: data?.filter(inv => inv.status === 'Overdue').length || 0,
      Paid: data?.filter(inv => inv.status === 'Paid').length || 0,
    },
  }

  return NextResponse.json({ data, summary })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  // Get exchange rate if currency is not ILS
  let exchangeRate = 1.0
  if (body.currency !== 'ILS') {
    const rates: Record<string, number> = { USD: 3.65, EUR: 3.95, GBP: 4.55 }
    exchangeRate = rates[body.currency] || 1.0
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      invoice_number: body.invoice_number,
      client_id: body.client_id,
      description: body.description || null,
      amount: body.amount,
      currency: body.currency || 'ILS',
      exchange_rate_to_ils: exchangeRate,
      includes_vat: body.includes_vat !== false,
      vat_rate: 0.18,
      date_issued: body.date_issued,
      due_date: body.due_date,
      status: body.status || 'Draft',
      heli_split_percent: body.heli_split_percent || 50,
      shahar_split_percent: body.shahar_split_percent || 50,
      invoice_url: body.invoice_url || null,
      notes: body.notes || null,
    })
    .select('*, client:clients(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
