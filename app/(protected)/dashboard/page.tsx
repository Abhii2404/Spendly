'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { useDashboardData, Transaction } from '@/hooks/useDashboardData'
import { useRefetch } from '@/context/RefetchContext'
import { formatAmount } from '@/lib/utils'

function getGreeting(name: string) {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name}! 👋`
  if (hour < 17) return `Good afternoon, ${name}! 👋`
  return `Good evening, ${name}! 👋`
}

function IconByName({ name, color, size = 20, className = "" }: { name: string, color?: string, size?: number, className?: string }) {
  const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle
  return <Icon color={color} size={size} className={className} />
}

export default function DashboardPage() {
  const {
    totalIncome,
    totalExpense,
    netBalance,
    incomeChange,
    expenseChange,
    recentTransactions,
    recurringTransactions,
    budgetProgress,
    isLoading,
    error,
    userName,
    refetch
  } = useDashboardData()

  const { setRefetchDashboard } = useRefetch()

  useEffect(() => {
    setRefetchDashboard(refetch)
  }, [refetch, setRefetchDashboard])

  const [activeTab, setActiveTab] = useState<'one-time' | 'recurring'>('one-time')

  const transactionsToShow = activeTab === 'one-time' ? recentTransactions : recurringTransactions

  const formatPercentage = (val: number, isIncomeType: boolean) => {
    // If it's a fallback 100% due to no past data, render 'New' gracefully
    if (val === 1000000) {
      return (
        <div className="inline-flex items-center gap-[3px] rounded-full px-[8px] py-[3px] mt-[8px]" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <span className="text-[11px] font-semibold text-white">New</span>
        </div>
      )
    }
  
    const isPositive = val >= 0
    const color = isPositive ? '#42E3D0' : '#F86161'
    const bg = isPositive ? 'rgba(66, 227, 208, 0.15)' : 'rgba(248, 97, 97, 0.15)'
    const icon = isPositive ? 'ArrowUp' : 'ArrowDown'
    
    return (
      <div className="inline-flex items-center gap-[3px] rounded-full px-[8px] py-[3px] mt-[8px]" style={{ background: bg }}>
        <IconByName name={icon} color={color} size={10} />
        <span className="text-[11px] font-semibold" style={{ color }}>
          {Math.abs(val).toFixed(1)}%
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#091428] pb-[100px] max-w-[430px] mx-auto w-full animate-fade-in-up">
      <PageHeader title="Overview" />
      <div className="px-[20px] flex flex-col">
        
        {error && (
          <div className="flex items-center gap-[12px] p-[16px] rounded-[12px] mb-[16px]" style={{ background: 'rgba(248,97,97,0.08)', border: '1px solid rgba(248,97,97,0.2)' }}>
            <LucideIcons.AlertCircle className="shrink-0 text-[#F86161]" size={20} />
            <div className="text-[#F86161] text-[14px]">Something went wrong. Please refresh and try again.</div>
          </div>
        )}

        {isLoading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-2 gap-[12px] mb-[12px]">
              <div className="h-[120px] rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
              <div className="h-[120px] rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
            </div>
            
            <div className="h-[80px] w-full rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />

            <div className="mt-[24px]">
              <div className="h-[20px] w-[120px] mb-[16px] rounded" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
              <div className="flex flex-col gap-[10px]">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[64px] w-full rounded-[16px]" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
                ))}
              </div>
            </div>

            <div className="mt-[24px]">
              <div className="flex justify-between mb-[16px]">
                <div className="h-[20px] w-[140px] rounded" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
                <div className="h-[20px] w-[40px] rounded" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
              </div>
              <div className="h-[30px] w-[180px] rounded-full mb-[16px]" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
              
              <div className="flex flex-col">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center py-[12px] border-b border-white/5 last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="w-[40px] h-[40px] rounded-[12px] flex-shrink-0" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
                    <div className="ml-[12px] flex-1">
                      <div className="h-[16px] w-[120px] rounded mb-[4px]" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
                      <div className="h-[14px] w-[80px] rounded" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
                    </div>
                    <div className="h-[20px] w-[60px] rounded" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-[8px] mb-[24px]">
              <h2 className="text-white text-[22px] font-extrabold tracking-tight">{getGreeting(userName)}</h2>
              <p className="text-[#6B7280] text-[13px] mt-[4px]">Here's your financial overview</p>
            </div>

            <div className="grid grid-cols-2 gap-[12px] mb-[12px]">
              <div 
                className="rounded-[20px] p-[16px] backdrop-blur-[12px] flex flex-col relative"
                style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div className="text-[11px] font-medium text-[#6B7280] uppercase tracking-[0.05em] mb-[8px]">
                  Income
                </div>
                <div className="text-[24px] font-extrabold text-[#42E3D0] block">
                  {formatAmount(totalIncome)}
                </div>
                <div className="absolute top-[16px] right-[16px] w-[32px] h-[32px] rounded-full flex items-center justify-center" style={{ background: 'rgba(66, 227, 208, 0.15)' }}>
                  <IconByName name="TrendingUp" color="#42E3D0" size={16} />
                </div>
                <div className="self-start">
                  {formatPercentage(incomeChange, true)}
                </div>
              </div>

              <div 
                className="rounded-[20px] p-[16px] backdrop-blur-[12px] flex flex-col relative"
                style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div className="text-[11px] font-medium text-[#6B7280] uppercase tracking-[0.05em] mb-[8px]">
                  Expense
                </div>
                <div className="text-[24px] font-extrabold text-[#F86161] block">
                  {formatAmount(totalExpense)}
                </div>
                <div className="absolute top-[16px] right-[16px] w-[32px] h-[32px] rounded-full flex items-center justify-center" style={{ background: 'rgba(248, 97, 97, 0.15)' }}>
                  <IconByName name="TrendingDown" color="#F86161" size={16} />
                </div>
                <div className="self-start">
                  {formatPercentage(expenseChange, false)}
                </div>
              </div>
            </div>

            <div 
              className="w-full rounded-[20px] mb-[24px] p-[20px] flex items-center justify-between backdrop-blur-[12px]"
              style={{ 
                background: 'rgba(255, 255, 255, 0.04)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: '3px solid #6A42E3',
                borderRadius: '0 20px 20px 0'
              }}
            >
              <div>
                <span className="text-[12px] text-[#6B7280] uppercase tracking-wide block mb-1">Net Balance</span>
                <div className="text-[32px] font-extrabold tracking-tight text-[#FFFFFF]">
                  {formatAmount(netBalance)}
                </div>
              </div>
              <div 
                className="w-[56px] h-[56px] rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(106, 66, 227, 0.15)', border: '1px solid rgba(106, 66, 227, 0.3)' }}
              >
                <IconByName name="Wallet" color="#6A42E3" size={24} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-[16px]">
                <h3 className="text-white font-bold text-[16px] tracking-tight">Budget Overview</h3>
              </div>
              {budgetProgress.length === 0 ? (
                <div className="text-center text-[#6B7280] text-[14px] p-[24px]">
                  No budgets set. Add one in Settings.
                </div>
              ) : (
                <div>
                  {budgetProgress.map((budget, i) => {
                    let barColor = '#42E3D0'
                    if (budget.percentage >= 100) barColor = '#F86161'
                    else if (budget.percentage >= 80) barColor = '#E7BE29'

                    return (
                      <div 
                        key={i} 
                        className="rounded-[16px] p-[14px_16px] mb-[10px]"
                        style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                      >
                        <div className="flex justify-between items-center mb-[10px]">
                          <div className="flex items-center gap-[10px]">
                            <div 
                              className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${budget.categoryColor}26` }}
                            >
                              <IconByName name={budget.categoryIcon} color={budget.categoryColor} size={18} />
                            </div>
                            <span className="text-[14px] font-semibold text-white">{budget.categoryName}</span>
                          </div>
                          <div className="text-[12px]">
                            <span className="text-white">{formatAmount(budget.spent)}</span>
                            <span className="text-[#6B7280]"> / {formatAmount(budget.limit)}</span>
                          </div>
                        </div>

                        <div className="h-[6px] rounded-full overflow-hidden mb-[6px]" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
                          <div 
                            className="h-full rounded-full transition-all duration-[600ms] ease-out"
                            style={{ width: `${Math.min(budget.percentage, 100)}%`, backgroundColor: barColor }}
                          />
                        </div>
                        
                        <div className="text-[11px] text-right" style={{ color: budget.percentage >= 100 ? '#F86161' : barColor }}>
                          {budget.percentage >= 100 ? 'Over Budget' : `${Math.round(budget.percentage)}%`}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="mt-[24px]">
              <div className="flex justify-between items-center mb-[16px]">
                <h3 className="text-white font-bold text-[16px] tracking-tight">Recent Transactions</h3>
                <Link href="/transactions" className="text-[#6A42E3] text-[13px] font-semibold hover:underline">
                  See all
                </Link>
              </div>

              <div className="inline-flex bg-[#1A1A23] rounded-full p-[3px] mb-[16px]">
                <button
                  onClick={() => setActiveTab('one-time')}
                  type="button"
                  className={`px-[16px] py-[6px] text-[13px] font-medium rounded-full transition-all duration-200 ease-in ${
                    activeTab === 'one-time' ? 'bg-[#6A42E3] text-white' : 'bg-transparent text-[#6B7280]'
                  }`}
                >
                  One-Time
                </button>
                <button
                  onClick={() => setActiveTab('recurring')}
                  type="button"
                  className={`px-[16px] py-[6px] text-[13px] font-medium rounded-full transition-all duration-200 ease-in ${
                    activeTab === 'recurring' ? 'bg-[#6A42E3] text-white' : 'bg-transparent text-[#6B7280]'
                  }`}
                >
                  Recurring
                </button>
              </div>

              {transactionsToShow.length === 0 ? (
                <div className="text-center text-[#6B7280] text-[14px] py-[32px]">
                  No transactions yet. Tap + to add one.
                </div>
              ) : (
                <div className="flex flex-col">
                  {transactionsToShow.map((txn: Transaction, index: number) => {
                    const isIncome = txn.type === 'income'
                    const amountColor = isIncome ? '#42E3D0' : '#F86161'
                    const prefix = isIncome ? '+' : '-'
                    const isLast = index === transactionsToShow.length - 1

                    return (
                      <div 
                        key={txn.id} 
                        className="flex items-center py-[12px]"
                        style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <div 
                          className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center flex-shrink-0" 
                          style={{ backgroundColor: `${txn.categories?.color || '#6A42E3'}26` }}
                        >
                          <IconByName name={txn.categories?.icon || 'HelpCircle'} color={txn.categories?.color || '#6A42E3'} size={20} />
                        </div>
                        
                        <div className="ml-[12px] flex-[1]">
                          <div className="text-[14px] font-semibold text-[#FFFFFF]">{txn.name}</div>
                          <div className="text-[12px] text-[#6B7280] mt-[2px]">
                            {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>

                        <div className="text-[15px] font-bold" style={{ color: amountColor }}>
                          {prefix}{formatAmount(txn.amount)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
