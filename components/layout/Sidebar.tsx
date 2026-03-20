'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Asterisk, LayoutDashboard, ArrowLeftRight, BarChart2, Settings, LogOut, ArrowRight } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; avatar_url: string | null } | null>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Fetch profile
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-[260px] bg-[#0D1B2E] border-r border-[rgba(255,255,255,0.06)] flex-col p-[24px_16px] z-40">
      
      {/* Header */}
      <div className="flex items-center gap-[8px] mb-[40px] px-[8px]">
        <Asterisk size={22} color="#6A42E3" />
        <span className="font-['Plus_Jakarta_Sans'] text-[18px] font-[800] text-white">Spendly</span>
      </div>

      {/* Nav Section Label */}
      <div className="text-[10px] text-[#6B7280] tracking-[0.1em] px-[8px] mb-[8px]">MENU</div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-[4px]">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.path)
          const Icon = item.icon
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-[12px] p-[11px_12px] rounded-[12px] cursor-pointer transition-all duration-150 ${
                isActive 
                  ? 'bg-[rgba(106,66,227,0.15)] border-[1px_solid_rgba(106,66,227,0.2)]' 
                  : 'bg-transparent border-[1px_solid_transparent] hover:bg-[rgba(255,255,255,0.04)] group'
              }`}
            >
              <Icon size={18} color={isActive ? '#6A42E3' : '#6B7280'} className={!isActive ? 'group-hover:text-white' : ''} />
              <span className={`text-[14px] ${isActive ? 'text-[#FFFFFF] font-[600]' : 'text-[#6B7280] font-[500] group-hover:text-white'}`}>
                {item.name}
              </span>
              {isActive && (
                <ArrowRight size={14} color="#6A42E3" className="ml-auto" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="h-[1px] bg-[rgba(255,255,255,0.06)] m-[16px_8px]"></div>

      {/* Bottom Profile */}
      <div className="mt-auto">
        <div className="bg-[rgba(255,255,255,0.04)] border-[1px_solid_rgba(255,255,255,0.08)] rounded-[12px] p-[12px] flex items-center gap-[10px]">
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} alt="Profile" className="w-[36px] h-[36px] items-center justify-center flex rounded-full shrink-0 object-cover" />
          ) : (
            <div className="w-[36px] h-[36px] items-center justify-center flex rounded-full font-bold text-white text-[14px] shrink-0" style={{ background: 'linear-gradient(135deg, #6A42E3, #42E3D0)' }}>
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-[13px] font-[600] text-white truncate">{userProfile?.name || 'User'}</span>
            <span className="text-[11px] text-[#6B7280] truncate">{userProfile?.email || '...'}</span>
          </div>
          <LogOut 
            size={16} 
            className="text-[#6B7280] ml-auto cursor-pointer hover:text-[#F86161] transition-colors shrink-0" 
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>
  )
}
