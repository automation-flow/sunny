'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Building2, Briefcase, ShoppingBag, Scale, Cpu, Megaphone, Heart, Landmark, GraduationCap, Building } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Icon map for dynamic lookup
const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase, ShoppingBag, Scale, Cpu, Megaphone, Heart, Landmark, GraduationCap, Building, Building2
}

// Get icon component by name
function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Briefcase
}
import { toast } from 'sonner'
import type { Client, LineOfBusiness } from '@/types'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [lobs, setLobs] = useState<LineOfBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: '', contact_info: '', lob_id: '', status: 'Active' })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [clientRes, lobRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/lob'),
      ])
      const [clientData, lobData] = await Promise.all([
        clientRes.json(),
        lobRes.json(),
      ])
      setClients(clientData.data || [])
      setLobs(lobData.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  async function handleAddClient() {
    if (!form.name) {
      toast.error('Client name is required')
      return
    }
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          contact_info: form.contact_info || null,
          lob_id: form.lob_id || null,
          status: form.status,
        }),
      })
      if (!res.ok) throw new Error('Failed to add client')
      toast.success('Client added')
      setDialogOpen(false)
      setForm({ name: '', contact_info: '', lob_id: '', status: 'Active' })
      fetchData()
    } catch {
      toast.error('Failed to add client')
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue hover:bg-blue/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Info</Label>
                <Input
                  value={form.contact_info}
                  onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                  placeholder="Email or phone"
                />
              </div>
              <div className="space-y-2">
                <Label>Line of Business</Label>
                <Select value={form.lob_id} onValueChange={(v) => setForm({ ...form, lob_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select LOB" /></SelectTrigger>
                  <SelectContent>
                    {lobs.map((lob) => (
                      <SelectItem key={lob.id} value={lob.id}>{lob.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddClient} className="w-full bg-blue hover:bg-blue/90">Add Client</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No clients yet. Add one to get started.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contact</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">LOB</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Invoiced</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Paid</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-border/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue/20 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue" />
                      </div>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{client.contact_info || '-'}</td>
                  <td className="p-4">
                    {client.lob ? (() => {
                      const lobColor = client.lob.icon_color || '#bf5af2'
                      const IconComponent = getIconComponent(client.lob.icon || 'Briefcase')
                      return (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${lobColor}20` }}
                          >
                            <IconComponent className="w-3 h-3" style={{ color: lobColor }} />
                          </div>
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ backgroundColor: `${lobColor}20`, color: lobColor }}
                          >
                            {client.lob.name}
                          </span>
                        </div>
                      )
                    })() : '-'}
                  </td>
                  <td className="p-4 text-right">{formatCurrency(client.stats?.total_invoiced || 0)}</td>
                  <td className="p-4 text-right text-green">{formatCurrency(client.stats?.total_paid || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
