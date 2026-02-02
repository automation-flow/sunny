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

    // Get all expenses for the year with account info
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*, category:categories(parent_category), account:accounts(id, name, type, partner_id)')
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

    const heliPartner = partners?.find(p => p.name === 'Heli')
    const shaharPartner = partners?.find(p => p.name === 'Shahar')

    // ==========================================
    // FILTER: Exclude Tax-Only Transactions
    // Tax-only = Partner paid from private card for their OWN benefit
    // These are recorded for tax purposes only, not business calculations
    // ==========================================
    // Business expenses = all expenses EXCEPT tax-only
    const businessExpenses = expenses?.filter(e => {
      const accountPartnerId = e.account?.partner_id
      if (!accountPartnerId) return true // Business account - keep

      // Check if the partner who paid is the same as the beneficiary (tax-only)
      const isHeliAccount = accountPartnerId === heliPartner?.id
      const isShaharAccount = accountPartnerId === shaharPartner?.id

      if (isHeliAccount && e.beneficiary === 'Heli') return false // Tax-only - exclude
      if (isShaharAccount && e.beneficiary === 'Shahar') return false // Tax-only - exclude

      return true
    }) || []

    // Calculate income from paid invoices
    const paidInvoices = invoices?.filter(inv => inv.status === 'Paid') || []
    const totalIncome = paidInvoices.reduce((sum, inv) => sum + (inv.amount_ils || 0), 0)

    // Calculate expenses by parent category (excluding tax-only)
    const cogs = businessExpenses.filter(t => t.category?.parent_category === 'COGS')
      .reduce((sum, t) => sum + (t.amount_ils || 0), 0)
    const opex = businessExpenses.filter(t => t.category?.parent_category === 'OPEX')
      .reduce((sum, t) => sum + (t.amount_ils || 0), 0)
    const financial = businessExpenses.filter(t => t.category?.parent_category === 'Financial')
      .reduce((sum, t) => sum + (t.amount_ils || 0), 0)
    const mixed = businessExpenses.filter(t => t.category?.parent_category === 'Mixed')
      .reduce((sum, t) => sum + (t.amount_ils || 0), 0)

    const totalExpenses = cogs + opex + financial + mixed
    const grossProfit = totalIncome - cogs
    const grossMargin = totalIncome > 0 ? (grossProfit / totalIncome) * 100 : 0
    const netProfit = totalIncome - totalExpenses

    // ==========================================
    // PART A: PROFIT SHARING
    // ==========================================

    // Revenue per partner (from invoice splits, excluding VAT)
    const heliRevenue = paidInvoices.reduce((sum, inv) => {
      const netAmount = inv.includes_vat ? (inv.amount_ils / (1 + inv.vat_rate)) : inv.amount_ils
      return sum + (netAmount * (inv.heli_split_percent / 100))
    }, 0)
    const shaharRevenue = paidInvoices.reduce((sum, inv) => {
      const netAmount = inv.includes_vat ? (inv.amount_ils / (1 + inv.vat_rate)) : inv.amount_ils
      return sum + (netAmount * (inv.shahar_split_percent / 100))
    }, 0)

    // Costs per partner (50% of ALL expenses)
    const partnerCosts = totalExpenses / 2

    // Profits per partner
    const heliProfits = heliRevenue - partnerCosts
    const shaharProfits = shaharRevenue - partnerCosts

    // ==========================================
    // PART B: PARTNER CURRENT ACCOUNT (Jeru)
    // ==========================================

    // Out-of-Pocket: Partner paid from PRIVATE card for BUSINESS
    // Business owes partner 100%
    const heliOutOfPocket = expenses?.filter(e =>
      e.account?.partner_id === heliPartner?.id &&
      e.beneficiary === 'Business'
    ).reduce((sum, e) => sum + (e.amount_ils || 0), 0) || 0

    const shaharOutOfPocket = expenses?.filter(e =>
      e.account?.partner_id === shaharPartner?.id &&
      e.beneficiary === 'Business'
    ).reduce((sum, e) => sum + (e.amount_ils || 0), 0) || 0

    // Benefits Received (Draws): BUSINESS paid for partner's personal benefit
    // Only counts when business account paid (not when partner paid for themselves)
    const heliBenefits = expenses?.filter(e =>
      e.beneficiary === 'Heli' &&
      e.account?.partner_id !== heliPartner?.id // Business paid, not Heli's private card
    ).reduce((sum, e) => sum + (e.amount_ils || 0), 0) || 0

    const shaharBenefits = expenses?.filter(e =>
      e.beneficiary === 'Shahar' &&
      e.account?.partner_id !== shaharPartner?.id // Business paid, not Shahar's private card
    ).reduce((sum, e) => sum + (e.amount_ils || 0), 0) || 0

    // Current Account Balance = Out-of-Pocket - Benefits
    const heliCurrentAccount = heliOutOfPocket - heliBenefits
    const shaharCurrentAccount = shaharOutOfPocket - shaharBenefits

    // ==========================================
    // PART C: FAIRNESS TRACKING
    // ==========================================

    // Benefits imbalance (positive = Heli drew more)
    const benefitsImbalance = heliBenefits - shaharBenefits

    // ==========================================
    // PART D: FINAL CALCULATION
    // ==========================================

    // Withdrawals per partner
    const heliWithdrawals = withdrawals?.filter(w => w.partner?.name === 'Heli')
      .reduce((sum, w) => sum + w.amount, 0) || 0
    const shaharWithdrawals = withdrawals?.filter(w => w.partner?.name === 'Shahar')
      .reduce((sum, w) => sum + w.amount, 0) || 0

    // Net Available = Profits + Current Account - Withdrawals
    const heliNetAvailable = heliProfits + heliCurrentAccount - heliWithdrawals
    const shaharNetAvailable = shaharProfits + shaharCurrentAccount - shaharWithdrawals

    // Open invoices (sent + overdue)
    const openInvoices = invoices?.filter(inv => inv.status === 'Sent' || inv.status === 'Overdue') || []
    const overdueInvoices = invoices?.filter(inv => inv.status === 'Overdue') || []

    return NextResponse.json({
      data: {
        // Summary stats
        totalIncome,
        cogs,
        opex,
        financial,
        totalExpenses,
        grossProfit,
        grossMargin,
        netProfit,

        // Partner data with new structure
        partners: {
          heli: {
            id: heliPartner?.id,
            // Profit Sharing
            revenue: heliRevenue,
            costs: partnerCosts,
            profits: heliProfits,
            // Current Account
            outOfPocket: heliOutOfPocket,
            benefitsReceived: heliBenefits,
            currentAccount: heliCurrentAccount,
            // Fairness (vs other partner)
            benefitsVsOther: -benefitsImbalance, // negative means drew more
            // Final
            withdrawals: heliWithdrawals,
            netAvailable: heliNetAvailable,
            // Legacy fields for backward compatibility
            earnings: heliRevenue,
            available: heliNetAvailable,
          },
          shahar: {
            id: shaharPartner?.id,
            // Profit Sharing
            revenue: shaharRevenue,
            costs: partnerCosts,
            profits: shaharProfits,
            // Current Account
            outOfPocket: shaharOutOfPocket,
            benefitsReceived: shaharBenefits,
            currentAccount: shaharCurrentAccount,
            // Fairness (vs other partner)
            benefitsVsOther: benefitsImbalance, // positive means drew less
            // Final
            withdrawals: shaharWithdrawals,
            netAvailable: shaharNetAvailable,
            // Legacy fields for backward compatibility
            earnings: shaharRevenue,
            available: shaharNetAvailable,
          },
        },

        // Overall fairness
        benefitsImbalance,

        // Open invoices
        openInvoices: {
          count: openInvoices.length,
          total: openInvoices.reduce((sum, inv) => sum + (inv.amount_ils || 0), 0),
          overdueCount: overdueInvoices.length,
          overdueTotal: overdueInvoices.reduce((sum, inv) => sum + (inv.amount_ils || 0), 0),
        },

        // Counts
        invoiceCount: invoices?.length || 0,
        expenseCount: businessExpenses.length,
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
