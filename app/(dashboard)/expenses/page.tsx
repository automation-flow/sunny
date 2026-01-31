'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, CreditCard, Building2, User, Wallet, Bot, Calendar, Repeat } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import type { Transaction, Category, Account } from '@/types'

const CURRENCIES = ['ILS', 'USD', 'EUR', 'GBP'] as const
const BENEFICIARIES = ['Business', 'Heli', 'Shahar'] as const

// Partner colors
const PARTNER_COLORS = {
  Heli: '#ff6b9d',      // Pink
  Shahar: '#5ac8fa',    // Blue
  Business: '#64d2ff',  // Cyan
} as const

export default function ExpensesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  // Generate year options (current year back to 2024, plus "All Time")
  const currentYear = new Date().getFullYear()
  const yearOptions = ['all', ...Array.from({ length: currentYear - 2023 }, (_, i) => (currentYear - i).toString())]

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier_name: '',
    amount: '',
    currency: 'ILS',
    category_id: '',
    account_id: '',
    beneficiary: 'Business',
    applied_tax_percent: '',
    notes: '',
    is_recurring: false,
    recurrence_day: '',
    recurrence_end_date: '',
  })

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear])

  async function fetchData() {
    setLoading(true)
    try {
      const yearParam = selectedYear === 'all' ? '' : `year=${selectedYear}`
      const [txnRes, catRes, accRes] = await Promise.all([
        fetch(`/api/expenses${yearParam ? `?${yearParam}` : ''}`),
        fetch('/api/categories'),
        fetch('/api/accounts'),
      ])
      const [txnData, catData, accData] = await Promise.all([
        txnRes.json(),
        catRes.json(),
        accRes.json(),
      ])
      setTransactions(txnData.data || [])
      setCategories(catData.data || [])
      setAccounts(accData.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  async function handleAddExpense() {
    if (!form.supplier_name || !form.amount || !form.category_id || !form.account_id) {
      toast.error('Please fill in all required fields')
      return
    }
    if (form.is_recurring && !form.recurrence_day) {
      toast.error('Please specify the day of month for recurring expenses')
      return
    }
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          supplier_name: form.supplier_name,
          amount: parseFloat(form.amount),
          currency: form.currency,
          category_id: form.category_id,
          account_id: form.account_id,
          beneficiary: form.beneficiary,
          applied_tax_percent: form.applied_tax_percent ? parseFloat(form.applied_tax_percent) / 100 : undefined,
          notes: form.notes || null,
          is_recurring: form.is_recurring,
          recurrence_day: form.is_recurring ? parseInt(form.recurrence_day) : undefined,
          recurrence_end_date: form.is_recurring && form.recurrence_end_date ? form.recurrence_end_date : undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to add expense')
      toast.success(form.is_recurring ? 'Recurring expense added' : 'Expense added')
      setDialogOpen(false)
      setForm({
        date: new Date().toISOString().split('T')[0],
        supplier_name: '',
        amount: '',
        currency: 'ILS',
        category_id: '',
        account_id: '',
        beneficiary: 'Business',
        applied_tax_percent: '',
        notes: '',
        is_recurring: false,
        recurrence_day: '',
        recurrence_end_date: '',
      })
      fetchData()
    } catch {
      toast.error('Failed to add expense')
    }
  }

  // Auto-fill tax percent when category changes
  function handleCategoryChange(categoryId: string) {
    const category = categories.find(c => c.id === categoryId)
    setForm({
      ...form,
      category_id: categoryId,
      applied_tax_percent: category ? String(Math.round(category.tax_recognition_percent * 100)) : '',
    })
  }

  function formatCurrency(amount: number, currency: string = 'ILS') {
    const symbols: Record<string, string> = { ILS: '₪', USD: '$', EUR: '€', GBP: '£' }
    return `${symbols[currency] || ''}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Solid colored tags matching the design
  const parentCategoryColors: Record<string, string> = {
    COGS: '#ff3b30',
    OPEX: '#30b0c7',
    Financial: '#bf5af2',
    Mixed: '#ff9500',
  }

  // Category tag component
  function CategoryTag({ parentCategory }: { parentCategory: string }) {
    return (
      <span
        className="px-2 py-0.5 rounded text-xs font-semibold text-white"
        style={{ backgroundColor: parentCategoryColors[parentCategory] || '#666' }}
      >
        {parentCategory}
      </span>
    )
  }

  // Helper to get account icon color based on name
  function getAccountColor(accountName: string): string {
    if (accountName.includes('Heli')) return PARTNER_COLORS.Heli
    if (accountName.includes('Shahar')) return PARTNER_COLORS.Shahar
    return PARTNER_COLORS.Business
  }

  // Helper to get account icon based on type
  function getAccountIcon(account: Account) {
    const color = getAccountColor(account.name)
    if (account.type === 'Bank_Transfer') {
      return <Building2 className="w-4 h-4" style={{ color }} />
    }
    if (account.type === 'Private_Credit') {
      return <Wallet className="w-4 h-4" style={{ color }} />
    }
    return <CreditCard className="w-4 h-4" style={{ color }} />
  }

  // Beneficiary icon with color
  function getBeneficiaryIcon(beneficiary: string) {
    const color = PARTNER_COLORS[beneficiary as keyof typeof PARTNER_COLORS] || PARTNER_COLORS.Business
    if (beneficiary === 'Business') {
      return <Building2 className="w-4 h-4" style={{ color }} />
    }
    return <User className="w-4 h-4" style={{ color }} />
  }

  // Get creator display (Added By column)
  function getCreatorDisplay(txn: Transaction) {
    // If created_by is null, it's auto-generated
    if (!txn.created_by) {
      return (
        <div className="flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Auto</span>
        </div>
      )
    }
    // If we have creator info from the joined partner
    const creator = (txn as Transaction & { creator?: { name: string; icon_color: string } }).creator
    if (creator) {
      const color = creator.icon_color === 'pink' ? PARTNER_COLORS.Heli : PARTNER_COLORS.Shahar
      return (
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4" style={{ color }} />
          <span style={{ color }}>{creator.name}</span>
        </div>
      )
    }
    // Fallback
    return <span className="text-muted-foreground">—</span>
  }

  const filteredTransactions = transactions.filter(t =>
    t.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
    t.notes?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue hover:bg-blue/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Supplier *</Label>
                  <Input
                    value={form.supplier_name}
                    onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                    placeholder="e.g., OpenAI"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category_id} onValueChange={handleCategoryChange}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-3">
                          <CategoryTag parentCategory={c.parent_category} />
                          <span className="text-sm">{c.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Account *</Label>
                <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        <div className="flex items-center gap-2">
                          {getAccountIcon(a)}
                          <span>{a.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Beneficiary</Label>
                  <Select value={form.beneficiary} onValueChange={(v) => setForm({ ...form, beneficiary: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BENEFICIARIES.map((b) => (
                        <SelectItem key={b} value={b}>
                          <div className="flex items-center gap-2">
                            {getBeneficiaryIcon(b)}
                            <span>{b}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tax Recognition %</Label>
                  <Input
                    type="number"
                    value={form.applied_tax_percent}
                    onChange={(e) => setForm({ ...form, applied_tax_percent: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>

              {/* Recurring Expense Checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="recurring"
                  checked={form.is_recurring}
                  onCheckedChange={(checked) => setForm({ ...form, is_recurring: checked === true })}
                />
                <label
                  htmlFor="recurring"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <Repeat className="w-4 h-4 text-muted-foreground" />
                  Recurring Expense
                </label>
              </div>

              {/* Recurring Settings (shown when checkbox is checked) */}
              {form.is_recurring && (
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-background-secondary border border-border">
                  <div className="space-y-2">
                    <Label>Day of Month *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={form.recurrence_day}
                      onChange={(e) => setForm({ ...form, recurrence_day: e.target.value })}
                      placeholder="1-31"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="date"
                      value={form.recurrence_end_date}
                      onChange={(e) => setForm({ ...form, recurrence_end_date: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <Button onClick={handleAddExpense} className="w-full bg-blue hover:bg-blue/90">
                {form.is_recurring ? 'Add Recurring Expense' : 'Add Expense'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            className="pl-10"
          />
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[140px]">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year}>
                {year === 'all' ? 'All Time' : year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {search ? 'No expenses match your search.' : 'No expenses yet. Add one to get started.'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Account</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Supplier</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">For</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Added By</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {txn.account && getAccountIcon(txn.account)}
                      <span className="text-sm">{txn.account?.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{formatDate(txn.date)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <CategoryTag parentCategory={txn.category?.parent_category || 'OPEX'} />
                      <span className="text-sm">{txn.category?.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      {txn.recurring_expense_id && (
                        <span title="Recurring expense">
                          <Repeat className="w-3.5 h-3.5 text-blue" />
                        </span>
                      )}
                      {txn.supplier_name}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      {getBeneficiaryIcon(txn.beneficiary)}
                      <span style={{ color: PARTNER_COLORS[txn.beneficiary as keyof typeof PARTNER_COLORS] || PARTNER_COLORS.Business }}>
                        {txn.beneficiary}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm font-medium">{formatCurrency(txn.amount_ils, 'ILS')}</div>
                    {txn.currency !== 'ILS' && (
                      <div className="text-xs text-muted-foreground">{formatCurrency(txn.amount, txn.currency)}</div>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    {getCreatorDisplay(txn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
