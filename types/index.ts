// Database Enums
export type AccountType = 'Business_Credit' | 'Private_Credit' | 'Bank_Transfer'
export type ParentCategory = 'COGS' | 'OPEX' | 'Mixed' | 'Financial'
export type CurrencyCode = 'ILS' | 'USD' | 'EUR' | 'GBP'
export type BeneficiaryType = 'Business' | 'Heli' | 'Shahar'
export type InvoiceStatus = 'Draft' | 'Sent' | 'Overdue' | 'Paid'
export type ClientStatus = 'Active' | 'Inactive'
export type WithdrawalMethod = 'Bank_Transfer' | 'Cash' | 'Check'
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

// Database Types
export interface Partner {
  id: string
  name: 'Heli' | 'Shahar'
  email: string
  icon_color: 'pink' | 'blue'
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  name: string
  type: AccountType
  partner_id: string | null
  partner?: Partner
  icon: string
  icon_color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  parent_category: ParentCategory
  tax_recognition_percent: number
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LineOfBusiness {
  id: string
  name: string
  icon: string
  icon_color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  contact_info: string | null
  lob_id: string | null
  lob?: LineOfBusiness
  status: ClientStatus
  created_at: string
  updated_at: string
  // Computed stats
  stats?: ClientStats
}

export interface ClientStats {
  total_invoiced: number
  total_paid: number
  total_outstanding: number
  invoice_count: number
}

export interface Expense {
  id: string
  date: string
  supplier_name: string
  amount: number
  currency: CurrencyCode
  exchange_rate_to_ils: number
  amount_ils: number
  category_id: string
  category?: Category
  account_id: string
  account?: Account
  beneficiary: BeneficiaryType
  applied_tax_percent: number
  client_id: string | null
  client?: Client
  invoice_url: string | null
  notes: string | null
  created_by: string | null
  creator?: Partner
  recurring_expense_id?: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Backwards compatibility alias
export type Transaction = Expense

export interface RecurringExpense {
  id: string
  supplier_name: string
  amount: number
  currency: CurrencyCode
  category_id: string
  category?: Category
  account_id: string
  account?: Account
  beneficiary: BeneficiaryType
  applied_tax_percent: number
  notes: string | null
  recurrence_day: number
  start_date: string
  end_date: string | null
  last_generated_date: string | null
  is_active: boolean
  created_by: string | null
  creator?: Partner
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  client?: Client
  description: string | null
  amount: number
  currency: CurrencyCode
  exchange_rate_to_ils: number
  amount_ils: number
  includes_vat: boolean
  vat_rate: number
  date_issued: string
  due_date: string
  status: InvoiceStatus
  date_paid: string | null
  heli_split_percent: number
  shahar_split_percent: number
  invoice_url: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Withdrawal {
  id: string
  partner_id: string
  partner?: Partner
  amount: number
  date: string
  method: WithdrawalMethod
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ExchangeRate {
  id: string
  date: string
  currency: CurrencyCode
  rate_to_ils: number
  source: string
  created_at: string
}

// Partner Balance Calculation
export interface PartnerBalanceBreakdown {
  total_company_income: number
  partner_income_share: number
  total_expenses: number
  partner_expense_share: number
  base_profit_share: number
  company_owes_partner: number
  partner_owes_company: number
  fairness_adjustment: number
  total_withdrawn: number
}

export interface PartnerBalance {
  partner_id: string
  partner_name: 'Heli' | 'Shahar'
  year: number
  breakdown: PartnerBalanceBreakdown
  net_available: number
  calculation_notes?: string[]
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

// Form Input Types
export interface ExpenseInput {
  date: string
  supplier_name: string
  amount: number
  currency: CurrencyCode
  category_id: string
  account_id: string
  beneficiary: BeneficiaryType
  applied_tax_percent?: number
  client_id?: string
  invoice_url?: string
  notes?: string
  // Recurring fields
  is_recurring?: boolean
  recurrence_day?: number
  recurrence_end_date?: string
}

// Backwards compatibility alias
export type TransactionInput = ExpenseInput

export interface InvoiceInput {
  invoice_number: string
  client_id: string
  description?: string
  amount: number
  currency: CurrencyCode
  includes_vat: boolean
  date_issued: string
  due_date: string
  status: InvoiceStatus
  heli_split_percent: number
  shahar_split_percent: number
  invoice_url?: string
  notes?: string
}

export interface ClientInput {
  name: string
  contact_info?: string
  lob_id?: string
  status: ClientStatus
}

export interface WithdrawalInput {
  partner_id: string
  amount: number
  date: string
  method: WithdrawalMethod
  notes?: string
}
