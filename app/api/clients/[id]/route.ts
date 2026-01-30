import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()

  const { data, error } = await supabase
    .from('clients')
    .update({
      name: body.name,
      contact_info: body.contact_info,
      lob_id: body.lob_id,
      status: body.status,
    })
    .eq('id', id)
    .select('*, lob:lines_of_business(*)')
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

  // Check if client has invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id')
    .eq('client_id', id)
    .is('deleted_at', null)
    .limit(1)

  if (invoices && invoices.length > 0) {
    return NextResponse.json(
      { error: 'Cannot delete client with existing invoices' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
