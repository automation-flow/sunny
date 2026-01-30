'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'

interface AnalyticsData {
  monthlyData: Array<{ month: string; income: number; expenses: number; profit: number }>
  categoryData: Array<{ name: string; value: number }>
  parentCategoryData: Array<{ name: string; value: number; color: string }>
  clientData: Array<{ name: string; value: number }>
  summary: {
    totalIncome: number
    totalExpenses: number
    netProfit: number
    avgMonthlyIncome: number
    avgMonthlyExpenses: number
  }
}

const COLORS = ['#3BB4D8', '#10B981', '#A855F7', '#F59E0B', '#FF5B5B', '#6366F1', '#EC4899', '#14B8A6']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    try {
      const res = await fetch('/api/analytics?year=2026')
      const json = await res.json()
      setData(json.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
    setLoading(false)
  }

  function formatCurrency(value: number | undefined) {
    if (value === undefined) return ''
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(value)
  }

  function formatShortCurrency(value: number) {
    if (value >= 1000) {
      return `₪${(value / 1000).toFixed(0)}K`
    }
    return `₪${value}`
  }

  const tooltipFormatter = (value: number | string | (string | number)[] | undefined) => {
    if (typeof value === 'number') return formatCurrency(value)
    if (value === undefined) return ''
    return String(value)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="glass-card p-8 text-center text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!data || (data.summary.totalIncome === 0 && data.summary.totalExpenses === 0)) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">
            Analytics will be available once you have financial data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-green/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green">{formatCurrency(data.summary.totalIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatCurrency(data.summary.avgMonthlyIncome)}/mo
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-red/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red">{formatCurrency(data.summary.totalExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatCurrency(data.summary.avgMonthlyExpenses)}/mo
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-blue/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${data.summary.netProfit >= 0 ? 'text-green' : 'text-red'}`}>
              {formatCurrency(data.summary.netProfit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Margin: {data.summary.totalIncome > 0 ? ((data.summary.netProfit / data.summary.totalIncome) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Income vs Expenses */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Monthly Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} tickFormatter={formatShortCurrency} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                  formatter={tooltipFormatter}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#FF5B5B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Profit Trend */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Profit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} tickFormatter={formatShortCurrency} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                  formatter={tooltipFormatter}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit"
                  stroke="#3BB4D8"
                  strokeWidth={2}
                  dot={{ fill: '#3BB4D8', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses by Type */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Expenses by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.parentCategoryData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.parentCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                    formatter={tooltipFormatter}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {data.parentCategoryData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Top Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data.categoryData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#888" fontSize={12} tickFormatter={formatShortCurrency} />
                  <YAxis type="category" dataKey="name" stroke="#888" fontSize={11} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                    formatter={tooltipFormatter}
                  />
                  <Bar dataKey="value" fill="#3BB4D8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income by Client */}
      {data.clientData.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Income by Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.clientData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.clientData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                    formatter={tooltipFormatter}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {data.clientData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
