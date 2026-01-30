import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*, lob:lines_of_business(*)')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get invoice stats for each client
  const { data: invoices } = await supabase
    .from('invoices')
    .select('client_id, amount_ils, status')
    .is('deleted_at', null)

  const clientsWithStats = clients?.map(client => {
    const clientInvoices = invoices?.filter(inv => inv.client_id === client.id) || []
    const stats = {
      total_invoiced: clientInvoices.reduce((sum, inv) => sum + (inv.amount_ils || 0), 0),
      total_paid: clientInvoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + (inv.amount_ils || 0), 0),
      total_outstanding: clientInvoices
        .filter(inv => inv.status !== 'Paid')
        .reduce((sum, inv) => sum + (inv.amount_ils || 0), 0),
      invoice_count: clientInvoices.length,
    }
    return { ...client, stats }
  })

  return NextResponse.json({ data: clientsWithStats })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: body.name,
      contact_info: body.contact_info || null,
      lob_id: body.lob_id || null,
      status: body.status || 'Active',
    })
    .select('*, lob:lines_of_business(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
