import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*, category:categories(*), account:accounts(*), creator:partners!created_by(*)')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('supplier_name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('recurring_expenses')
    .insert({
      supplier_name: body.supplier_name,
      amount: body.amount,
      currency: body.currency || 'ILS',
      category_id: body.category_id,
      account_id: body.account_id,
      beneficiary: body.beneficiary || 'Business',
      applied_tax_percent: body.applied_tax_percent,
      notes: body.notes || null,
      recurrence_day: body.recurrence_day,
      start_date: body.start_date,
      end_date: body.end_date || null,
      created_by: body.created_by || null,
    })
    .select('*, category:categories(*), account:accounts(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
