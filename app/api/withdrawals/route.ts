import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const year = searchParams.get('year') || new Date().getFullYear().toString()
  const partner_id = searchParams.get('partner_id')

  let query = supabase
    .from('withdrawals')
    .select('*, partner:partners(*)')
    .is('deleted_at', null)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date', { ascending: false })

  if (partner_id) {
    query = query.eq('partner_id', partner_id)
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

  const { data, error } = await supabase
    .from('withdrawals')
    .insert({
      partner_id: body.partner_id,
      amount: body.amount,
      date: body.date || new Date().toISOString().split('T')[0],
      method: body.method || 'Bank_Transfer',
      notes: body.notes || null,
    })
    .select('*, partner:partners(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
