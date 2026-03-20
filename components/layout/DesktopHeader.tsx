'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Search, Bell, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DesktopHeader() {
  const pathname = usePathname()
  const supabase = createClient()
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; avatar_url: string | null } | null>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('id', session.user.id)
          .single()

        setUserProfile({
          name: profile?.name || 'User',
          email: session.user.email || '',
          avatar_url: profile?.avatar_url || null
        })
      }
    }
    loadUser()
  }, [])

  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return 'Overview'
    if (pathname.includes('/transactions')) return 'Transactions'
    if (pathname.includes('/analytics')) return 'Analytics'
    if (pathname.includes('/settings')) return 'Settings'
    return ''
  }

  return (
    <div className="hidden lg:flex fixed top-0 left-[260px] right-0 h-[64px] bg-[rgba(9,20,40,0.85)] border-b border-[rgba(255,255,255,0.06)] backdrop-blur-[20px] z-30 items-center justify-between px-[32px]">
      
      {/* Left side dynamic title */}
      <h1 className="text-[18px] font-bold text-[#FFFFFF]">
        {getPageTitle()}
      </h1>

      {/* Right side icons and profile */}
      <div className="flex items-center gap-[16px]">
        <button className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-[#6B7280] hover:text-white transition-colors cursor-pointer">
          <Search size={18} />
        </button>
        <button className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-[#6B7280] hover:text-white transition-colors cursor-pointer">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-[10px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-full p-[6px_14px_6px_6px] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors">
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} alt="Profile" className="w-[30px] h-[30px] rounded-full shrink-0 object-cover" />
          ) : (
            <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #6A42E3, #42E3D0)' }}>
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <span className="text-[13px] font-semibold text-white">
            {userProfile?.name || 'User'}
          </span>
          <ChevronDown size={14} color="#6B7280" className="ml-[4px]" />
        </div>
      </div>
    </div>
  )
}
