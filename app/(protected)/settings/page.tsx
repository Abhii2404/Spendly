'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatAmount } from '@/lib/utils'
import PageHeader from '@/components/layout/PageHeader'
import DynamicIcon from '@/components/ui/DynamicIcon'
import { useSettingsData, Category, NewCategory } from '@/hooks/useSettingsData'
import { LogOut, Plus, Trash2, FileText, Download, AlertTriangle, Printer, ShoppingCart, Scissors, PiggyBank, Dumbbell, Globe, Star, Camera, FileDown, ChevronRight, Loader2, AlertCircle, Pencil, X } from 'lucide-react'

// Available icons requested
const AVAILABLE_ICONS = [
  'UtensilsCrossed', 'Car', 'ShoppingBag', 'Heart', 'Tv', 'Zap', 'Plane', 'BookOpen',
  'RefreshCw', 'Briefcase', 'Laptop', 'TrendingUp', 'Home', 'Gift', 'Coffee',
  'Music', 'Gamepad2', 'Bus', 'Phone', 'Wifi', 'ShoppingCart', 'Scissors', 'PiggyBank',
  'Dumbbell', 'Camera', 'Globe', 'Star'
]

// Available color swatches
const COLOR_SWATCHES = [
  '#F86161', '#42E3D0', '#6A42E3', '#E7BE29',
  '#F97316', '#A855F7', '#3B82F6', '#10B981'
]

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const {
    categories,
    isLoading,
    error,
    addCategory,
    deleteCategory,
    isAddingCategory,
    isDeletingCategory,
    addCategoryError,
    userProfile,
    budgets,
    isLoadingBudgets,
    setBudgetLimit,
    removeBudgetLimit
  } = useSettingsData()

  // State
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Add category form state
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense')
  const [newCatIcon, setNewCatIcon] = useState('')
  const [newCatColor, setNewCatColor] = useState('')

  // Delete category state
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  // Export states
  const [isExportingCSV, setIsExportingCSV] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)

  // Reset state
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Budget management state
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null)
  
  const [budgetCategoryId, setBudgetCategoryId] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [isSavingBudget, setIsSavingBudget] = useState(false)
  const [budgetError, setBudgetError] = useState('')

  // Handlers
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await addCategory({
      name: newCatName,
      type: newCatType,
      icon: newCatIcon,
      color: newCatColor
    })
    
    // Only collapse if there is no error from the hook
    if (newCatName && newCatIcon && newCatColor) {
      setShowAddForm(false)
      setNewCatName('')
      setNewCatIcon('')
      setNewCatColor('')
    }
  }

  const exportCSV = async () => {
    setIsExportingCSV(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: txns } = await supabase
        .from('transactions')
        .select(`*, categories:category_id(name)`)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (!txns || txns.length === 0) {
        alert("No data to export")
        return
      }

      const headers = ['Date', 'Name', 'Type', 'Category', 'Amount', 'Recurring', 'Frequency', 'Note']
      const rows = txns.map(t => [
        t.date,
        `"${t.name.replace(/"/g, '""')}"`,
        t.type,
        `"${(t.categories as any)?.name || 'Uncategorized'}"`,
        t.amount,
        t.is_recurring ? 'Yes' : 'No',
        t.recurring_frequency || '',
        `"${(t.note || '').replace(/"/g, '""')}"`
      ])

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'spendly-transactions.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setIsExportingCSV(false)
    }
  }

  const exportPDF = () => {
    setIsExportingPDF(true)
    document.body.classList.add('printing')
    setTimeout(() => {
      window.print()
      document.body.classList.remove('printing')
      setIsExportingPDF(false)
    }, 500)
  }

  const handleResetData = async () => {
    setIsResetting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete all transactions
      await supabase.from('transactions').delete().eq('user_id', user.id)
      
      // Delete all budgets
      await supabase.from('budgets').delete().eq('user_id', user.id)
      
      // We will only delete custom categories in the future, for now delete all user transactions.
      
      router.push('/dashboard')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsResetting(false)
      setShowResetConfirm(false)
    }
  }

  const filteredCategories = categories.filter(c => c.type === activeTab)
  const expenseCategories = categories.filter(c => c.type === 'expense')
  const availableBudgetCategories = expenseCategories.filter(
    c => !budgets.some(b => b.category_id === c.id)
  )

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    setBudgetError('')
    
    if (!budgetCategoryId) {
      setBudgetError('Please select a category')
      return
    }
    
    const amountNum = parseFloat(budgetAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setBudgetError('Please enter a valid amount greater than 0')
      return
    }
    
    setIsSavingBudget(true)
    try {
      await setBudgetLimit(budgetCategoryId, amountNum)
      setShowAddBudget(false)
      setEditingBudgetId(null)
      setBudgetCategoryId('')
      setBudgetAmount('')
    } catch (err: any) {
      setBudgetError(err.message || 'Failed to save budget')
    } finally {
      setIsSavingBudget(false)
    }
  }

  const openEditBudget = (budget: any) => {
    setBudgetCategoryId(budget.category_id)
    setBudgetAmount(budget.monthly_limit.toString())
    setEditingBudgetId(budget.id)
    setShowAddBudget(false)
    setBudgetError('')
  }

  return (
    <div className="min-h-screen bg-[#091428] pb-[100px] max-w-[430px] lg:max-w-[1200px] lg:px-[32px] mx-auto w-full relative animate-fade-in-up">
      <div className="lg:hidden">
        <PageHeader title="Settings" />
      </div>
      
      <div className="px-[20px] lg:px-0 pt-[4px] lg:pt-[24px] flex flex-col">
        {/* Print-only styles logic & global scrollbar hiding */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            .print-section, .print-section * { visibility: visible; }
            .print-section { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
            body { background: white !important; }
            * { color: black !important; }
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          
          @keyframes fadeInSlideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}} />

        {error && (
          <div className="flex items-center gap-[12px] p-[16px] rounded-[12px] mb-[16px]" style={{ background: 'rgba(248,97,97,0.08)', border: '1px solid rgba(248,97,97,0.2)' }}>
            <AlertCircle className="shrink-0 text-[#F86161]" size={20} />
            <div className="text-[#F86161] text-[14px]">Something went wrong. Please refresh and try again.</div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-[16px]">
            <div className="h-[80px] rounded-[20px] animate-pulse bg-[rgba(255,255,255,0.06)]" />
            <div className="h-[60px] rounded-[20px] animate-pulse bg-[rgba(255,255,255,0.06)]" />
            <div className="rounded-[20px] p-[20px] bg-[rgba(255,255,255,0.06)] animate-pulse border border-[rgba(255,255,255,0.08)]">
              <div className="h-[16px] w-[120px] bg-[rgba(255,255,255,0.1)] rounded mb-[20px]" />
              <div className="flex flex-col gap-[8px]">
                {[1,2,3,4,5].map(i => <div key={i} className="h-[52px] w-full rounded-[14px] bg-[rgba(255,255,255,0.08)]" />)}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-2 lg:gap-[20px] lg:items-start">
            
            {/* Left Column wrapper on Desktop */}
            <div className="flex flex-col">
              {/* Task 3 — Account Card */}
              <div className="rounded-[20px] p-[20px] mb-[16px] lg:mb-[20px] print-section" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
              <div className="text-[13px] font-[600] text-[#6B7280] uppercase tracking-[0.08em] mb-[16px]">Account</div>
              <div className="flex items-center gap-[14px] mb-[16px]">
                {userProfile?.avatarUrl ? (
                  <img 
                    src={userProfile.avatarUrl} 
                    alt="Profile" 
                    className="w-[52px] h-[52px] rounded-full shrink-0 object-cover" 
                  />
                ) : (
                  <div 
                    className="w-[52px] h-[52px] rounded-full shrink-0 flex items-center justify-center text-[20px] font-[800] text-[#FFFFFF]"
                    style={{ background: 'linear-gradient(135deg, #6A42E3, #42E3D0)' }}
                  >
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <div className="text-[16px] font-[700] text-[#FFFFFF]">{userProfile?.name || 'User'}</div>
                  <div className="text-[13px] text-[#6B7280] mt-[3px]">{userProfile?.email}</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full rounded-[12px] p-[12px] text-[14px] font-[600] text-[#F86161] flex items-center justify-center gap-[8px] transition-all duration-150 no-print cursor-pointer"
                style={{ background: 'rgba(248,97,97,0.08)', border: '1px solid rgba(248,97,97,0.2)' }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(248,97,97,0.15)'
                  e.currentTarget.style.borderColor = '#F86161'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(248,97,97,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(248,97,97,0.2)'
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>

            {/* Task 4 — Currency Card */}
            <div className="rounded-[20px] p-[20px] mb-[16px] lg:mb-[20px] no-print flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
              <div>
                <div className="text-[13px] font-[600] text-[#6B7280] uppercase tracking-[0.08em] mb-[16px]">Currency</div>
                <div className="text-[15px] font-[600] text-[#FFFFFF]">Indian Rupee (₹ INR)</div>
                <div className="text-[12px] text-[#6B7280] mt-[2px]">Default currency</div>
              </div>
              <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[16px] font-[700] text-[#6A42E3] self-end mt-[-8px]" style={{ background: 'rgba(106,66,227,0.15)' }}>
                ₹
              </div>
            </div>

            <div className="hidden lg:block">
              {/* Task 8 — Danger Zone Section (moved to Left Column on Desktop) */}
              <div className="rounded-[20px] p-[20px] no-print flex-col" style={{ background: 'rgba(248,97,97,0.04)', border: '1px solid rgba(248,97,97,0.2)' }}>
                <div className="text-[13px] font-[600] text-[#F86161] uppercase tracking-[0.08em] mb-[16px]">Danger Zone</div>
                
                <p className="text-[13px] text-[#6B7280] leading-[1.6] mb-[16px]">
                  Permanently delete all data associated with your account, including custom configurations.
                </p>
                
                <button 
                  onClick={() => setShowResetConfirm(true)} 
                  className="w-full rounded-[12px] p-[13px] text-[#F86161] font-[600] text-[14px] flex items-center justify-center gap-[8px] transition-all duration-150 cursor-pointer"
                  style={{ background: 'rgba(248,97,97,0.1)', border: '1px solid rgba(248,97,97,0.3)' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(248,97,97,0.2)'
                    e.currentTarget.style.borderColor = '#F86161'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(248,97,97,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(248,97,97,0.3)'
                  }}
                >
                  <Trash2 size={16} /> Reset All Data
                </button>
              </div>
            </div>

            </div> {/* End Left Column */}
            
            {/* Right Column wrapper on Desktop */}
            <div className="flex flex-col">

            {/* Task 4.5 — Budget Limits Section */}
            <div className="rounded-[20px] p-[20px] mb-[16px] lg:mb-[20px] no-print" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
              <div className="flex flex-col mb-[16px]">
                <h2 className="text-[13px] font-[600] text-[#6B7280] uppercase tracking-[0.08em]">Budget Limits</h2>
                <span className="text-[12px] text-[#6B7280] mt-[2px]">Set monthly spending limits per category</span>
              </div>

              {isLoadingBudgets ? (
                <div className="flex flex-col gap-[8px]">
                  {[1,2].map(i => <div key={i} className="h-[52px] w-full rounded-[14px] bg-[rgba(255,255,255,0.08)] animate-pulse" />)}
                </div>
              ) : (
                <>
                  {budgets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-[20px] text-center">
                      <div className="text-[14px] font-[500] text-[#6B7280]">No budget limits set yet.</div>
                      <div className="text-[12px] text-[#6B7280] mt-[4px]">Add limits to track your spending.</div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-[8px] mb-[16px]">
                      {budgets.map(budget => {
                        const isDeleting = deletingBudgetId === budget.id
                        const isEditing = editingBudgetId === budget.id
                        
                        if (isEditing) {
                           return (
                             <form 
                               key={budget.id}
                               onSubmit={handleSaveBudget} 
                               className="rounded-[16px] p-[16px]"
                               style={{ 
                                 background: 'rgba(255,255,255,0.03)', 
                                 border: '1px solid rgba(255,255,255,0.08)',
                                 animation: 'fadeInSlideDown 200ms ease-out forwards'
                               }}
                             >
                               <div className="text-[14px] font-[600] text-[#FFFFFF] mb-[14px]">Edit Budget</div>
                               
                               {budgetError && (
                                 <div className="flex items-center gap-[6px] text-[11px] text-[#F86161] p-[6px_14px] rounded-[8px] mb-[14px]" style={{ background: 'rgba(248,97,97,0.08)' }}>
                                   <AlertCircle size={12} /> {budgetError}
                                 </div>
                               )}
                               
                               <div className="w-full bg-[rgba(255,255,255,0.04)] rounded-[10px] p-[12px_14px] text-white text-[14px] mb-[10px] opacity-70 flex items-center gap-[10px]" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                                 <div className="w-[20px] h-[20px] rounded-[6px] flex items-center justify-center shrink-0" style={{ background: `${budget.category_color}26` }}>
                                   <DynamicIcon name={budget.category_icon} size={12} color={budget.category_color} />
                                 </div>
                                 {budget.category_name}
                               </div>

                               <div className="relative mb-[14px]">
                                 <span className="absolute left-[14px] top-[50%] -translate-y-[50%] text-[#FFFFFF] text-[15px] font-[600]">₹</span>
                                 <input 
                                   type="number"
                                   min="1"
                                   step="0.01"
                                   value={budgetAmount}
                                   onChange={(e) => setBudgetAmount(e.target.value)}
                                   placeholder="Monthly limit"
                                   className="w-full bg-[#1A1A23] rounded-[10px] pl-[32px] pr-[14px] py-[12px] text-white text-[14px] placeholder:text-[#6B7280] focus:outline-none focus:border-[#6A42E3]"
                                   style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                                   required
                                 />
                               </div>
                               
                               <div className="flex gap-[8px]">
                                 <button type="button" onClick={() => setEditingBudgetId(null)} className="flex-1 p-[11px] rounded-[10px] text-[#6B7280] hover:text-[#FFFFFF] text-[14px] text-center cursor-pointer transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                                 <button type="submit" disabled={isSavingBudget} className="flex-1 p-[11px] rounded-[10px] bg-[#6A42E3] text-[#FFFFFF] text-[14px] font-[600] text-center cursor-pointer transition-all hover:brightness-[1.1] disabled:opacity-70 border-none flex items-center justify-center gap-[6px]">
                                   {isSavingBudget ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save'}
                                 </button>
                               </div>
                             </form>
                           )
                        }

                        return (
                          <div key={budget.id} className="flex items-center gap-[12px] p-[12px_14px] rounded-[14px] transition-all duration-150" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="w-[38px] h-[38px] rounded-[10px] shrink-0 flex items-center justify-center" style={{ background: `${budget.category_color}26` }}>
                              <DynamicIcon name={budget.category_icon} size={18} color={budget.category_color} />
                            </div>
                            <div className="flex flex-col flex-1 truncate">
                              <span className="text-[14px] font-[500] text-[#FFFFFF] truncate">{budget.category_name}</span>
                              <span className="text-[12px] text-[#6B7280] mt-[2px]">{formatAmount(budget.monthly_limit)} / month</span>
                            </div>
                            
                            {isDeleting ? (
                              <div className="flex items-center gap-[6px]" style={{ animation: 'fadeIn 150ms ease-out forwards' }}>
                                <span className="text-[11px] text-[#F86161] font-[700]">Remove?</span>
                                <button 
                                  onClick={() => removeBudgetLimit(budget.id).then(() => setDeletingBudgetId(null))}
                                  className="p-[3px_8px] rounded-[6px] text-[11px] font-[600] text-[#F86161] cursor-pointer"
                                  style={{ border: '1px solid #F86161', background: 'rgba(248,97,97,0.2)' }}
                                >
                                  Yes
                                </button>
                                <button 
                                  onClick={() => setDeletingBudgetId(null)}
                                  className="p-[3px_8px] rounded-[6px] text-[11px] font-[600] text-[#6B7280] cursor-pointer"
                                  style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-[4px] shrink-0">
                                <button 
                                  onClick={() => openEditBudget(budget)}
                                  className="bg-transparent border-none p-[8px] rounded-[8px] cursor-pointer transition-all duration-150 text-[#6B7280]"
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.color = '#FFFFFF';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.color = '#6B7280';
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                  aria-label="Edit budget"
                                >
                                  <Pencil size={15} color="currentColor" />
                                </button>
                                <button 
                                  onClick={() => setDeletingBudgetId(budget.id)}
                                  className="bg-transparent border-none p-[8px] rounded-[8px] cursor-pointer transition-all duration-150 text-[#6B7280]"
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.color = '#F86161';
                                    e.currentTarget.style.background = 'rgba(248,97,97,0.1)';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.color = '#6B7280';
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                  aria-label="Remove budget"
                                >
                                  <X size={15} color="currentColor" />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Add Budget Form */}
                  {!showAddBudget ? (
                    <button 
                      onClick={() => {
                        setShowAddBudget(true)
                        setEditingBudgetId(null)
                        setBudgetCategoryId('')
                        setBudgetAmount('')
                        setBudgetError('')
                      }}
                      className="w-full flex items-center justify-center gap-[8px] p-[12px_16px] rounded-[14px] cursor-pointer transition-all duration-150 text-[#6A42E3] text-[14px] font-[600]"
                      style={{ background: 'rgba(106,66,227,0.1)', border: '1px dashed rgba(106,66,227,0.4)', marginTop: budgets.length > 0 ? '0' : '16px' }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(106,66,227,0.15)'
                        e.currentTarget.style.borderColor = '#6A42E3'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(106,66,227,0.1)'
                        e.currentTarget.style.borderColor = 'rgba(106,66,227,0.4)'
                      }}
                    >
                      <Plus size={16} /> Set Budget for Category
                    </button>
                  ) : (
                    <form 
                      onSubmit={handleSaveBudget} 
                      className="rounded-[16px] p-[16px] mt-[8px]"
                      style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        animation: 'fadeInSlideDown 200ms ease-out forwards'
                      }}
                    >
                      <div className="text-[14px] font-[600] text-[#FFFFFF] mb-[14px]">New Budget Limit</div>
                      
                      {budgetError && (
                        <div className="flex items-center gap-[6px] text-[11px] text-[#F86161] p-[6px_14px] rounded-[8px] mb-[14px]" style={{ background: 'rgba(248,97,97,0.08)' }}>
                          <AlertCircle size={12} /> {budgetError}
                        </div>
                      )}
                      
                      <div className="mb-[10px]">
                        <select
                          value={budgetCategoryId}
                          onChange={(e) => setBudgetCategoryId(e.target.value)}
                          className="w-full bg-[#1A1A23] rounded-[10px] p-[12px_14px] text-white text-[14px] placeholder:text-[#6B7280] focus:outline-none focus:border-[#6A42E3] appearance-none"
                          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                          required
                        >
                          <option value="" disabled className="text-[#6B7280]">Select category</option>
                          {availableBudgetCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="relative mb-[14px]">
                        <span className="absolute left-[14px] top-[50%] -translate-y-[50%] text-[#FFFFFF] text-[15px] font-[600]">₹</span>
                        <input 
                          type="number"
                          min="1"
                          step="0.01"
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(e.target.value)}
                          placeholder="Monthly limit"
                          className="w-full bg-[#1A1A23] rounded-[10px] pl-[32px] pr-[14px] py-[12px] text-white text-[14px] placeholder:text-[#6B7280] focus:outline-none focus:border-[#6A42E3]"
                          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                          required
                        />
                      </div>
                      
                      <div className="flex gap-[8px]">
                        <button type="button" onClick={() => setShowAddBudget(false)} className="flex-1 p-[11px] rounded-[10px] text-[#6B7280] hover:text-[#FFFFFF] text-[14px] text-center cursor-pointer transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                        <button type="submit" disabled={isSavingBudget || (!budgetCategoryId && availableBudgetCategories.length === 0)} className="flex-1 p-[11px] rounded-[10px] bg-[#6A42E3] text-[#FFFFFF] text-[14px] font-[600] text-center cursor-pointer transition-all hover:brightness-[1.1] disabled:opacity-70 border-none flex items-center justify-center gap-[6px]">
                          {isSavingBudget ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save'}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* Task 5 — Categories Section */}
            <div className="rounded-[20px] p-[20px] mb-[16px] lg:mb-[20px] no-print" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
              <h2 className="text-[13px] font-[600] text-[#6B7280] uppercase tracking-[0.08em] mb-[16px]">Categories</h2>
              
              <div className="flex bg-[rgba(255,255,255,0.06)] rounded-full p-[3px] mb-[16px]">
                <button
                  onClick={() => setActiveTab('expense')}
                  className={`flex-1 py-[8px] text-[13px] font-semibold rounded-full transition-all duration-200 cursor-pointer border-none ${
                    activeTab === 'expense' ? 'bg-[#6A42E3] text-[#FFFFFF]' : 'bg-transparent text-[#6B7280]'
                  }`}
                >
                  Expense
                </button>
                <button
                  onClick={() => setActiveTab('income')}
                  className={`flex-1 py-[8px] text-[13px] font-semibold rounded-full transition-all duration-200 cursor-pointer border-none ${
                    activeTab === 'income' ? 'bg-[#6A42E3] text-[#FFFFFF]' : 'bg-transparent text-[#6B7280]'
                  }`}
                >
                  Income
                </button>
              </div>

              <div className="flex flex-col gap-[8px] max-h-[300px] overflow-y-auto mb-[16px] no-scrollbar pr-1" style={{ scrollbarWidth: 'none' }}>
                {filteredCategories.map(cat => {
                  const isDeleting = categoryToDelete === cat.id
                  return (
                    <div key={cat.id} className="flex flex-col gap-[4px]">
                      <div className="flex items-center gap-[12px] p-[12px_14px] rounded-[14px] transition-all duration-150" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="w-[38px] h-[38px] rounded-[10px] shrink-0 flex items-center justify-center" style={{ background: `${cat.color}26` }}>
                          <DynamicIcon name={cat.icon} size={18} color={cat.color} />
                        </div>
                        <span className="text-[14px] font-[500] text-[#FFFFFF] flex-1 truncate">{cat.name}</span>
                        
                        {isDeleting ? (
                          <div className="flex items-center gap-[6px]" style={{ animation: 'fadeIn 150ms ease-out forwards' }}>
                            <span className="text-[11px] text-[#F86161] font-[700]">Delete?</span>
                            <button 
                              onClick={() => deleteCategory(cat.id).then(() => setCategoryToDelete(null))}
                              disabled={isDeletingCategory === cat.id}
                              className="p-[3px_8px] rounded-[6px] text-[11px] font-[600] text-[#F86161] cursor-pointer"
                              style={{ border: '1px solid #F86161', background: 'rgba(248,97,97,0.2)' }}
                            >
                              Yes
                            </button>
                            <button 
                              onClick={() => setCategoryToDelete(null)}
                              className="p-[3px_8px] rounded-[6px] text-[11px] font-[600] text-[#6B7280] cursor-pointer"
                              style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setCategoryToDelete(cat.id)}
                            className="bg-transparent border-none p-[6px] rounded-[8px] cursor-pointer transition-all duration-150 text-[#374151]"
                            onMouseOver={(e) => {
                              e.currentTarget.style.color = '#F86161';
                              e.currentTarget.style.background = 'rgba(248,97,97,0.1)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.color = '#374151';
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <Trash2 size={15} color="currentColor" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Task 6 — Add Category Form */}
              {!showAddForm ? (
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center justify-center gap-[8px] p-[12px_16px] rounded-[14px] cursor-pointer transition-all duration-150 text-[#6A42E3] text-[14px] font-[600]"
                  style={{ background: 'rgba(106,66,227,0.1)', border: '1px dashed rgba(106,66,227,0.4)' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(106,66,227,0.15)'
                    e.currentTarget.style.borderColor = '#6A42E3'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(106,66,227,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(106,66,227,0.4)'
                  }}
                >
                  <Plus size={16} /> Add Category
                </button>
              ) : (
                <form 
                  onSubmit={handleAddCategory} 
                  className="rounded-[16px] p-[16px] mt-[8px]"
                  style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    animation: 'fadeInSlideDown 200ms ease-out forwards'
                  }}
                >
                  <div className="text-[14px] font-[600] text-[#FFFFFF] mb-[14px]">New Category</div>
                  
                  {addCategoryError && (
                    <div className="flex items-center gap-[6px] text-[11px] text-[#F86161] p-[6px_14px] rounded-[8px] mb-[14px]" style={{ background: 'rgba(248,97,97,0.08)' }}>
                      <AlertCircle size={12} /> {addCategoryError}
                    </div>
                  )}
                  
                  <input 
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Category Name"
                    className="w-full bg-[#1A1A23] rounded-[10px] p-[12px_14px] text-white text-[14px] mb-[14px] placeholder:text-[#6B7280] focus:outline-none focus:border-[#6A42E3]"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    maxLength={30}
                    required
                  />

                  <div className="flex bg-[rgba(255,255,255,0.06)] rounded-full p-[3px] mb-[14px]">
                    <button type="button" onClick={() => setNewCatType('expense')} className={`flex-1 p-[4px_12px] rounded-full text-[12px] font-[600] transition-colors border-none cursor-pointer ${newCatType === 'expense' ? 'bg-[#6A42E3] text-[#FFFFFF]' : 'bg-transparent text-[#6B7280] hover:text-[#FFFFFF]'}`}>Expense</button>
                    <button type="button" onClick={() => setNewCatType('income')} className={`flex-1 p-[4px_12px] rounded-full text-[12px] font-[600] transition-colors border-none cursor-pointer ${newCatType === 'income' ? 'bg-[#6A42E3] text-[#FFFFFF]' : 'bg-transparent text-[#6B7280] hover:text-[#FFFFFF]'}`}>Income</button>
                  </div>

                  <div className="grid grid-cols-6 gap-[8px] mb-[14px] max-h-[140px] overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    {AVAILABLE_ICONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewCatIcon(icon)}
                        className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center transition-all duration-150 cursor-pointer"
                        style={{
                          background: newCatIcon === icon ? 'rgba(106,66,227,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${newCatIcon === icon ? '#6A42E3' : 'rgba(255,255,255,0.06)'}`,
                          color: newCatIcon === icon ? '#6A42E3' : '#6B7280'
                        }}
                        onMouseOver={(e) => {
                          if (newCatIcon !== icon) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.color = '#FFFFFF';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (newCatIcon !== icon) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.color = '#6B7280';
                          }
                        }}
                      >
                        <DynamicIcon name={icon} size={18} />
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-[8px] mb-[16px]">
                    {COLOR_SWATCHES.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCatColor(color)}
                        className="w-[32px] h-[32px] rounded-full transition-transform duration-150 cursor-pointer shrink-0"
                        style={{ 
                          background: color, 
                          border: 'none',
                          transform: newCatColor === color ? 'scale(1.05)' : 'scale(1)', 
                          boxShadow: newCatColor === color ? `0 0 0 2px #FFFFFF, 0 0 0 4px ${color}` : 'none' 
                        }}
                        onMouseOver={(e) => {
                          if (newCatColor !== color) e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = newCatColor === color ? 'scale(1.05)' : 'scale(1)';
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex gap-[8px] mt-[4px]">
                    <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 p-[11px] rounded-[10px] text-[#6B7280] hover:text-[#FFFFFF] text-[14px] text-center cursor-pointer transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                    <button type="submit" disabled={isAddingCategory} className="flex-1 p-[11px] rounded-[10px] bg-[#6A42E3] text-[#FFFFFF] text-[14px] font-[600] text-center cursor-pointer transition-all hover:brightness-[1.1] disabled:opacity-70 border-none flex items-center justify-center gap-[6px]">
                      {isAddingCategory ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Task 7 — Export Data Section */}
            <div className="rounded-[20px] p-[20px] mb-[16px] lg:mb-0 no-print" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
              <div className="text-[13px] font-[600] text-[#6B7280] uppercase tracking-[0.08em] mb-[16px]">Export Data</div>
              <div className="flex flex-col">
                <button 
                  onClick={exportCSV} 
                  disabled={isExportingCSV} 
                  className="w-full flex items-center justify-between p-[14px_16px] rounded-[14px] mb-[10px] cursor-pointer transition-all duration-150 disabled:opacity-70"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[36px] h-[36px] rounded-[10px] bg-[rgba(66,227,208,0.15)] flex items-center justify-center">
                      <FileText size={18} color="#42E3D0" />
                    </div>
                    <div className="text-left flex flex-col items-start leading-[1.2]">
                      <div className="text-[14px] font-[600] text-[#FFFFFF]">Export CSV</div>
                      <div className="text-[12px] text-[#6B7280] mt-[2px]">Download spreadsheet</div>
                    </div>
                  </div>
                  {isExportingCSV ? <Loader2 size={16} color="#6B7280" className="animate-spin" /> : <ChevronRight size={16} color="#6B7280" />}
                </button>

                <button 
                  onClick={exportPDF} 
                  disabled={isExportingPDF} 
                  className="w-full flex items-center justify-between p-[14px_16px] rounded-[14px] mb-[10px] cursor-pointer transition-all duration-150 disabled:opacity-70"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[36px] h-[36px] rounded-[10px] bg-[rgba(248,97,97,0.15)] flex items-center justify-center">
                      <FileDown size={18} color="#F86161" />
                    </div>
                    <div className="text-left flex flex-col items-start leading-[1.2]">
                      <div className="text-[14px] font-[600] text-[#FFFFFF]">Export PDF</div>
                      <div className="text-[12px] text-[#6B7280] mt-[2px]">Generate printable report</div>
                    </div>
                  </div>
                  {isExportingPDF ? <Loader2 size={16} color="#6B7280" className="animate-spin" /> : <ChevronRight size={16} color="#6B7280" />}
                </button>
              </div>
            </div>

            </div> {/* End Right Column */}

            {/* Mobile Danger Zone (Hidden on strict LG since it was moved to left column) */}
            <div className="lg:hidden">
              {/* Task 8 — Danger Zone Section */}
              <div className="rounded-[20px] p-[20px] no-print mb-[30px]" style={{ background: 'rgba(248,97,97,0.04)', border: '1px solid rgba(248,97,97,0.2)' }}>
              <div className="text-[13px] font-[600] text-[#F86161] uppercase tracking-[0.08em] mb-[16px]">Danger Zone</div>
              
              <p className="text-[13px] text-[#6B7280] leading-[1.6] mb-[16px]">
                Permanently delete all data associated with your account, including custom configurations.
              </p>
              
              <button 
                onClick={() => setShowResetConfirm(true)} 
                className="w-full rounded-[12px] p-[13px] text-[#F86161] font-[600] text-[14px] flex items-center justify-center gap-[8px] transition-all duration-150 cursor-pointer"
                style={{ background: 'rgba(248,97,97,0.1)', border: '1px solid rgba(248,97,97,0.3)' }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(248,97,97,0.2)'
                  e.currentTarget.style.borderColor = '#F86161'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(248,97,97,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(248,97,97,0.3)'
                }}
              >
                <Trash2 size={16} /> Reset All Data
              </button>
            </div>
            </div>

          </div>
        )}

        {/* Task 9 — Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-[20px]" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
            <div className="w-[90%] max-w-[320px] bg-[#1A1A23] rounded-[20px] p-[28px_24px] z-[201]" style={{ border: '1px solid rgba(248,97,97,0.3)', animation: 'scaleIn 200ms ease forwards' }}>
              <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center mx-auto mb-[16px]" style={{ background: 'rgba(248,97,97,0.12)' }}>
                <AlertTriangle size={28} color="#F86161" />
              </div>
              
              <div className="text-[18px] font-[700] text-[#FFFFFF] text-center mb-[10px]">
                Are you sure?
              </div>
              <p className="text-[13px] text-[#6B7280] text-center leading-[1.6] mb-[24px]">
                This will permanently delete all your transactions, budgets, and custom categories. This cannot be undone.
              </p>
              
              <div className="flex flex-col gap-[10px]">
                <button 
                  onClick={handleResetData} 
                  disabled={isResetting} 
                  className="w-full bg-[#F86161] text-[#FFFFFF] font-[700] rounded-[12px] p-[13px] text-[14px] flex items-center justify-center gap-[6px] cursor-pointer disabled:opacity-70 transition-all hover:brightness-[1.1]"
                  style={{ border: 'none' }}
                >
                  {isResetting ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : 'Delete Everything'}
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)} 
                  className="w-full text-[#6B7280] font-[500] rounded-[12px] p-[13px] text-[14px] cursor-pointer transition-colors hover:text-[#FFFFFF]"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
