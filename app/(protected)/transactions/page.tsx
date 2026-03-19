'use client'

import { useState, useEffect } from 'react'
import { Search, X, Trash2, Repeat, SearchX, AlertCircle } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import DynamicIcon from '@/components/ui/DynamicIcon'
import { useTransactionsData, Transaction, FilterPeriod } from '@/hooks/useTransactionsData'
import { useRefetch } from '@/context/RefetchContext'
import { formatAmount } from '@/lib/utils'

function formatDateHeader(dateStr: string) {
  const d = new Date(dateStr)
  const localD = new Date(d.getTime() + d.getTimezoneOffset() * 60000)
  
  const today = new Date()
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0]
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = new Date(yesterday.getTime() - yesterday.getTimezoneOffset() * 60000).toISOString().split('T')[0]
  
  if (dateStr === todayStr) return 'Today'
  if (dateStr === yesterdayStr) return 'Yesterday'
  
  return localD.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TransactionsPage() {
  const {
    transactions,
    filteredTransactions,
    isLoading,
    error,
    searchQuery,
    activeFilter,
    typeFilter,
    categoryFilter,
    activeTab,
    setSearchQuery,
    setActiveFilter,
    setTypeFilter,
    setCategoryFilter,
    setActiveTab,
    deleteTransaction,
    refetch,
    totalIncomeThisMonth,
    totalExpenseThisMonth,
    categoriesList
  } = useTransactionsData()

  const { setRefetchDashboard } = useRefetch()

  useEffect(() => {
    setRefetchDashboard(refetch)
  }, [refetch, setRefetchDashboard])

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const groupTransactionsByDate = (txns: Transaction[]) => {
    const groups: { [date: string]: Transaction[] } = {}
    txns.forEach(t => {
      if (!groups[t.date]) groups[t.date] = []
      groups[t.date].push(t)
    })
    return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(date => ({
      date,
      transactions: groups[date]
    }))
  }

  const groupedTransactions = groupTransactionsByDate(filteredTransactions)

  const dropdownIconUri = `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`

  return (
    <div className="min-h-screen bg-[#091428] pb-[100px] max-w-[430px] mx-auto w-full animate-fade-in-up">
      <PageHeader title="Transactions" />
      
      <div className="px-[20px] flex flex-col pt-[4px]">
        {/* Custom style to hide webkit scrollbars globally in this container scope */}
        <style dangerouslySetInnerHTML={{__html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}} />

        {/* Section 2 — Summary Row */}
        {isLoading ? (
          <div className="flex gap-[10px] mb-[20px] pb-[4px] overflow-hidden">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className="rounded-[14px] p-[12px_16px] flex-shrink-0 min-w-[100px] h-[64px] animate-pulse"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-[10px] no-scrollbar mb-[20px] pb-[4px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div 
              className="rounded-[14px] p-[12px_16px] flex-shrink-0 min-w-[100px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="text-[10px] font-medium text-[#6B7280] uppercase tracking-[0.05em] mb-[4px]">Total Txns</div>
              <div className="text-[#FFFFFF] text-[16px] font-extrabold">{filteredTransactions.length}</div>
            </div>
            <div 
              className="rounded-[14px] p-[12px_16px] flex-shrink-0 min-w-[100px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="text-[10px] font-medium text-[#6B7280] uppercase tracking-[0.05em] mb-[4px]">Income</div>
              <div className="text-[#42E3D0] text-[16px] font-extrabold">{formatAmount(totalIncomeThisMonth)}</div>
            </div>
            <div 
              className="rounded-[14px] p-[12px_16px] flex-shrink-0 min-w-[100px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="text-[10px] font-medium text-[#6B7280] uppercase tracking-[0.05em] mb-[4px]">Expense</div>
              <div className="text-[#F86161] text-[16px] font-extrabold">{formatAmount(totalExpenseThisMonth)}</div>
            </div>
          </div>
        )}

        {/* Section 3 — Tab Toggle */}
        <div 
          className="grid grid-cols-2 rounded-full p-[4px] mb-[16px] w-full"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={() => setActiveTab('one-time')}
            className={`py-[10px] text-[14px] font-semibold rounded-full transition-all duration-200 ease-out text-center ${
              activeTab === 'one-time' ? 'bg-[#6A42E3] text-[#FFFFFF]' : 'bg-transparent text-[#6B7280]'
            }`}
          >
            One-Time
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`py-[10px] text-[14px] font-semibold rounded-full transition-all duration-200 ease-out text-center ${
              activeTab === 'recurring' ? 'bg-[#6A42E3] text-[#FFFFFF]' : 'bg-transparent text-[#6B7280]'
            }`}
          >
            Recurring
          </button>
        </div>

        {/* Section 4 — Search Bar */}
        <div className="relative mb-[14px]">
          <Search size={16} color="#6B7280" className="absolute left-[14px] top-[50%] -translate-y-[50%]" />
          <input 
            type="text" 
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A23] rounded-[12px] pl-[42px] pr-[40px] py-[12px] text-white text-[14px] placeholder:text-[#6B7280] focus:outline-none transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6A42E3'
              e.target.style.boxShadow = '0 0 0 3px rgba(106,66,227,0.15)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)'
              e.target.style.boxShadow = 'none'
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-[14px] top-[50%] -translate-y-[50%] text-[#6B7280] hover:text-[#FFFFFF] cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Section 5 — Filter Badges */}
        <div className="flex overflow-x-auto gap-[8px] no-scrollbar mb-[14px] pb-[4px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {(['all', 'today', 'week', 'month', 'year', 'custom'] as FilterPeriod[]).map(fp => {
            const isActive = activeFilter === fp
            return (
              <button
                key={fp}
                onClick={() => setActiveFilter(fp)}
                className="p-[7px_14px] rounded-full text-[13px] font-[500] whitespace-nowrap cursor-pointer transition-all duration-150 flex-shrink-0"
                style={{
                  background: isActive ? '#6A42E3' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#FFFFFF' : '#6B7280',
                  border: isActive ? '1px solid #6A42E3' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isActive ? '0 0 10px rgba(106,66,227,0.3)' : 'none'
                }}
                onMouseOver={(e) => {
                  if(!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = '#FFFFFF'
                  }
                }}
                onMouseOut={(e) => {
                  if(!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = '#6B7280'
                  }
                }}
              >
                {fp === 'all' ? 'All' 
                  : fp === 'today' ? 'Today'
                  : fp === 'week' ? 'This Week'
                  : fp === 'month' ? 'This Month'
                  : fp === 'year' ? 'This Year'
                  : 'Custom'}
              </button>
            )
          })}
        </div>

        {/* Section 6 — Filter Dropdowns Row */}
        <div className="grid grid-cols-2 gap-[10px] mb-[20px]">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full bg-[#1A1A23] rounded-[12px] p-[10px_14px] text-[#FFFFFF] text-[13px] font-sans appearance-none cursor-pointer focus:outline-none transition-colors"
            style={{ 
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundImage: dropdownIconUri,
              backgroundPosition: 'right 12px center',
              backgroundRepeat: 'no-repeat'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6A42E3'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#1A1A23] rounded-[12px] p-[10px_14px] text-[#FFFFFF] text-[13px] font-sans appearance-none cursor-pointer focus:outline-none transition-colors"
            style={{ 
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundImage: dropdownIconUri,
              backgroundPosition: 'right 12px center',
              backgroundRepeat: 'no-repeat'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6A42E3'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <option value="">All Categories</option>
            {categoriesList.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Section 7 — Transactions List */}
        {isLoading ? (
          <div className="animate-pulse flex flex-col gap-[8px]">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div 
                key={i} 
                className="h-[74px] w-full rounded-[16px] flex items-center gap-[12px] p-[14px]"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div className="w-[44px] h-[44px] rounded-[12px] flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
                <div className="flex-1">
                  <div className="h-[14px] w-[120px] rounded mb-[6px]" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
                  <div className="h-[12px] w-[80px] rounded" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
                </div>
                <div className="h-[18px] w-[60px] rounded" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-[12px] p-[16px] rounded-[12px] mb-[16px]" style={{ background: 'rgba(248,97,97,0.08)', border: '1px solid rgba(248,97,97,0.2)' }}>
            <AlertCircle className="shrink-0 text-[#F86161]" size={20} />
            <div className="text-[#F86161] text-[14px]">Something went wrong. Please refresh and try again.</div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center p-[60px_20px] text-center">
            <SearchX size={48} color="#374151" className="mb-[16px]" />
            <p className="text-[#FFFFFF] text-[16px] font-[600] mb-[8px]">No transactions found.</p>
            <p className="text-[#6B7280] text-[14px]">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {groupedTransactions.map(group => (
              <div key={group.date}>
                {/* Section 7 - Date Group Headers */}
                <div className="mt-[24px] mb-[10px] text-[12px] font-[600] text-[#6B7280] uppercase tracking-[0.08em] flex items-center gap-[8px]">
                  <span>{formatDateHeader(group.date)}</span>
                  <div className="flex-1 h-[1px]" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
                </div>
                
                <div className="flex flex-col gap-[8px]">
                  {group.transactions.map(txn => {
                    const isIncome = txn.type === 'income'
                    const amountColor = isIncome ? '#42E3D0' : '#F86161'
                    const prefix = isIncome ? '+' : '-'
                    const isDeleting = deletingId === txn.id

                    return (
                      <div 
                        key={txn.id} 
                        className="rounded-[16px] p-[14px] flex items-center gap-[12px] transition duration-150 cursor-default group"
                        style={{ 
                          background: 'rgba(255,255,255,0.04)', 
                          border: '1px solid rgba(255,255,255,0.08)' 
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      >
                        {/* Left Side */}
                        <div 
                          className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center flex-shrink-0" 
                          style={{ background: `${txn.categories?.color || '#6A42E3'}26` }}
                        >
                          <DynamicIcon name={txn.categories?.icon || 'HelpCircle'} color={txn.categories?.color || '#6A42E3'} size={20} />
                        </div>

                        {/* Middle Side */}
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-[600] text-[#FFFFFF] whitespace-nowrap overflow-hidden text-ellipsis">
                            {txn.name}
                          </div>
                          <div className="flex items-center gap-[6px] mt-[3px]">
                            <span className="text-[12px] text-[#6B7280]">
                              {txn.categories?.name || 'Uncategorized'}
                            </span>
                            {txn.is_recurring && (
                              <div 
                                className="inline-flex items-center gap-[3px] rounded-full p-[2px_7px]"
                                style={{ background: 'rgba(106,66,227,0.15)', border: '1px solid rgba(106,66,227,0.3)' }}
                              >
                                <Repeat size={9} color="#6A42E3" strokeWidth={3} />
                                <span className="text-[10px] font-[600] text-[#6A42E3]">Recurring</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right side: Amount and Delete */}
                        <div className="flex flex-col items-end gap-[6px]">
                          {!isDeleting && (
                            <div className="font-[700] text-[15px]" style={{ color: amountColor }}>
                              {prefix}{formatAmount(txn.amount)}
                            </div>
                          )}

                          {isDeleting ? (
                            <div 
                              className="flex items-center gap-[6px]"
                              style={{ animation: 'fadeIn 150ms ease-out forwards' }}
                            >
                              <style dangerouslySetInnerHTML={{__html: `
                                @keyframes fadeIn {
                                  from { opacity: 0; }
                                  to { opacity: 1; }
                                }
                              `}} />
                              <span className="text-[11px] text-[#F86161] font-[600]">Delete?</span>
                              <button 
                                onClick={() => deleteTransaction(txn.id)}
                                className="p-[3px_8px] rounded-[6px] text-[11px] font-[600] cursor-pointer transition-colors"
                                style={{
                                  background: 'rgba(248,97,97,0.2)',
                                  border: '1px solid #F86161',
                                  color: '#F86161'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(248,97,97,0.3)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(248,97,97,0.2)'}
                              >
                                Yes
                              </button>
                              <button 
                                onClick={() => setDeletingId(null)}
                                className="p-[3px_8px] rounded-[6px] text-[11px] cursor-pointer transition-colors"
                                style={{
                                  background: 'rgba(255,255,255,0.06)',
                                  border: '1px solid rgba(255,255,255,0.12)',
                                  color: '#6B7280'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#6B7280'}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setDeletingId(txn.id)}
                              className="bg-transparent border-none cursor-pointer p-[4px] rounded-[6px] transition-all duration-150"
                              onMouseOver={(e) => {
                                e.currentTarget.style.color = '#F86161';
                                e.currentTarget.style.background = 'rgba(248,97,97,0.1)';
                                (e.currentTarget.firstChild as any).style.stroke = '#F86161';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.color = '#374151';
                                e.currentTarget.style.background = 'transparent';
                                (e.currentTarget.firstChild as any).style.stroke = '#374151';
                              }}
                            >
                              <Trash2 size={14} color="#374151" className="transition-colors duration-150" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section 10 — Footer */}
        {!isLoading && filteredTransactions.length > 0 && (
          <div className="text-center text-[#374151] text-[12px] p-[16px_0_8px_0]">
            Showing {filteredTransactions.length} of {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
