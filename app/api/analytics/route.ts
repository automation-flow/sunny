import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year') || new Date().getFullYear().toString()

  try {
    // Get all invoices for the year
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .gte('date_issued', `${year}-01-01`)
      .lte('date_issued', `${year}-12-31`)
      .is('deleted_at', null)

    // Get all transactions for the year (with account info for tax-only filtering)
    const { data: allTransactions } = await supabase
      .from('transactions')
      .select('*, category:categories(name, parent_category), account:accounts(id, partner_id)')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`)
      .is('deleted_at', null)

    // Get partners for tax-only detection
    const { data: partners } = await supabase.from('partners').select('id, name')
    const heliPartner = partners?.find(p => p.name === 'Heli')
    const shaharPartner = partners?.find(p => p.name === 'Shahar')

    // Filter out tax-only transactions (partner paid for own benefit)
    const transactions = allTransactions?.filter(e => {
      const accountPartnerId = e.account?.partner_id
      if (!accountPartnerId) return true // Business account - keep

      // Exclude if partner paid for their own benefit
      const isHeliAccount = accountPartnerId === heliPartner?.id
      const isShaharAccount = accountPartnerId === shaharPartner?.id

      if (isHeliAccount && e.beneficiary === 'Heli') return false
      if (isShaharAccount && e.beneficiary === 'Shahar') return false

      return true
    }) || []

    // Monthly income (from paid invoices)
    const monthlyIncome: Record<string, number> = {}
    const monthlyExpenses: Record<string, number> = {}

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    months.forEach(m => {
      monthlyIncome[m] = 0
      monthlyExpenses[m] = 0
    })

    invoices?.filter(inv => inv.status === 'Paid').forEach(inv => {
      const month = new Date(inv.date_paid || inv.date_issued).getMonth()
      monthlyIncome[months[month]] += inv.amount_ils || 0
    })

    transactions.forEach(txn => {
      const month = new Date(txn.date).getMonth()
      monthlyExpenses[months[month]] += txn.amount_ils || 0
    })

    const monthlyData = months.map(month => ({
      month,
      income: monthlyIncome[month],
      expenses: monthlyExpenses[month],
      profit: monthlyIncome[month] - monthlyExpenses[month],
    }))

    // Expenses by category
    const categoryExpenses: Record<string, number> = {}
    transactions.forEach(txn => {
      const catName = txn.category?.name || 'Unknown'
      categoryExpenses[catName] = (categoryExpenses[catName] || 0) + (txn.amount_ils || 0)
    })

    const categoryData = Object.entries(categoryExpenses)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Expenses by parent category
    const parentCategoryExpenses: Record<string, number> = { COGS: 0, OPEX: 0, Financial: 0 }
    transactions.forEach(txn => {
      const parent = txn.category?.parent_category || 'OPEX'
      parentCategoryExpenses[parent] += txn.amount_ils || 0
    })

    const parentCategoryData = [
      { name: 'COGS', value: parentCategoryExpenses.COGS, color: '#FF5B5B' },
      { name: 'OPEX', value: parentCategoryExpenses.OPEX, color: '#3BB4D8' },
      { name: 'Financial', value: parentCategoryExpenses.Financial, color: '#A855F7' },
    ]

    // Income by client
    const clientIncome: Record<string, number> = {}
    invoices?.filter(inv => inv.status === 'Paid').forEach(inv => {
      const clientId = inv.client_id
      clientIncome[clientId] = (clientIncome[clientId] || 0) + (inv.amount_ils || 0)
    })

    // Get client names
    const { data: clients } = await supabase.from('clients').select('id, name')
    const clientData = Object.entries(clientIncome)
      .map(([id, value]) => ({
        name: clients?.find(c => c.id === id)?.name || 'Unknown',
        value
      }))
      .sort((a, b) => b.value - a.value)

    // Summary stats
    const totalIncome = invoices?.filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + (inv.amount_ils || 0), 0) || 0
    const totalExpenses = transactions.reduce((sum, txn) => sum + (txn.amount_ils || 0), 0)

    return NextResponse.json({
      data: {
        monthlyData,
        categoryData,
        parentCategoryData,
        clientData,
        summary: {
          totalIncome,
          totalExpenses,
          netProfit: totalIncome - totalExpenses,
          avgMonthlyIncome: totalIncome / 12,
          avgMonthlyExpenses: totalExpenses / 12,
        }
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
  }
}
