import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getExchangeRate } from '@/lib/exchange-rates'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const year = searchParams.get('year')
  const search = searchParams.get('search')
  const category_id = searchParams.get('category_id')
  const beneficiary = searchParams.get('beneficiary')
  const includeTaxOnly = searchParams.get('include_tax_only') === 'true'

  // Get partners for tax-only filtering
  const { data: partners } = await supabase.from('partners').select('id, name')
  const heliPartner = partners?.find(p => p.name === 'Heli')
  const shaharPartner = partners?.find(p => p.name === 'Shahar')

  let query = supabase
    .from('expenses')
    .select('*, category:categories(*), account:accounts(*), client:clients(*), creator:partners!created_by(*)')
    .is('deleted_at', null)
    .order('date', { ascending: false })

  // Only filter by year if specified (otherwise show all)
  if (year) {
    query = query
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`)
  }

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

  // Filter out tax-only transactions unless explicitly requested
  // Tax-only = Partner paid from private card for their OWN benefit
  let filteredData = data
  if (!includeTaxOnly && data) {
    filteredData = data.filter(e => {
      const accountPartnerId = e.account?.partner_id
      if (!accountPartnerId) return true // Business account - keep

      // Exclude if partner paid for their own benefit
      const isHeliAccount = accountPartnerId === heliPartner?.id
      const isShaharAccount = accountPartnerId === shaharPartner?.id

      if (isHeliAccount && e.beneficiary === 'Heli') return false
      if (isShaharAccount && e.beneficiary === 'Shahar') return false

      return true
    })
  }

  return NextResponse.json({ data: filteredData })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  // Get authenticated user and their partner ID
  const { data: { user } } = await supabase.auth.getUser()
  let createdBy = null
  if (user?.email) {
    const { data: partner } = await supabase
      .from('partners')
      .select('id')
      .eq('email', user.email)
      .single()
    createdBy = partner?.id || null
  }

  // Get exchange rate for the transaction date
  const exchangeRate = await getExchangeRate(body.currency || 'ILS', body.date)

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

  let recurringExpenseId = null

  // If this is a recurring expense, create the recurring_expense record first
  if (body.is_recurring && body.recurrence_day) {
    const { data: recurringData, error: recurringError } = await supabase
      .from('recurring_expenses')
      .insert({
        supplier_name: body.supplier_name,
        amount: body.amount,
        currency: body.currency || 'ILS',
        category_id: body.category_id,
        account_id: body.account_id,
        beneficiary: body.beneficiary || 'Business',
        applied_tax_percent: taxPercent,
        notes: body.notes || null,
        recurrence_day: body.recurrence_day,
        start_date: body.date,
        end_date: body.recurrence_end_date || null,
        last_generated_date: body.date, // Mark this month as already generated
        created_by: createdBy,
      })
      .select()
      .single()

    if (recurringError) {
      return NextResponse.json({ error: recurringError.message }, { status: 500 })
    }

    recurringExpenseId = recurringData.id
  }

  // Create the expense
  const { data, error } = await supabase
    .from('expenses')
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
      recurring_expense_id: recurringExpenseId,
      created_by: createdBy,
    })
    .select('*, category:categories(*), account:accounts(*), client:clients(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, recurring_expense_id: recurringExpenseId }, { status: 201 })
}
