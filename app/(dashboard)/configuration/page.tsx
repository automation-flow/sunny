'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Category, Account, LineOfBusiness, Partner } from '@/types'

export default function ConfigurationPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [lobs, setLobs] = useState<LineOfBusiness[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [lobDialogOpen, setLobDialogOpen] = useState(false)

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', parent_category: 'OPEX', tax_recognition_percent: '100' })
  const [accountForm, setAccountForm] = useState({ name: '', type: 'Business_Credit', partner_id: '' })
  const [lobForm, setLobForm] = useState({ name: '' })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [catRes, accRes, lobRes, partnerRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/accounts'),
        fetch('/api/lob'),
        fetch('/api/partners'),
      ])
      const [catData, accData, lobData, partnerData] = await Promise.all([
        catRes.json(),
        accRes.json(),
        lobRes.json(),
        partnerRes.json(),
      ])
      setCategories(catData.data || [])
      setAccounts(accData.data || [])
      setLobs(lobData.data || [])
      setPartners(partnerData.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  async function handleAddCategory() {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          parent_category: categoryForm.parent_category,
          tax_recognition_percent: parseFloat(categoryForm.tax_recognition_percent) / 100,
        }),
      })
      if (!res.ok) throw new Error('Failed to add category')
      toast.success('Category added')
      setCategoryDialogOpen(false)
      setCategoryForm({ name: '', parent_category: 'OPEX', tax_recognition_percent: '100' })
      fetchData()
    } catch {
      toast.error('Failed to add category')
    }
  }

  async function handleAddAccount() {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accountForm.name,
          type: accountForm.type,
          partner_id: accountForm.partner_id || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to add account')
      toast.success('Account added')
      setAccountDialogOpen(false)
      setAccountForm({ name: '', type: 'Business_Credit', partner_id: '' })
      fetchData()
    } catch {
      toast.error('Failed to add account')
    }
  }

  async function handleAddLob() {
    try {
      const res = await fetch('/api/lob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: lobForm.name }),
      })
      if (!res.ok) throw new Error('Failed to add LOB')
      toast.success('Line of Business added')
      setLobDialogOpen(false)
      setLobForm({ name: '' })
      fetchData()
    } catch {
      toast.error('Failed to add Line of Business')
    }
  }

  const parentCategoryColors: Record<string, string> = {
    COGS: 'bg-red/20 text-red',
    OPEX: 'bg-cyan/20 text-cyan',
    Financial: 'bg-purple/20 text-purple',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Configuration</h1>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="bg-background-secondary">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="lob">Lines of Business</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Expense Categories</h2>
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue hover:bg-blue/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="e.g., Software Licenses"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Category</Label>
                    <Select value={categoryForm.parent_category} onValueChange={(v) => setCategoryForm({ ...categoryForm, parent_category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COGS">COGS</SelectItem>
                        <SelectItem value="OPEX">OPEX</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Recognition %</Label>
                    <Input
                      type="number"
                      value={categoryForm.tax_recognition_percent}
                      onChange={(e) => setCategoryForm({ ...categoryForm, tax_recognition_percent: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <Button onClick={handleAddCategory} className="w-full bg-blue hover:bg-blue/90">Add Category</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No categories yet. Add one to get started.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tax %</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-border/50">
                      <td className="p-4">{cat.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${parentCategoryColors[cat.parent_category]}`}>
                          {cat.parent_category}
                        </span>
                      </td>
                      <td className="p-4">{Math.round(cat.tax_recognition_percent * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Payment Accounts</h2>
            <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue hover:bg-blue/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                      placeholder="e.g., Business Bank Account"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={accountForm.type} onValueChange={(v) => setAccountForm({ ...accountForm, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Business_Credit">Business Credit Card</SelectItem>
                        <SelectItem value="Private_Credit">Private Credit Card</SelectItem>
                        <SelectItem value="Bank_Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {accountForm.type === 'Private_Credit' && (
                    <div className="space-y-2">
                      <Label>Partner</Label>
                      <Select value={accountForm.partner_id} onValueChange={(v) => setAccountForm({ ...accountForm, partner_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
                        <SelectContent>
                          {partners.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button onClick={handleAddAccount} className="w-full bg-blue hover:bg-blue/90">Add Account</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : accounts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No accounts yet. Add one to get started.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Partner</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="border-b border-border/50">
                      <td className="p-4">{acc.name}</td>
                      <td className="p-4">{acc.type.replace(/_/g, ' ')}</td>
                      <td className="p-4">{acc.partner?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* LOB Tab */}
        <TabsContent value="lob" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Lines of Business</h2>
            <Dialog open={lobDialogOpen} onOpenChange={setLobDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue hover:bg-blue/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add LOB
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Line of Business</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={lobForm.name}
                      onChange={(e) => setLobForm({ ...lobForm, name: e.target.value })}
                      placeholder="e.g., High-Tech"
                    />
                  </div>
                  <Button onClick={handleAddLob} className="w-full bg-blue hover:bg-blue/90">Add Line of Business</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : lobs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No lines of business yet. Add one to get started.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {lobs.map((lob) => (
                    <tr key={lob.id} className="border-b border-border/50">
                      <td className="p-4">{lob.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
