'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Coins,
  FileText,
  Users,
  Scale,
  BarChart3,
  Settings,
  LogOut,
  Sun,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { YearSelector } from './year-selector'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: Coins },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Partners', href: '/partners', icon: Scale },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Configuration', href: '/configuration', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Determine partner color based on email
  const isHeli = user?.email === 'heli@automationsflow.com'
  const partnerColor = isHeli ? 'heli' : 'shahar'
  const initials = user?.email?.charAt(0).toUpperCase() || 'U'
  const displayName = isHeli ? 'Heli' : user?.email === 'shahar@automationsflow.com' ? 'Shahar' : 'User'

  return (
    <aside className="w-[260px] h-screen bg-background-secondary border-r border-border flex flex-col">
      {/* Header with Logo */}
      <div className="p-6 flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Sunny"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <span className="text-xl font-semibold">Sunny</span>
      </div>

      {/* Year Selector */}
      <div className="px-4 mb-4">
        <YearSelector />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue/10 text-blue'
                      : 'text-muted-foreground hover:text-foreground hover:bg-glass-hover'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Ask Sunny Button */}
      <div className="px-3 mb-2">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-sunny-chat'))}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-yellow/10 to-orange/10 text-yellow hover:from-yellow/20 hover:to-orange/20 transition-all border border-yellow/20"
        >
          <Sun className="w-5 h-5" />
          Ask Sunny
        </button>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback
              className={cn(
                'text-sm',
                partnerColor === 'heli'
                  ? 'bg-heli/20 text-heli'
                  : 'bg-shahar/20 text-shahar'
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'Loading...'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
