'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell } from 'lucide-react'

interface PageHeaderProps {
  title: string
  showBack?: boolean
}
import React from 'react'

export default React.memo(function PageHeader({ title, showBack = false }: PageHeaderProps) {
  const router = useRouter()

  return (
    <header className="flex items-center justify-between pt-[20px] px-[20px] pb-[16px] max-w-[430px] mx-auto w-full">
      <div className="flex items-center">
        {showBack && (
          <button 
            onClick={() => router.back()}
            className="rounded-full p-[6px] mr-[12px] transition-colors cursor-pointer group"
            style={{ background: 'rgba(255, 255, 255, 0.08)' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            aria-label="Go back"
            type="button"
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </button>
        )}
        <h1 className="text-white font-bold text-[22px] tracking-tight">{title}</h1>
      </div>
      <button 
        className="rounded-full p-[8px] transition-colors cursor-pointer flex-shrink-0 group"
        style={{ background: 'rgba(255, 255, 255, 0.08)' }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
        aria-label="Notifications"
        type="button"
      >
        <Bell size={22} color="#6B7280" className="group-hover:text-white transition-colors" />
      </button>
    </header>
  )
})
