'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Category, Account, LineOfBusiness, Partner } from '@/types'

// Category tag colors
const parentCategoryColors: Record<string, string> = {
  COGS: '#ff3b30',
  OPEX: '#30b0c7',
  Financial: '#bf5af2',
  Mixed: '#ff9500',
}

export default function ConfigurationPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [lobs, setLobs] = useState<LineOfBusiness[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  // Add Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [lobDialogOpen, setLobDialogOpen] = useState(false)

  // Edit Dialog states
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false)
  const [editAccountDialogOpen, setEditAccountDialogOpen] = useState(false)
  const [editLobDialogOpen, setEditLobDialogOpen] = useState(false)

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'account' | 'lob'; id: string; name: string } | null>(null)

  // Form states for adding
  const [categoryForm, setCategoryForm] = useState({ name: '', parent_category: 'OPEX', tax_recognition_percent: '100', description: '' })
  const [accountForm, setAccountForm] = useState({ name: '', type: 'Business_Credit', partner_id: '' })
  const [lobForm, setLobForm] = useState({ name: '' })

  // Form states for editing
  const [editCategoryForm, setEditCategoryForm] = useState<{ id: string; name: string; parent_category: string; tax_recognition_percent: string; description: string }>({ id: '', name: '', parent_category: 'OPEX', tax_recognition_percent: '100', description: '' })
  const [editAccountForm, setEditAccountForm] = useState<{ id: string; name: string; type: string; partner_id: string }>({ id: '', name: '', type: 'Business_Credit', partner_id: '' })
  const [editLobForm, setEditLobForm] = useState<{ id: string; name: string }>({ id: '', name: '' })

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

  // ADD handlers
  async function handleAddCategory() {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          parent_category: categoryForm.parent_category,
          tax_recognition_percent: parseFloat(categoryForm.tax_recognition_percent) / 100,
          description: categoryForm.description || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to add category')
      toast.success('Category added')
      setCategoryDialogOpen(false)
      setCategoryForm({ name: '', parent_category: 'OPEX', tax_recognition_percent: '100', description: '' })
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

  // EDIT handlers
  function openEditCategory(cat: Category) {
    setEditCategoryForm({
      id: cat.id,
      name: cat.name,
      parent_category: cat.parent_category,
      tax_recognition_percent: String(Math.round(cat.tax_recognition_percent * 100)),
      description: cat.description || '',
    })
    setEditCategoryDialogOpen(true)
  }

  function openEditAccount(acc: Account) {
    setEditAccountForm({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      partner_id: acc.partner_id || '',
    })
    setEditAccountDialogOpen(true)
  }

  function openEditLob(lob: LineOfBusiness) {
    setEditLobForm({
      id: lob.id,
      name: lob.name,
    })
    setEditLobDialogOpen(true)
  }

  async function handleEditCategory() {
    try {
      const res = await fetch(`/api/categories/${editCategoryForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editCategoryForm.name,
          parent_category: editCategoryForm.parent_category,
          tax_recognition_percent: parseFloat(editCategoryForm.tax_recognition_percent) / 100,
          description: editCategoryForm.description || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to update category')
      toast.success('Category updated')
      setEditCategoryDialogOpen(false)
      fetchData()
    } catch {
      toast.error('Failed to update category')
    }
  }

  async function handleEditAccount() {
    try {
      const res = await fetch(`/api/accounts/${editAccountForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editAccountForm.name,
          type: editAccountForm.type,
          partner_id: editAccountForm.partner_id || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to update account')
      toast.success('Account updated')
      setEditAccountDialogOpen(false)
      fetchData()
    } catch {
      toast.error('Failed to update account')
    }
  }

  async function handleEditLob() {
    try {
      const res = await fetch(`/api/lob/${editLobForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editLobForm.name }),
      })
      if (!res.ok) throw new Error('Failed to update LOB')
      toast.success('Line of Business updated')
      setEditLobDialogOpen(false)
      fetchData()
    } catch {
      toast.error('Failed to update Line of Business')
    }
  }

  // DELETE handlers
  function openDeleteDialog(type: 'category' | 'account' | 'lob', id: string, name: string) {
    setDeleteTarget({ type, id, name })
    setDeleteDialogOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return

    const endpoints = {
      category: '/api/categories',
      account: '/api/accounts',
      lob: '/api/lob',
    }

    try {
      const res = await fetch(`${endpoints[deleteTarget.type]}/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success(`${deleteTarget.type === 'lob' ? 'Line of Business' : deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} deleted`)
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      fetchData()
    } catch {
      toast.error('Failed to delete')
    }
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
                        <SelectItem value="Mixed">Mixed</SelectItem>
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
                  <div className="space-y-2">
                    <Label>Description (Hebrew)</Label>
                    <Input
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="תיאור הקטגוריה"
                      dir="rtl"
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tax %</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium">{cat.name}</td>
                      <td className="p-4 max-w-xs">
                        <span className="text-sm text-muted-foreground whitespace-pre-wrap break-words" dir="rtl">
                          {cat.description || '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: parentCategoryColors[cat.parent_category] || '#666' }}
                        >
                          {cat.parent_category}
                        </span>
                      </td>
                      <td className="p-4">{Math.round(cat.tax_recognition_percent * 100)}%</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditCategory(cat)}
                            className="p-2 hover:bg-white/10 rounded-md transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground hover:text-white" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog('category', cat.id, cat.name)}
                            className="p-2 hover:bg-red/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red" />
                          </button>
                        </div>
                      </td>
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
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">{acc.name}</td>
                      <td className="p-4">{acc.type.replace(/_/g, ' ')}</td>
                      <td className="p-4">{acc.partner?.name || '-'}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditAccount(acc)}
                            className="p-2 hover:bg-white/10 rounded-md transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground hover:text-white" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog('account', acc.id, acc.name)}
                            className="p-2 hover:bg-red/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red" />
                          </button>
                        </div>
                      </td>
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
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lobs.map((lob) => (
                    <tr key={lob.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">{lob.name}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditLob(lob)}
                            className="p-2 hover:bg-white/10 rounded-md transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground hover:text-white" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog('lob', lob.id, lob.name)}
                            className="p-2 hover:bg-red/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Category Dialog */}
      <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editCategoryForm.name}
                onChange={(e) => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <Select value={editCategoryForm.parent_category} onValueChange={(v) => setEditCategoryForm({ ...editCategoryForm, parent_category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COGS">COGS</SelectItem>
                  <SelectItem value="OPEX">OPEX</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tax Recognition %</Label>
              <Input
                type="number"
                value={editCategoryForm.tax_recognition_percent}
                onChange={(e) => setEditCategoryForm({ ...editCategoryForm, tax_recognition_percent: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Hebrew)</Label>
              <Input
                value={editCategoryForm.description}
                onChange={(e) => setEditCategoryForm({ ...editCategoryForm, description: e.target.value })}
                dir="rtl"
              />
            </div>
            <Button onClick={handleEditCategory} className="w-full bg-blue hover:bg-blue/90">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editAccountDialogOpen} onOpenChange={setEditAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editAccountForm.name}
                onChange={(e) => setEditAccountForm({ ...editAccountForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={editAccountForm.type} onValueChange={(v) => setEditAccountForm({ ...editAccountForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business_Credit">Business Credit Card</SelectItem>
                  <SelectItem value="Private_Credit">Private Credit Card</SelectItem>
                  <SelectItem value="Bank_Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editAccountForm.type === 'Private_Credit' && (
              <div className="space-y-2">
                <Label>Partner</Label>
                <Select value={editAccountForm.partner_id} onValueChange={(v) => setEditAccountForm({ ...editAccountForm, partner_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
                  <SelectContent>
                    {partners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleEditAccount} className="w-full bg-blue hover:bg-blue/90">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit LOB Dialog */}
      <Dialog open={editLobDialogOpen} onOpenChange={setEditLobDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Line of Business</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editLobForm.name}
                onChange={(e) => setEditLobForm({ ...editLobForm, name: e.target.value })}
              />
            </div>
            <Button onClick={handleEditLob} className="w-full bg-blue hover:bg-blue/90">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red hover:bg-red/90">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
