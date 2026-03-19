'use client'

import { useEffect, useState, FormEvent, useCallback } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { useModal } from '@/context/ModalContext'
import { useRefetch } from '@/context/RefetchContext'
import { createClient } from '@/lib/supabase/client'
import DynamicIcon from '@/components/ui/DynamicIcon'

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export default function AddTransactionModal() {
  const { isAddTransactionOpen, closeAddTransaction } = useModal()
  const { refetchDashboard } = useRefetch()
  const [shouldRender, setShouldRender] = useState(false)
  const supabase = createClient()

  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState('monthly')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [categories, setCategories] = useState<Category[]>([])

  const fetchCategories = useCallback(async () => {
    if (!isAddTransactionOpen) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data } = await supabase
      .from('categories')
      .select('id, name, icon, color')
      .eq('user_id', user.id)
      .eq('type', transactionType)
      .order('name')
      
    if (data) setCategories(data)
  }, [transactionType, isAddTransactionOpen, supabase])

  useEffect(() => {
    fetchCategories()
    setCategoryId('')
  }, [fetchCategories])

  const resetForm = () => {
    setTransactionType('expense')
    setName('')
    setAmount('')
    setCategoryId('')
    setDate(new Date().toISOString().split('T')[0])
    setIsRecurring(false)
    setRecurringFrequency('monthly')
    setNote('')
    setError('')
  }

  useEffect(() => {
    if (isAddTransactionOpen) {
      setShouldRender(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      const timeout = setTimeout(() => {
        setShouldRender(false)
        resetForm()
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [isAddTransactionOpen])

  useEffect(() => {
    if (error) setError('')
  }, [name, amount, transactionType, categoryId, date, isRecurring, recurringFrequency, note])

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const parsedAmount = parseFloat(amount)

    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter a transaction name')
      return
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (!categoryId) {
      setError('Please select a category')
      return
    }
    if (!date) {
      setError('Please select a date')
      return
    }

    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setIsLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        name: trimmedName,
        amount: parsedAmount,
        type: transactionType,
        category_id: categoryId,
        date: date,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? recurringFrequency : null,
        note: note.trim() || null
      })

    setIsLoading(false)

    if (insertError) {
      setError('Failed to save transaction. Please try again.')
    } else {
      resetForm()
      closeAddTransaction()
      refetchDashboard()
    }
  }, [name, amount, categoryId, date, isRecurring, recurringFrequency, note, transactionType, supabase, closeAddTransaction, refetchDashboard])

  if (!shouldRender) return null

  const isIncome = transactionType === 'income'
  const activeColor = isIncome ? '#42E3D0' : '#F86161'
  const activeBg = isIncome ? 'rgba(66,227,208,0.15)' : 'rgba(248,97,97,0.15)'

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end pointer-events-none">
      <div 
        className={`fixed inset-0 pointer-events-auto transition-opacity duration-200 ${isAddTransactionOpen ? 'opacity-100 ease-out z-[99]' : 'opacity-0 ease-in -z-10'}`}
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={closeAddTransaction}
      />
      
      <div 
        className={`w-full max-w-[430px] mx-auto bg-[#1A1A23] rounded-t-[24px] pointer-events-auto flex flex-col max-h-[85vh] z-[101] transition-transform ${isAddTransactionOpen ? 'translate-y-0 duration-300 ease-out' : 'translate-y-full duration-250 ease-in'}`}
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div 
          className="w-[40px] h-[4px] rounded-full mx-auto block mt-[12px] flex-shrink-0"
          style={{ background: 'rgba(255, 255, 255, 0.2)' }}
        />
        
        <div className="pt-[20px] mb-[24px] px-[20px] flex items-center justify-between flex-shrink-0">
          <h2 className="text-[#FFFFFF] font-bold text-[18px]">Add Transaction</h2>
          <button 
            onClick={closeAddTransaction}
            className="rounded-full p-[6px] transition-colors cursor-pointer group"
            style={{ background: 'rgba(255, 255, 255, 0.08)' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            type="button"
          >
            <X size={20} color="#6B7280" className="group-hover:text-white transition-colors" />
          </button>
        </div>
        
        <div 
          className="overflow-y-auto w-full pb-[40px] px-[20px]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Custom style to hide webkit scrollbar */}
          <style dangerouslySetInnerHTML={{__html: `
            .overflow-y-auto::-webkit-scrollbar { display: none; }
          `}} />

          <form onSubmit={handleSubmit} className="flex flex-col w-full">
            
            {/* Type Toggle */}
            <div 
              className="grid grid-cols-2 rounded-full mb-[24px] w-full"
              style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '4px' }}
            >
              <button
                type="button"
                onClick={() => setTransactionType('income')}
                className={`py-[10px] text-[14px] font-semibold rounded-full transition-all duration-200 ease-out text-center cursor-pointer ${
                  transactionType === 'income' 
                    ? 'bg-[#42E3D0] text-[#091428]' 
                    : 'bg-transparent text-[#6B7280]'
                }`}
                style={{ 
                  boxShadow: transactionType === 'income' ? '0 0 12px rgba(66,227,208,0.4)' : 'none' 
                }}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('expense')}
                className={`py-[10px] text-[14px] font-semibold rounded-full transition-all duration-200 ease-out text-center cursor-pointer ${
                  transactionType === 'expense' 
                    ? 'bg-[#F86161] text-[#FFFFFF]' 
                    : 'bg-transparent text-[#6B7280]'
                }`}
                style={{ 
                  boxShadow: transactionType === 'expense' ? '0 0 12px rgba(248,97,97,0.4)' : 'none' 
                }}
              >
                Expense
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="flex items-center gap-[6px] mb-[16px] rounded-[8px] p-[10px_12px]"
                style={{ background: 'rgba(248,97,97,0.08)', border: '1px solid rgba(248,97,97,0.2)' }}
              >
                <AlertCircle size={14} color="#F86161" />
                <span className="text-[#F86161] text-[12px] font-medium">{error}</span>
              </div>
            )}

            {/* Name Input */}
            <div className="mb-[20px]">
              <label htmlFor="name" className="block text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.06em] mb-[8px]">
                Transaction name
              </label>
              <input
                id="name"
                maxLength={50}
                placeholder="E.g. Groceries, Salary"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#1A1A23] rounded-[12px] px-[16px] py-[14px] text-white text-[15px] font-sans placeholder:text-[#374151] focus:border-[#6A42E3] focus:outline-none transition-all"
                style={{ 
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6A42E3'
                  e.target.style.boxShadow = '0 0 0 3px rgba(106,66,227,0.15)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Amount Input */}
            <div className="mb-[20px] relative">
              <label htmlFor="amount" className="block text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.06em] mb-[8px]">
                Amount
              </label>
              <div className="relative">
                <span 
                  className="absolute left-[16px] top-[50%] -translate-y-[50%] text-[20px] font-extrabold transition-colors duration-200"
                  style={{ color: activeColor }}
                >
                  ₹
                </span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => {
                    const val = e.target.value;
                    if (Number(val) < 0) return;
                    setAmount(val);
                  }}
                  className="w-full bg-[#1A1A23] rounded-[12px] pl-[40px] pr-[16px] py-[16px] text-white text-[28px] font-extrabold font-sans placeholder:text-[#374151] focus:outline-none transition-all"
                  style={{ 
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = activeColor
                    e.target.style.boxShadow = `0 0 0 3px ${activeBg}`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Category Grid */}
            <div className="mb-[20px]">
              <label className="block text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.06em] mb-[8px]">
                Category
              </label>
              <div className="grid grid-cols-4 gap-[10px]">
                {categories.map(cat => {
                  const isSelected = categoryId === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className="flex flex-col items-center gap-[6px] p-[12px_8px] rounded-[14px] cursor-pointer transition-all duration-150 ease-out"
                      style={{ 
                        background: isSelected ? 'rgba(106,66,227,0.15)' : 'rgba(255,255,255,0.04)',
                        border: isSelected ? '1px solid #6A42E3' : '1px solid rgba(255,255,255,0.06)',
                        boxShadow: isSelected ? '0 0 0 1px #6A42E3' : 'none'
                      }}
                      onMouseOver={(e) => {
                        if(!isSelected) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                        }
                      }}
                      onMouseOut={(e) => {
                        if(!isSelected) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                        }
                      }}
                    >
                      <div 
                        className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cat.color}26` }}
                      >
                         <DynamicIcon 
                          name={cat.icon} 
                          size={18} 
                          color={cat.color} 
                        />
                      </div>
                      <span 
                        className="text-[10px] font-medium text-center w-full truncate leading-[1.2]" 
                        style={{ color: isSelected ? '#FFFFFF' : '#6B7280' }}
                      >
                        {cat.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Date Picker */}
            <div className="mb-[20px]">
              <label htmlFor="date" className="block text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.06em] mb-[8px]">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-[#1A1A23] rounded-[12px] px-[16px] py-[14px] text-white text-[14px] font-sans cursor-pointer focus:outline-none transition-all [&::-webkit-calendar-picker-indicator]:invert"
                style={{ 
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6A42E3'
                  e.target.style.boxShadow = '0 0 0 3px rgba(106,66,227,0.15)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Recurring Toggle */}
            <div className="mb-[20px]">
              <div 
                className="flex justify-between items-center rounded-[12px] p-[14px_16px]"
                style={{ 
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: isRecurring ? '12px' : '0px'
                }}
              >
                <div>
                  <div className="text-[14px] font-semibold text-white">Recurring</div>
                  <div className="text-[12px] text-[#6B7280] mt-[2px]">Repeat this transaction</div>
                </div>
                
                <div 
                  onClick={() => setIsRecurring(!isRecurring)}
                  className="w-[44px] h-[24px] rounded-full relative cursor-pointer transition-colors duration-200 ease-in-out flex-shrink-0"
                  style={{ background: isRecurring ? '#6A42E3' : '#374151' }}
                >
                  <div 
                    className="w-[20px] h-[20px] rounded-full bg-white absolute top-[2px] transition-transform duration-200 ease-in-out"
                    style={{ 
                      transform: isRecurring ? 'translateX(22px)' : 'translateX(2px)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }} 
                  />
                </div>
              </div>
              
              {isRecurring && (
                <div 
                  className="w-full rounded-[12px]" 
                  style={{ 
                    animation: 'slideDown 200ms ease-out forwards',
                  }}
                >
                  {/* Inline keyframes explicitly just in case for specific drop down animation */}
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes slideDown {
                      from { opacity: 0; transform: translateY(-8px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                  `}} />
                  <select
                    value={recurringFrequency}
                    onChange={e => setRecurringFrequency(e.target.value)}
                    className="w-full bg-[#1A1A23] rounded-[12px] p-[14px_16px] text-white text-[14px] font-sans appearance-none outline-none cursor-pointer"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Note Textarea */}
            <div className="mb-[24px]">
              <label htmlFor="note" className="block text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.06em] mb-[8px]">
                Note (Optional)
              </label>
              <textarea
                id="note"
                maxLength={200}
                placeholder="Add details..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full bg-[#1A1A23] rounded-[12px] p-[14px_16px] text-white text-[14px] font-sans placeholder:text-[#374151] min-h-[80px] resize-none focus:outline-none transition-all"
                style={{ 
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6A42E3'
                  e.target.style.boxShadow = '0 0 0 3px rgba(106,66,227,0.15)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full h-[52px] rounded-full text-[15px] font-bold transition-all duration-150 ease-out mt-[8px] flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110 hover:-translate-y-[1px] active:scale-[0.98]'
              }`}
              style={{
                background: transactionType === 'income' ? '#42E3D0' : '#6A42E3',
                color: transactionType === 'income' ? '#091428' : '#FFFFFF'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  )
}
