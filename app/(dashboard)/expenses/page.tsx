'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, CreditCard, Building2, User, Wallet } from 'lucide-react'
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
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [txnRes, catRes, accRes] = await Promise.all([
        fetch('/api/transactions?year=2026'),
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
    try {
      const res = await fetch('/api/transactions', {
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
        }),
      })
      if (!res.ok) throw new Error('Failed to add expense')
      toast.success('Expense added')
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
              <Button onClick={handleAddExpense} className="w-full bg-blue hover:bg-blue/90">Add Expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search expenses..."
          className="pl-10"
        />
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
                  <td className="p-4 text-sm">{txn.supplier_name}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
