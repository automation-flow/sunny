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

    // Get all transactions for the year
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, category:categories(parent_category)')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`)
      .is('deleted_at', null)

    // Get all withdrawals for the year
    const { data: withdrawals } = await supabase
      .from('withdrawals')
      .select('*, partner:partners(name)')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`)
      .is('deleted_at', null)

    // Get partners
    const { data: partners } = await supabase
      .from('partners')
      .select('*')

    // Calculate income from paid invoices
    const paidInvoices = invoices?.filter(inv => inv.status === 'Paid') || []
    const totalIncome = paidInvoices.reduce((sum, inv) => sum + (inv.amount_ils || 0), 0)

    // Calculate expenses by parent category
    const cogs = transactions?.filter(t => t.category?.parent_category === 'COGS')
      .reduce((sum, t) => sum + (t.amount_ils || 0), 0) || 0
    const opex = transactions?.filter(t => t.category?.parent_category === 'OPEX')
      .reduce((sum, t) => sum + (t.amount_ils || 0), 0) || 0
    const financial = transactions?.filter(t => t.category?.parent_category === 'Financial')
      .reduce((sum, t) => sum + (t.amount_ils || 0), 0) || 0

    const totalExpenses = cogs + opex + financial
    const grossProfit = totalIncome - cogs
    const grossMargin = totalIncome > 0 ? (grossProfit / totalIncome) * 100 : 0
    const netProfit = totalIncome - totalExpenses

    // Calculate partner splits from paid invoices
    const heliEarnings = paidInvoices.reduce((sum, inv) => {
      const netAmount = inv.includes_vat ? (inv.amount_ils / (1 + inv.vat_rate)) : inv.amount_ils
      return sum + (netAmount * (inv.heli_split_percent / 100))
    }, 0)
    const shaharEarnings = paidInvoices.reduce((sum, inv) => {
      const netAmount = inv.includes_vat ? (inv.amount_ils / (1 + inv.vat_rate)) : inv.amount_ils
      return sum + (netAmount * (inv.shahar_split_percent / 100))
    }, 0)

    // Calculate withdrawals per partner
    const heliWithdrawals = withdrawals?.filter(w => w.partner?.name === 'Heli')
      .reduce((sum, w) => sum + w.amount, 0) || 0
    const shaharWithdrawals = withdrawals?.filter(w => w.partner?.name === 'Shahar')
      .reduce((sum, w) => sum + w.amount, 0) || 0

    // Available to withdraw = earnings - already withdrawn
    const heliAvailable = heliEarnings - heliWithdrawals
    const shaharAvailable = shaharEarnings - shaharWithdrawals

    // Partner difference (positive = Heli has more available)
    const partnerDifference = heliAvailable - shaharAvailable

    // Open invoices (sent + overdue)
    const openInvoices = invoices?.filter(inv => inv.status === 'Sent' || inv.status === 'Overdue') || []
    const overdueInvoices = invoices?.filter(inv => inv.status === 'Overdue') || []

    return NextResponse.json({
      data: {
        totalIncome,
        cogs,
        opex,
        financial,
        totalExpenses,
        grossProfit,
        grossMargin,
        netProfit,
        partners: {
          heli: {
            id: partners?.find(p => p.name === 'Heli')?.id,
            earnings: heliEarnings,
            withdrawals: heliWithdrawals,
            available: heliAvailable,
          },
          shahar: {
            id: partners?.find(p => p.name === 'Shahar')?.id,
            earnings: shaharEarnings,
            withdrawals: shaharWithdrawals,
            available: shaharAvailable,
          },
        },
        partnerDifference,
        openInvoices: {
          count: openInvoices.length,
          total: openInvoices.reduce((sum, inv) => sum + (inv.amount_ils || 0), 0),
          overdueCount: overdueInvoices.length,
          overdueTotal: overdueInvoices.reduce((sum, inv) => sum + (inv.amount_ils || 0), 0),
        },
        invoiceCount: invoices?.length || 0,
        transactionCount: transactions?.length || 0,
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
