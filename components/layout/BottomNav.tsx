'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, BarChart2, Settings } from 'lucide-react'

export default React.memo(function BottomNav() {
  const pathname = usePathname()

  const tabs = useMemo(() => [
    { name: 'Home', icon: LayoutDashboard, route: '/dashboard' },
    { name: 'Transactions', icon: ArrowLeftRight, route: '/transactions' },
    { name: 'Analytics', icon: BarChart2, route: '/analytics' },
    { name: 'Settings', icon: Settings, route: '/settings' },
  ], [])

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 h-[64px] pb-[env(safe-area-inset-bottom)]"
      style={{
        background: 'rgba(15, 15, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="flex items-center justify-around h-full max-w-[430px] mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.route)
          const color = isActive ? '#6A42E3' : '#6B7280'
          
          return (
            <Link 
              key={tab.name} 
              href={tab.route} 
              className="flex flex-col items-center justify-center py-2 px-4 rounded-[12px] transition-all duration-150 ease-out gap-1"
              style={{
                backgroundColor: isActive ? 'rgba(106, 66, 227, 0.1)' : 'transparent'
              }}
            >
              <tab.icon 
                size={20} 
                color={color} 
                style={{
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(106,66,227,0.6))' : 'none'
                }}
              />
              <span className="text-[10px] font-medium" style={{ color }}>{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
})
