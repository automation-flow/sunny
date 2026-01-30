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

  if (body.invoice_number !== undefined) updateData.invoice_number = body.invoice_number
  if (body.client_id !== undefined) updateData.client_id = body.client_id
  if (body.description !== undefined) updateData.description = body.description
  if (body.amount !== undefined) updateData.amount = body.amount
  if (body.currency !== undefined) updateData.currency = body.currency
  if (body.exchange_rate_to_ils !== undefined) updateData.exchange_rate_to_ils = body.exchange_rate_to_ils
  if (body.includes_vat !== undefined) updateData.includes_vat = body.includes_vat
  if (body.date_issued !== undefined) updateData.date_issued = body.date_issued
  if (body.due_date !== undefined) updateData.due_date = body.due_date
  if (body.status !== undefined) {
    updateData.status = body.status
    // Auto-set date_paid when marking as Paid
    if (body.status === 'Paid' && !body.date_paid) {
      updateData.date_paid = new Date().toISOString().split('T')[0]
    }
  }
  if (body.date_paid !== undefined) updateData.date_paid = body.date_paid
  if (body.heli_split_percent !== undefined) updateData.heli_split_percent = body.heli_split_percent
  if (body.shahar_split_percent !== undefined) updateData.shahar_split_percent = body.shahar_split_percent
  if (body.invoice_url !== undefined) updateData.invoice_url = body.invoice_url
  if (body.notes !== undefined) updateData.notes = body.notes

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .select('*, client:clients(*)')
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
    .from('invoices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
