'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Banknote, CreditCard, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import type { Withdrawal, Partner } from '@/types'

const WITHDRAWAL_METHODS = ['Bank_Transfer', 'Cash', 'Check'] as const

interface PartnerData {
  earnings: number
  withdrawals: number
  available: number
  id?: string
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [partnerData, setPartnerData] = useState<{ heli: PartnerData; shahar: PartnerData } | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [form, setForm] = useState({
    partner_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Bank_Transfer',
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [dashRes, withdrawRes, partnerRes] = await Promise.all([
        fetch('/api/dashboard?year=2026'),
        fetch('/api/withdrawals?year=2026'),
        fetch('/api/partners'),
      ])
      const [dashData, withdrawData, partnerList] = await Promise.all([
        dashRes.json(),
        withdrawRes.json(),
        partnerRes.json(),
      ])
      setPartnerData(dashData.data?.partners)
      setWithdrawals(withdrawData.data || [])
      setPartners(partnerList.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  async function handleAddWithdrawal() {
    if (!form.partner_id || !form.amount) {
      toast.error('Please select a partner and enter an amount')
      return
    }
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: form.partner_id,
          amount: parseFloat(form.amount),
          date: form.date,
          method: form.method,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to add withdrawal')
      toast.success('Withdrawal recorded')
      setDialogOpen(false)
      setForm({
        partner_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Bank_Transfer',
        notes: '',
      })
      fetchData()
    } catch {
      toast.error('Failed to record withdrawal')
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const methodIcons: Record<string, React.ReactNode> = {
    Bank_Transfer: <Banknote className="w-4 h-4" />,
    Cash: <Wallet className="w-4 h-4" />,
    Check: <CreditCard className="w-4 h-4" />,
  }

  const heliPartner = partners.find(p => p.name === 'Heli')
  const shaharPartner = partners.find(p => p.name === 'Shahar')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Partner Balance & Withdrawals</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue hover:bg-blue/90">
              <Plus className="w-4 h-4 mr-2" />
              Record Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Withdrawal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Partner *</Label>
                <Select value={form.partner_id} onValueChange={(v) => setForm({ ...form, partner_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
                  <SelectContent>
                    {heliPartner && (
                      <SelectItem value={heliPartner.id}>
                        <span>Heli</span>
                        <span className="text-muted-foreground ml-2">
                          (Available: {formatCurrency(partnerData?.heli.available || 0)})
                        </span>
                      </SelectItem>
                    )}
                    {shaharPartner && (
                      <SelectItem value={shaharPartner.id}>
                        <span>Shahar</span>
                        <span className="text-muted-foreground ml-2">
                          (Available: {formatCurrency(partnerData?.shahar.available || 0)})
                        </span>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
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
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WITHDRAWAL_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        <div className="flex items-center gap-2">
                          {methodIcons[m]}
                          {m.replace('_', ' ')}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
              <Button onClick={handleAddWithdrawal} className="w-full bg-blue hover:bg-blue/90">
                Record Withdrawal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PartnerCard
          name="Heli"
          color="heli"
          data={partnerData?.heli}
          loading={loading}
          formatCurrency={formatCurrency}
        />
        <PartnerCard
          name="Shahar"
          color="shahar"
          data={partnerData?.shahar}
          loading={loading}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Withdrawal History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Withdrawal History</h2>
        {loading ? (
          <div className="glass-card p-8 text-center text-muted-foreground">Loading...</div>
        ) : withdrawals.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            No withdrawals recorded yet.
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Partner</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Method</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Notes</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b border-border/50">
                    <td className="p-4">
                      <span className="font-medium">
                        {w.partner?.name}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{formatDate(w.date)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {methodIcons[w.method]}
                        {w.method.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{w.notes || '-'}</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(w.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function PartnerCard({
  name,
  color,
  data,
  loading,
  formatCurrency
}: {
  name: string
  color: 'heli' | 'shahar'
  data?: PartnerData
  loading: boolean
  formatCurrency: (amount: number) => string
}) {
  const borderClass = color === 'heli' ? 'border-heli/30' : 'border-shahar/30'

  return (
    <Card className={`glass-card ${borderClass}`}>
      <CardHeader>
        <CardTitle className="text-xl">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Earnings</span>
                <span>{formatCurrency(data?.earnings || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Withdrawn</span>
                <span>{formatCurrency(data?.withdrawals || 0)}</span>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Available to Withdraw
              </p>
              <p className={`text-3xl font-bold ${(data?.available || 0) >= 0 ? 'text-green' : 'text-red'}`}>
                {formatCurrency(data?.available || 0)}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
