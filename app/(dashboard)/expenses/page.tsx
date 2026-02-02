'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Search, CreditCard, Building2, User, Wallet, Bot, Calendar, Repeat, Pencil, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import type { Transaction, Category, Account } from '@/types'

const CURRENCIES = ['ILS', 'USD', 'EUR', 'GBP'] as const
const BENEFICIARIES = ['Business', 'Heli', 'Shahar'] as const

// Partner colors
const PARTNER_COLORS = {
  Heli: '#ff6b9d',      // Pink
  Shahar: '#5ac8fa',    // Blue
  Business: '#bf5af2',  // Purple
} as const

export default function ExpensesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [availableYears, setAvailableYears] = useState<number[]>([])

  // Edit/Delete state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null)
  const [deletingExpense, setDeletingExpense] = useState<Transaction | null>(null)

  // Prevent double-submit
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const [editForm, setEditForm] = useState({
    date: '',
    supplier_name: '',
    amount: '',
    currency: 'ILS',
    category_id: '',
    account_id: '',
    beneficiary: 'Business',
    applied_tax_percent: '',
    notes: '',
  })

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear])

  async function fetchData() {
    setLoading(true)
    try {
      const yearParam = selectedYear === 'all' ? '' : `year=${selectedYear}`
      const [txnRes, catRes, accRes, yearsRes] = await Promise.all([
        fetch(`/api/expenses${yearParam ? `?${yearParam}` : ''}`),
        fetch('/api/categories'),
        fetch('/api/accounts'),
        fetch('/api/expenses/years'),
      ])
      const [txnData, catData, accData, yearsData] = await Promise.all([
        txnRes.json(),
        catRes.json(),
        accRes.json(),
        yearsRes.json(),
      ])
      setTransactions(txnData.data || [])
      setCategories(catData.data || [])
      setAccounts(accData.data || [])
      setAvailableYears(yearsData.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  async function handleAddExpense() {
    // Prevent double-submit
    if (isSubmitting) return

    if (!form.supplier_name || !form.amount || !form.category_id || !form.account_id) {
      toast.error('Please fill in all required fields')
      return
    }
    if (form.is_recurring && !form.recurrence_day) {
      toast.error('Please specify the day of month for recurring expenses')
      return
    }

    setIsSubmitting(true)
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
    } finally {
      setIsSubmitting(false)
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

  // Open edit dialog with expense data
  function openEditDialog(expense: Transaction) {
    setEditingExpense(expense)
    setEditForm({
      date: expense.date,
      supplier_name: expense.supplier_name,
      amount: String(expense.amount),
      currency: expense.currency,
      category_id: expense.category_id,
      account_id: expense.account_id,
      beneficiary: expense.beneficiary,
      applied_tax_percent: expense.applied_tax_percent ? String(Math.round(expense.applied_tax_percent * 100)) : '',
      notes: expense.notes || '',
    })
    setEditDialogOpen(true)
  }

  // Handle edit expense
  async function handleEditExpense() {
    if (!editingExpense) return
    if (!editForm.supplier_name || !editForm.amount || !editForm.category_id || !editForm.account_id) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editForm.date,
          supplier_name: editForm.supplier_name,
          amount: parseFloat(editForm.amount),
          currency: editForm.currency,
          category_id: editForm.category_id,
          account_id: editForm.account_id,
          beneficiary: editForm.beneficiary,
          applied_tax_percent: editForm.applied_tax_percent ? parseFloat(editForm.applied_tax_percent) / 100 : undefined,
          notes: editForm.notes || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to update expense')
      toast.success('Expense updated')
      setEditDialogOpen(false)
      setEditingExpense(null)
      fetchData()
    } catch {
      toast.error('Failed to update expense')
    }
  }

  // Handle delete expense
  async function handleDeleteExpense() {
    if (!deletingExpense) return
    try {
      const res = await fetch(`/api/expenses/${deletingExpense.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete expense')
      toast.success('Expense deleted')
      setDeleteDialogOpen(false)
      setDeletingExpense(null)
      fetchData()
    } catch {
      toast.error('Failed to delete expense')
    }
  }

  // Auto-fill tax percent when category changes (edit form)
  function handleEditCategoryChange(categoryId: string) {
    const category = categories.find(c => c.id === categoryId)
    setEditForm({
      ...editForm,
      category_id: categoryId,
      applied_tax_percent: category ? String(Math.round(category.tax_recognition_percent * 100)) : editForm.applied_tax_percent,
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
          <span>{creator.name}</span>
        </div>
      )
    }
    // Fallback
    return <span className="text-muted-foreground">—</span>
  }

  // Smart search filter - supports free text queries
  // Examples: "Account = Heli", "Beneficiary = Business", "Category = COGS"
  // Also supports: "Heli & Business", "OpenAI", simple text search
  const filteredTransactions = transactions.filter(t => {
    if (!search.trim()) return true

    const searchLower = search.toLowerCase().trim()

    // Check for structured queries with "=" or ":"
    const hasStructuredQuery = searchLower.includes('=') || searchLower.includes(':')

    if (hasStructuredQuery) {
      // Split by & for multiple conditions
      const conditions = searchLower.split(/\s*&\s*/)

      return conditions.every(condition => {
        const [field, value] = condition.split(/\s*[=:]\s*/).map(s => s.trim())

        if (!field || !value) return true // Invalid condition, skip

        // Match fields
        if (field.includes('account')) {
          return t.account?.name?.toLowerCase().includes(value)
        }
        if (field.includes('beneficiary') || field.includes('for')) {
          return t.beneficiary.toLowerCase().includes(value)
        }
        if (field.includes('category') || field.includes('cat')) {
          return t.category?.name?.toLowerCase().includes(value) ||
            t.category?.parent_category?.toLowerCase().includes(value)
        }
        if (field.includes('supplier')) {
          return t.supplier_name.toLowerCase().includes(value)
        }
        if (field.includes('notes')) {
          return t.notes?.toLowerCase().includes(value)
        }

        return true
      })
    }

    // Simple text search - search across multiple fields
    return (
      t.supplier_name.toLowerCase().includes(searchLower) ||
      t.notes?.toLowerCase().includes(searchLower) ||
      t.account?.name?.toLowerCase().includes(searchLower) ||
      t.beneficiary.toLowerCase().includes(searchLower) ||
      t.category?.name?.toLowerCase().includes(searchLower) ||
      t.category?.parent_category?.toLowerCase().includes(searchLower)
    )
  })

  // Calculate filtered total
  const filteredTotal = filteredTransactions.reduce((sum, t) => sum + (t.amount_ils || 0), 0)
  const isFiltered = search.trim().length > 0

  // Calculate totals for summary cards
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  // Year total (based on selected filter, or all time if 'all')
  const yearTotal = transactions.reduce((sum, t) => sum + (t.amount_ils || 0), 0)
  const yearCount = transactions.length
  const yearLabel = selectedYear === 'all' ? 'All Time' : selectedYear

  // Current month total (from all transactions, filtered to current month)
  const currentMonthTransactions = transactions.filter(t => {
    const txnDate = new Date(t.date)
    return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear
  })
  const monthTotal = currentMonthTransactions.reduce((sum, t) => sum + (t.amount_ils || 0), 0)
  const monthCount = currentMonthTransactions.length
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Expenses</h1>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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

              <Button
                onClick={handleAddExpense}
                disabled={isSubmitting}
                className="w-full bg-blue hover:bg-blue/90"
              >
                {isSubmitting ? 'Adding...' : (form.is_recurring ? 'Add Recurring Expense' : 'Add Expense')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">{yearLabel} Total</p>
          <p className="text-2xl font-bold text-red">{formatCurrency(yearTotal, 'ILS')}</p>
          <p className="text-xs text-muted-foreground mt-1">{yearCount} expense{yearCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">{monthName} {currentYear}</p>
          <p className="text-2xl font-bold text-red">{formatCurrency(monthTotal, 'ILS')}</p>
          <p className="text-xs text-muted-foreground mt-1">{monthCount} expense{monthCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          {/* Search bar - fills available space */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or filter (e.g. account=Heli & beneficiary=Business)"
              className="pl-10"
            />
          </div>

          {/* Right-aligned controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[130px]">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="bg-blue hover:bg-blue/90" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Filtered results info */}
        {isFiltered && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filteredTransactions.length}</span> expense{filteredTransactions.length !== 1 ? 's' : ''}{' '}
            <span className="text-muted-foreground">(filtered by: &quot;{search}&quot;)</span>
            <span className="mx-2">•</span>
            <span>Filtered Total: </span>
            <span className="font-medium text-red">{formatCurrency(filteredTotal, 'ILS')}</span>
          </div>
        )}
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
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
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
                      <span>{txn.beneficiary}</span>
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
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditDialog(txn)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => {
                          setDeletingExpense(txn)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Expense Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the expense details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <Input
                  value={editForm.supplier_name}
                  onChange={(e) => setEditForm({ ...editForm, supplier_name: e.target.value })}
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
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={editForm.currency} onValueChange={(v) => setEditForm({ ...editForm, currency: v })}>
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
              <Select value={editForm.category_id} onValueChange={handleEditCategoryChange}>
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
              <Select value={editForm.account_id} onValueChange={(v) => setEditForm({ ...editForm, account_id: v })}>
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
                <Select value={editForm.beneficiary} onValueChange={(v) => setEditForm({ ...editForm, beneficiary: v })}>
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
                  value={editForm.applied_tax_percent}
                  onChange={(e) => setEditForm({ ...editForm, applied_tax_percent: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditExpense} className="bg-blue hover:bg-blue/90">
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingExpense && (
            <div className="py-4 space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Supplier:</span>{' '}
                <span className="font-medium">{deletingExpense.supplier_name}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Amount:</span>{' '}
                <span className="font-medium">{formatCurrency(deletingExpense.amount, deletingExpense.currency)}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Date:</span>{' '}
                <span className="font-medium">{formatDate(deletingExpense.date)}</span>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteExpense}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
