'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, AlertCircle, FileText, DollarSign, Percent, Users } from 'lucide-react'

interface DashboardData {
  totalIncome: number
  cogs: number
  opex: number
  financial: number
  totalExpenses: number
  grossProfit: number
  grossMargin: number
  netProfit: number
  partners: {
    heli: { earnings: number; withdrawals: number; available: number }
    shahar: { earnings: number; withdrawals: number; available: number }
  }
  partnerDifference: number
  openInvoices: {
    count: number
    total: number
    overdueCount: number
    overdueTotal: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/dashboard?year=2026')
      const json = await res.json()
      setData(json.data)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    }
    setLoading(false)
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="glass-card p-8 text-center text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const partnerDiffText = data?.partnerDifference === 0
    ? 'Even'
    : data?.partnerDifference && data.partnerDifference > 0
      ? `Heli +${formatCurrency(Math.abs(data.partnerDifference))}`
      : `Shahar +${formatCurrency(Math.abs(data?.partnerDifference || 0))}`

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Income"
          value={formatCurrency(data?.totalIncome || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="text-green"
        />
        <StatsCard
          title="COGS"
          value={formatCurrency(data?.cogs || 0)}
          icon={<TrendingDown className="w-5 h-5" />}
          iconColor="text-red"
        />
        <StatsCard
          title="OPEX"
          value={formatCurrency(data?.opex || 0)}
          icon={<TrendingDown className="w-5 h-5" />}
          iconColor="text-cyan"
        />
        <StatsCard
          title="Gross Margin"
          value={`${(data?.grossMargin || 0).toFixed(1)}%`}
          icon={<Percent className="w-5 h-5" />}
          iconColor="text-purple"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Net Profit"
          value={formatCurrency(data?.netProfit || 0)}
          valueColor={data?.netProfit && data.netProfit >= 0 ? 'text-green' : 'text-red'}
          icon={data?.netProfit && data.netProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          iconColor={data?.netProfit && data.netProfit >= 0 ? 'text-green' : 'text-red'}
        />
        <StatsCard
          title="Partner Balance"
          value={partnerDiffText}
          icon={<Users className="w-5 h-5" />}
          iconColor="text-blue"
        />

        {/* Open Invoices Card */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Invoices
              </CardTitle>
              <FileText className="w-5 h-5 text-blue" />
            </div>
          </CardHeader>
          <CardContent>
            {data?.openInvoices && data.openInvoices.count > 0 ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {data.openInvoices.count} invoices
                </div>
                <p className="text-sm text-blue">
                  {formatCurrency(data.openInvoices.total)} pending
                </p>
                {data.openInvoices.overdueCount > 0 && (
                  <div className="flex items-center gap-2 text-red text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {data.openInvoices.overdueCount} overdue ({formatCurrency(data.openInvoices.overdueTotal)})
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No open invoices
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Partner Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-heli/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Heli</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Earnings</span>
              <span className="font-medium">{formatCurrency(data?.partners.heli.earnings || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Withdrawn</span>
              <span className="font-medium">{formatCurrency(data?.partners.heli.withdrawals || 0)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="text-muted-foreground">Available</span>
              <span className={`text-xl font-bold ${(data?.partners.heli.available || 0) >= 0 ? 'text-green' : 'text-red'}`}>
                {formatCurrency(data?.partners.heli.available || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-shahar/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Shahar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Earnings</span>
              <span className="font-medium">{formatCurrency(data?.partners.shahar.earnings || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Withdrawn</span>
              <span className="font-medium">{formatCurrency(data?.partners.shahar.withdrawals || 0)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="text-muted-foreground">Available</span>
              <span className={`text-xl font-bold ${(data?.partners.shahar.available || 0) >= 0 ? 'text-green' : 'text-red'}`}>
                {formatCurrency(data?.partners.shahar.available || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  valueColor,
  icon,
  iconColor = 'text-muted-foreground'
}: {
  title: string
  value: string
  valueColor?: string
  icon?: React.ReactNode
  iconColor?: string
}) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && <div className={iconColor}>{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor || ''}`}>{value}</div>
      </CardContent>
    </Card>
  )
}
