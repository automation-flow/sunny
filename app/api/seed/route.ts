import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()

  try {
    // 1. Seed Partners (if not exists)
    const { data: existingPartners } = await supabase.from('partners').select('id')
    if (!existingPartners || existingPartners.length === 0) {
      await supabase.from('partners').insert([
        { name: 'Heli', email: 'heli@automationsflow.com', icon_color: 'pink' },
        { name: 'Shahar', email: 'shahar@automationsflow.com', icon_color: 'blue' },
      ])
    }

    // Get partner IDs
    const { data: partners } = await supabase.from('partners').select('id, name')
    const heliId = partners?.find(p => p.name === 'Heli')?.id
    const shaharId = partners?.find(p => p.name === 'Shahar')?.id

    // 2. Seed Categories
    const { data: existingCategories } = await supabase.from('categories').select('id')
    if (!existingCategories || existingCategories.length === 0) {
      await supabase.from('categories').insert([
        // COGS
        { name: 'Software Licenses (Production)', parent_category: 'COGS', tax_recognition_percent: 1.0, description: 'SaaS tools for client work' },
        { name: 'Subcontractors', parent_category: 'COGS', tax_recognition_percent: 1.0, description: 'Freelancers for projects' },
        { name: 'Cloud Infrastructure', parent_category: 'COGS', tax_recognition_percent: 1.0, description: 'AWS, GCP, Vercel' },
        // OPEX
        { name: 'Marketing & Advertising', parent_category: 'OPEX', tax_recognition_percent: 1.0, description: 'Ads and marketing' },
        { name: 'Professional Services', parent_category: 'OPEX', tax_recognition_percent: 1.0, description: 'Accountant, lawyer' },
        { name: 'Office Supplies', parent_category: 'OPEX', tax_recognition_percent: 1.0, description: 'Equipment' },
        { name: 'Software Licenses (Internal)', parent_category: 'OPEX', tax_recognition_percent: 1.0, description: 'Notion, Slack' },
        { name: 'Travel & Transportation', parent_category: 'OPEX', tax_recognition_percent: 0.45, description: '45% recognized' },
        { name: 'Car & Fuel', parent_category: 'OPEX', tax_recognition_percent: 0.45, description: '45% recognized' },
        { name: 'Home Office - Utilities', parent_category: 'OPEX', tax_recognition_percent: 0.25, description: '25% recognized' },
        { name: 'Home Office - Arnona', parent_category: 'OPEX', tax_recognition_percent: 0.25, description: '25% recognized' },
        { name: 'Refreshments', parent_category: 'OPEX', tax_recognition_percent: 0.8, description: '80% recognized' },
        // Financial
        { name: 'Bank Fees', parent_category: 'Financial', tax_recognition_percent: 1.0, description: 'Account fees' },
        { name: 'Credit Card Fees', parent_category: 'Financial', tax_recognition_percent: 1.0, description: 'Card fees' },
      ])
    }

    // 3. Seed Accounts
    const { data: existingAccounts } = await supabase.from('accounts').select('id')
    if (!existingAccounts || existingAccounts.length === 0) {
      await supabase.from('accounts').insert([
        { name: 'Business Bank Account', type: 'Bank_Transfer', partner_id: null },
        { name: 'Heli Business Card', type: 'Business_Credit', partner_id: null },
        { name: 'Shahar Business Card', type: 'Business_Credit', partner_id: null },
        { name: 'Heli Private Card', type: 'Private_Credit', partner_id: heliId },
        { name: 'Shahar Private Card', type: 'Private_Credit', partner_id: shaharId },
      ])
    }

    // 4. Seed Lines of Business
    const { data: existingLobs } = await supabase.from('lines_of_business').select('id')
    if (!existingLobs || existingLobs.length === 0) {
      await supabase.from('lines_of_business').insert([
        { name: 'High-Tech' },
        { name: 'Legal' },
        { name: 'Retail' },
        { name: 'Healthcare' },
        { name: 'Finance' },
        { name: 'Marketing' },
        { name: 'Real Estate' },
        { name: 'Other' },
      ])
    }

    // Get LOBs
    const { data: lobs } = await supabase.from('lines_of_business').select('id, name')
    const highTechLobId = lobs?.find(l => l.name === 'High-Tech')?.id
    const legalLobId = lobs?.find(l => l.name === 'Legal')?.id
    const retailLobId = lobs?.find(l => l.name === 'Retail')?.id

    // 5. Seed Clients
    const { data: existingClients } = await supabase.from('clients').select('id')
    if (!existingClients || existingClients.length === 0) {
      await supabase.from('clients').insert([
        { name: 'Acme Corp', contact_info: 'john@acme.com', lob_id: highTechLobId, status: 'Active' },
        { name: 'TechStart Ltd', contact_info: 'sarah@techstart.io', lob_id: highTechLobId, status: 'Active' },
        { name: 'LegalEase', contact_info: 'info@legalease.co.il', lob_id: legalLobId, status: 'Active' },
        { name: 'RetailMax', contact_info: '+972-50-1234567', lob_id: retailLobId, status: 'Active' },
        { name: 'DataFlow Systems', contact_info: 'contact@dataflow.tech', lob_id: highTechLobId, status: 'Active' },
      ])
    }

    // Get clients and other data for transactions/invoices
    const { data: clients } = await supabase.from('clients').select('id, name')
    const { data: categories } = await supabase.from('categories').select('id, name, parent_category, tax_recognition_percent')
    const { data: accounts } = await supabase.from('accounts').select('id, name')

    const acmeId = clients?.find(c => c.name === 'Acme Corp')?.id
    const techStartId = clients?.find(c => c.name === 'TechStart Ltd')?.id
    const legalEaseId = clients?.find(c => c.name === 'LegalEase')?.id
    const retailMaxId = clients?.find(c => c.name === 'RetailMax')?.id
    const dataFlowId = clients?.find(c => c.name === 'DataFlow Systems')?.id

    const softwareProdCatId = categories?.find(c => c.name === 'Software Licenses (Production)')?.id
    const subcontractorsCatId = categories?.find(c => c.name === 'Subcontractors')?.id
    const marketingCatId = categories?.find(c => c.name === 'Marketing & Advertising')?.id
    const professionalCatId = categories?.find(c => c.name === 'Professional Services')?.id
    const cloudCatId = categories?.find(c => c.name === 'Cloud Infrastructure')?.id
    const refreshmentsCatId = categories?.find(c => c.name === 'Refreshments')?.id

    const businessBankId = accounts?.find(a => a.name === 'Business Bank Account')?.id
    const heliBizCardId = accounts?.find(a => a.name === 'Heli Business Card')?.id
    const shaharBizCardId = accounts?.find(a => a.name === 'Shahar Business Card')?.id
    const heliPrivateCardId = accounts?.find(a => a.name === 'Heli Private Card')?.id

    // 6. Seed Invoices
    const { data: existingInvoices } = await supabase.from('invoices').select('id')
    if (!existingInvoices || existingInvoices.length === 0) {
      await supabase.from('invoices').insert([
        // Paid invoices
        { invoice_number: 'INV-2026-001', client_id: acmeId, description: 'n8n Automation Setup', amount: 15000, currency: 'ILS', includes_vat: true, date_issued: '2026-01-05', due_date: '2026-02-05', status: 'Paid', date_paid: '2026-01-20', heli_split_percent: 50, shahar_split_percent: 50 },
        { invoice_number: 'INV-2026-002', client_id: techStartId, description: 'AI Chatbot Development', amount: 25000, currency: 'ILS', includes_vat: true, date_issued: '2026-01-08', due_date: '2026-02-08', status: 'Paid', date_paid: '2026-01-25', heli_split_percent: 60, shahar_split_percent: 40 },
        { invoice_number: 'INV-2026-003', client_id: legalEaseId, description: 'Document Automation', amount: 8000, currency: 'ILS', includes_vat: true, date_issued: '2026-01-10', due_date: '2026-02-10', status: 'Paid', date_paid: '2026-01-28', heli_split_percent: 50, shahar_split_percent: 50 },
        // Sent invoices
        { invoice_number: 'INV-2026-004', client_id: retailMaxId, description: 'Inventory Management System', amount: 20000, currency: 'ILS', includes_vat: true, date_issued: '2026-01-15', due_date: '2026-02-15', status: 'Sent', heli_split_percent: 50, shahar_split_percent: 50 },
        { invoice_number: 'INV-2026-005', client_id: dataFlowId, description: 'Data Pipeline Setup', amount: 12000, currency: 'ILS', includes_vat: true, date_issued: '2026-01-20', due_date: '2026-02-20', status: 'Sent', heli_split_percent: 40, shahar_split_percent: 60 },
        // Overdue invoice (date in the past)
        { invoice_number: 'INV-2026-006', client_id: acmeId, description: 'Maintenance Q1', amount: 5000, currency: 'ILS', includes_vat: true, date_issued: '2026-01-01', due_date: '2026-01-15', status: 'Overdue', heli_split_percent: 50, shahar_split_percent: 50 },
        // Draft
        { invoice_number: 'INV-2026-007', client_id: techStartId, description: 'Phase 2 Development', amount: 30000, currency: 'ILS', includes_vat: true, date_issued: '2026-01-28', due_date: '2026-02-28', status: 'Draft', heli_split_percent: 50, shahar_split_percent: 50 },
      ])
    }

    // 7. Seed Transactions (Expenses)
    const { data: existingTransactions } = await supabase.from('transactions').select('id')
    if (!existingTransactions || existingTransactions.length === 0) {
      const softwareCat = categories?.find(c => c.name === 'Software Licenses (Production)')
      const marketingCat = categories?.find(c => c.name === 'Marketing & Advertising')
      const professionalCat = categories?.find(c => c.name === 'Professional Services')
      const cloudCat = categories?.find(c => c.name === 'Cloud Infrastructure')
      const refreshmentsCat = categories?.find(c => c.name === 'Refreshments')
      const subcontractorsCat = categories?.find(c => c.name === 'Subcontractors')

      await supabase.from('transactions').insert([
        // Software subscriptions
        { date: '2026-01-05', supplier_name: 'OpenAI', amount: 20, currency: 'USD', exchange_rate_to_ils: 3.65, category_id: softwareProdCatId, account_id: heliBizCardId, beneficiary: 'Business', applied_tax_percent: 1.0, notes: 'ChatGPT Plus' },
        { date: '2026-01-05', supplier_name: 'n8n Cloud', amount: 50, currency: 'USD', exchange_rate_to_ils: 3.65, category_id: softwareProdCatId, account_id: heliBizCardId, beneficiary: 'Business', applied_tax_percent: 1.0, notes: 'Pro plan' },
        { date: '2026-01-10', supplier_name: 'Vercel', amount: 20, currency: 'USD', exchange_rate_to_ils: 3.65, category_id: cloudCatId, account_id: shaharBizCardId, beneficiary: 'Business', applied_tax_percent: 1.0, notes: 'Pro hosting' },
        { date: '2026-01-12', supplier_name: 'Supabase', amount: 25, currency: 'USD', exchange_rate_to_ils: 3.65, category_id: cloudCatId, account_id: shaharBizCardId, beneficiary: 'Business', applied_tax_percent: 1.0, notes: 'Pro plan' },
        // Marketing
        { date: '2026-01-08', supplier_name: 'Facebook Ads', amount: 500, currency: 'ILS', exchange_rate_to_ils: 1.0, category_id: marketingCatId, account_id: businessBankId, beneficiary: 'Business', applied_tax_percent: 1.0, notes: 'January campaign' },
        { date: '2026-01-15', supplier_name: 'LinkedIn Ads', amount: 300, currency: 'ILS', exchange_rate_to_ils: 1.0, category_id: marketingCatId, account_id: businessBankId, beneficiary: 'Business', applied_tax_percent: 1.0, notes: 'B2B outreach' },
        // Professional services
        { date: '2026-01-20', supplier_name: 'Accountant - Monthly', amount: 800, currency: 'ILS', exchange_rate_to_ils: 1.0, category_id: professionalCatId, account_id: businessBankId, beneficiary: 'Business', applied_tax_percent: 1.0, notes: 'January bookkeeping' },
        // Subcontractors
        { date: '2026-01-18', supplier_name: 'Freelance Developer', amount: 3000, currency: 'ILS', exchange_rate_to_ils: 1.0, category_id: subcontractorsCatId, account_id: businessBankId, beneficiary: 'Business', applied_tax_percent: 1.0, notes: 'Acme project assistance' },
        // Private expense for business (company owes partner)
        { date: '2026-01-22', supplier_name: 'Client Lunch', amount: 250, currency: 'ILS', exchange_rate_to_ils: 1.0, category_id: refreshmentsCatId, account_id: heliPrivateCardId, beneficiary: 'Business', applied_tax_percent: 0.8, notes: 'Meeting with Acme' },
        // More variety
        { date: '2026-01-25', supplier_name: 'Make (Integromat)', amount: 29, currency: 'USD', exchange_rate_to_ils: 3.65, category_id: softwareProdCatId, account_id: heliBizCardId, beneficiary: 'Business', applied_tax_percent: 1.0, notes: 'Teams plan' },
      ])
    }

    // 8. Seed Withdrawals
    const { data: existingWithdrawals } = await supabase.from('withdrawals').select('id')
    if (!existingWithdrawals || existingWithdrawals.length === 0) {
      await supabase.from('withdrawals').insert([
        { partner_id: heliId, amount: 5000, date: '2026-01-15', method: 'Bank_Transfer', notes: 'January advance' },
        { partner_id: shaharId, amount: 5000, date: '2026-01-15', method: 'Bank_Transfer', notes: 'January advance' },
        { partner_id: heliId, amount: 3000, date: '2026-01-28', method: 'Bank_Transfer', notes: 'Additional withdrawal' },
      ])
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
