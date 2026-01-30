'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Check, FileText, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Invoice, Client } from '@/types'

const CURRENCIES = ['ILS', 'USD', 'EUR', 'GBP'] as const
const STATUSES = ['Draft', 'Sent', 'Paid'] as const

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [form, setForm] = useState({
    invoice_number: '',
    client_id: '',
    description: '',
    amount: '',
    currency: 'ILS',
    includes_vat: true,
    date_issued: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Draft',
    heli_split_percent: '50',
    shahar_split_percent: '50',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [invRes, clientRes] = await Promise.all([
        fetch('/api/invoices?year=2026'),
        fetch('/api/clients'),
      ])
      const [invData, clientData] = await Promise.all([
        invRes.json(),
        clientRes.json(),
      ])
      setInvoices(invData.data || [])
      setClients(clientData.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  async function handleAddInvoice() {
    if (!form.invoice_number || !form.client_id || !form.amount) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_number: form.invoice_number,
          client_id: form.client_id,
          description: form.description || null,
          amount: parseFloat(form.amount),
          currency: form.currency,
          includes_vat: form.includes_vat,
          date_issued: form.date_issued,
          due_date: form.due_date,
          status: form.status,
          heli_split_percent: parseFloat(form.heli_split_percent),
          shahar_split_percent: parseFloat(form.shahar_split_percent),
        }),
      })
      if (!res.ok) throw new Error('Failed to add invoice')
      toast.success('Invoice added')
      setDialogOpen(false)
      setForm({
        invoice_number: '',
        client_id: '',
        description: '',
        amount: '',
        currency: 'ILS',
        includes_vat: true,
        date_issued: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Draft',
        heli_split_percent: '50',
        shahar_split_percent: '50',
      })
      fetchData()
    } catch {
      toast.error('Failed to add invoice')
    }
  }

  async function markAsPaid(invoiceId: string) {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Paid' }),
      })
      if (!res.ok) throw new Error('Failed to update invoice')
      toast.success('Invoice marked as paid')
      fetchData()
    } catch {
      toast.error('Failed to update invoice')
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Group invoices by status
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue')
  const sentInvoices = invoices.filter(inv => inv.status === 'Sent')
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid')
  const draftInvoices = invoices.filter(inv => inv.status === 'Draft')

  const statusColors: Record<string, string> = {
    Draft: 'bg-gray-500/20 text-gray-400',
    Sent: 'bg-blue/20 text-blue',
    Overdue: 'bg-red/20 text-red',
    Paid: 'bg-green/20 text-green',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue hover:bg-blue/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Number *</Label>
                  <Input
                    value={form.invoice_number}
                    onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                    placeholder="INV-2026-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client *</Label>
                  <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Project description"
                />
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vat"
                  checked={form.includes_vat}
                  onCheckedChange={(checked) => setForm({ ...form, includes_vat: checked as boolean })}
                />
                <Label htmlFor="vat">Includes VAT (18%)</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Issued</Label>
                  <Input
                    type="date"
                    value={form.date_issued}
                    onChange={(e) => setForm({ ...form, date_issued: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heli Split %</Label>
                  <Input
                    type="number"
                    value={form.heli_split_percent}
                    onChange={(e) => setForm({
                      ...form,
                      heli_split_percent: e.target.value,
                      shahar_split_percent: String(100 - parseFloat(e.target.value || '0'))
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shahar Split %</Label>
                  <Input
                    type="number"
                    value={form.shahar_split_percent}
                    onChange={(e) => setForm({
                      ...form,
                      shahar_split_percent: e.target.value,
                      heli_split_percent: String(100 - parseFloat(e.target.value || '0'))
                    })}
                  />
                </div>
              </div>
              <Button onClick={handleAddInvoice} className="w-full bg-blue hover:bg-blue/90">Add Invoice</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-red/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red">{overdueInvoices.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red/50" />
            </div>
            <p className="text-sm text-red mt-2">
              {formatCurrency(overdueInvoices.reduce((sum, inv) => sum + (inv.amount_ils || 0), 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-blue/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold text-blue">{sentInvoices.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue/50" />
            </div>
            <p className="text-sm text-blue mt-2">
              {formatCurrency(sentInvoices.reduce((sum, inv) => sum + (inv.amount_ils || 0), 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-green">{paidInvoices.length}</p>
              </div>
              <Check className="w-8 h-8 text-green/50" />
            </div>
            <p className="text-sm text-green mt-2">
              {formatCurrency(paidInvoices.reduce((sum, inv) => sum + (inv.amount_ils || 0), 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Lists */}
      {loading ? (
        <div className="glass-card p-8 text-center text-muted-foreground">Loading...</div>
      ) : invoices.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted-foreground">No invoices yet. Add one to get started.</div>
      ) : (
        <div className="space-y-6">
          {/* Overdue */}
          {overdueInvoices.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-red flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Overdue ({overdueInvoices.length})
              </h2>
              {overdueInvoices.map((inv) => (
                <InvoiceCard key={inv.id} invoice={inv} onMarkPaid={() => markAsPaid(inv.id)} statusColors={statusColors} formatCurrency={formatCurrency} formatDate={formatDate} />
              ))}
            </div>
          )}

          {/* Sent */}
          {sentInvoices.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-blue">Sent ({sentInvoices.length})</h2>
              {sentInvoices.map((inv) => (
                <InvoiceCard key={inv.id} invoice={inv} onMarkPaid={() => markAsPaid(inv.id)} statusColors={statusColors} formatCurrency={formatCurrency} formatDate={formatDate} />
              ))}
            </div>
          )}

          {/* Draft */}
          {draftInvoices.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-muted-foreground">Draft ({draftInvoices.length})</h2>
              {draftInvoices.map((inv) => (
                <InvoiceCard key={inv.id} invoice={inv} onMarkPaid={() => markAsPaid(inv.id)} statusColors={statusColors} formatCurrency={formatCurrency} formatDate={formatDate} />
              ))}
            </div>
          )}

          {/* Paid */}
          {paidInvoices.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-green">Paid ({paidInvoices.length})</h2>
              {paidInvoices.map((inv) => (
                <InvoiceCard key={inv.id} invoice={inv} statusColors={statusColors} formatCurrency={formatCurrency} formatDate={formatDate} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InvoiceCard({
  invoice,
  onMarkPaid,
  statusColors,
  formatCurrency,
  formatDate
}: {
  invoice: Invoice
  onMarkPaid?: () => void
  statusColors: Record<string, string>
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
}) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-medium text-lg">{invoice.client?.name}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[invoice.status]}`}>
                {invoice.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {invoice.invoice_number} • Due: {formatDate(invoice.due_date)}
            </p>
            {invoice.description && (
              <p className="text-sm text-muted-foreground mt-1">{invoice.description}</p>
            )}
          </div>
          <div className="text-right flex items-center gap-4">
            <span className="text-xl font-bold">{formatCurrency(invoice.amount_ils || 0)}</span>
            {onMarkPaid && invoice.status !== 'Paid' && (
              <Button size="sm" variant="outline" onClick={onMarkPaid} className="border-green text-green hover:bg-green/10">
                <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
