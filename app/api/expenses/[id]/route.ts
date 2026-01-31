import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()

  const updateData: Record<string, unknown> = {}

  if (body.date !== undefined) updateData.date = body.date
  if (body.supplier_name !== undefined) updateData.supplier_name = body.supplier_name
  if (body.amount !== undefined) updateData.amount = body.amount
  if (body.currency !== undefined) updateData.currency = body.currency
  if (body.exchange_rate_to_ils !== undefined) updateData.exchange_rate_to_ils = body.exchange_rate_to_ils
  if (body.category_id !== undefined) updateData.category_id = body.category_id
  if (body.account_id !== undefined) updateData.account_id = body.account_id
  if (body.beneficiary !== undefined) updateData.beneficiary = body.beneficiary
  if (body.applied_tax_percent !== undefined) updateData.applied_tax_percent = body.applied_tax_percent
  if (body.client_id !== undefined) updateData.client_id = body.client_id
  if (body.invoice_url !== undefined) updateData.invoice_url = body.invoice_url
  if (body.notes !== undefined) updateData.notes = body.notes

  const { data, error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('id', id)
    .select('*, category:categories(*), account:accounts(*), client:clients(*)')
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
    .from('expenses')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
