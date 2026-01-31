import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*, category:categories(*), account:accounts(*), creator:partners!created_by(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()

  const updateData: Record<string, unknown> = {}

  if (body.supplier_name !== undefined) updateData.supplier_name = body.supplier_name
  if (body.amount !== undefined) updateData.amount = body.amount
  if (body.currency !== undefined) updateData.currency = body.currency
  if (body.category_id !== undefined) updateData.category_id = body.category_id
  if (body.account_id !== undefined) updateData.account_id = body.account_id
  if (body.beneficiary !== undefined) updateData.beneficiary = body.beneficiary
  if (body.applied_tax_percent !== undefined) updateData.applied_tax_percent = body.applied_tax_percent
  if (body.notes !== undefined) updateData.notes = body.notes
  if (body.recurrence_day !== undefined) updateData.recurrence_day = body.recurrence_day
  if (body.end_date !== undefined) updateData.end_date = body.end_date
  if (body.is_active !== undefined) updateData.is_active = body.is_active
  if (body.last_generated_date !== undefined) updateData.last_generated_date = body.last_generated_date

  const { data, error } = await supabase
    .from('recurring_expenses')
    .update(updateData)
    .eq('id', id)
    .select('*, category:categories(*), account:accounts(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  // Soft delete
  const { error } = await supabase
    .from('recurring_expenses')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
