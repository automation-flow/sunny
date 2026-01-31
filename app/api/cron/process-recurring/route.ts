import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  // Verify cron secret (optional security measure)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const today = new Date()
  const dayOfMonth = today.getDate()
  const currentMonth = today.toISOString().slice(0, 7) // YYYY-MM format
  const todayStr = today.toISOString().split('T')[0]

  // Find recurring expenses due today
  const { data: recurring, error: fetchError } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('recurrence_day', dayOfMonth)
    .eq('is_active', true)
    .is('deleted_at', null)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const rec of recurring || []) {
    // Check if already generated this month
    if (rec.last_generated_date) {
      const lastGenMonth = rec.last_generated_date.slice(0, 7)
      if (lastGenMonth >= currentMonth) {
        results.skipped++
        continue
      }
    }

    // Check if end_date has passed
    if (rec.end_date && rec.end_date < todayStr) {
      results.skipped++
      continue
    }

    // Check if start_date is in the future
    if (rec.start_date > todayStr) {
      results.skipped++
      continue
    }

    // Get exchange rate if currency is not ILS
    let exchangeRate = 1.0
    if (rec.currency !== 'ILS') {
      const rates: Record<string, number> = { USD: 3.65, EUR: 3.95, GBP: 4.55 }
      exchangeRate = rates[rec.currency] || 1.0
    }

    // Create the expense
    const { error: insertError } = await supabase
      .from('expenses')
      .insert({
        date: todayStr,
        supplier_name: rec.supplier_name,
        amount: rec.amount,
        currency: rec.currency,
        exchange_rate_to_ils: exchangeRate,
        category_id: rec.category_id,
        account_id: rec.account_id,
        beneficiary: rec.beneficiary,
        applied_tax_percent: rec.applied_tax_percent,
        notes: rec.notes,
        recurring_expense_id: rec.id,
        created_by: null, // Auto-generated, no creator
      })

    if (insertError) {
      results.errors.push(`Failed to create expense for ${rec.supplier_name}: ${insertError.message}`)
      continue
    }

    // Update last_generated_date
    await supabase
      .from('recurring_expenses')
      .update({ last_generated_date: todayStr })
      .eq('id', rec.id)

    results.created++
  }

  return NextResponse.json({
    success: true,
    date: todayStr,
    dayOfMonth,
    results,
  })
}

// Allow GET for manual testing
export async function GET(request: Request) {
  return POST(request)
}
