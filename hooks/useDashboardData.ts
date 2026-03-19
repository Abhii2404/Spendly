import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { seedCategories } from '@/lib/supabase/seedCategories'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: string
}

export type PeriodType = 'week' | 'month' | 'year' | 'custom'

export interface Transaction {
  id: string
  name: string
  amount: number
  type: 'income' | 'expense'
  category_id: string
  date: string
  is_recurring: boolean
  recurring_frequency: string | null
  note: string | null
  categories: Category // Used from join
}

export interface BudgetProgress {
  categoryName: string
  categoryIcon: string
  categoryColor: string
  spent: number
  limit: number
  percentage: number
}

export interface DashboardData {
  totalIncome: number
  totalExpense: number
  netBalance: number
  incomeChange: number
  expenseChange: number
  recentTransactions: Transaction[]
  recurringTransactions: Transaction[]
  budgetProgress: BudgetProgress[]
  isLoading: boolean
  isRefetching: boolean
  error: string | null
  refetch: () => void
  userName: string
  activePeriod: PeriodType
  customStartDate: string
  customEndDate: string
  setActivePeriod: (p: PeriodType) => void
  setCustomStartDate: (d: string) => void
  setCustomEndDate: (d: string) => void
  periodLabel: string
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    incomeChange: 0,
    expenseChange: 0,
    recentTransactions: [],
    recurringTransactions: [],
    budgetProgress: [],
    isLoading: true,
    isRefetching: false,
    error: null,
    refetch: () => {},
    userName: '',
    activePeriod: 'month',
    customStartDate: '',
    customEndDate: '',
    setActivePeriod: () => {},
    setCustomStartDate: () => {},
    setCustomEndDate: () => {},
    periodLabel: ''
  })
  
  const [activePeriodState, setActivePeriodState] = useState<PeriodType>('month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('spendly_dashboard_period')
      if (saved && ['week', 'month', 'year'].includes(saved)) {
        setActivePeriodState(saved as PeriodType)
      }
    } catch (e) {}
  }, [])

  const setActivePeriod = useCallback((p: PeriodType) => {
    setActivePeriodState(p)
    if (p !== 'custom') {
      try {
        localStorage.setItem('spendly_dashboard_period', p)
      } catch (e) {}
      setCustomStartDate('')
      setCustomEndDate('')
    }
  }, [])

  const periodLabel = useMemo(() => {
    if (activePeriodState === 'week') return 'This Week'
    if (activePeriodState === 'month') return 'This Month'
    if (activePeriodState === 'year') return 'This Year'
    if (activePeriodState === 'custom' && customStartDate && customEndDate) {
      const formatDt = (d: string) => {
        const [y, m, day] = d.split('-')
        const dt = new Date(Number(y), Number(m)-1, Number(day))
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return `${parseInt(day, 10)} ${months[dt.getMonth()]}`
      }
      const [y] = customEndDate.split('-')
      return `${formatDt(customStartDate)} – ${formatDt(customEndDate)} ${y}`
    }
    return 'This Month'
  }, [activePeriodState, customStartDate, customEndDate])

  const supabase = createClient()

  const fetchDashboardData = useCallback(async () => {
    setData(prev => ({ ...prev, ...(isFirstLoad ? { isLoading: true } : { isRefetching: true }), error: null }))
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setData(prev => ({ ...prev, isLoading: false, isRefetching: false, error: 'User not authenticated' }))
        return
      }

      await seedCategories(supabase, user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()
        
      const userName = profile?.name || 'User'

      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      
      const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
      const lastDayCurrentMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
      
      const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]
      const lastDayLastMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
      const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
      
      let startStr = ''
      let endStr = ''
      let prevStartStr = ''
      let prevEndStr = ''

      const toISODate = (d: Date) => {
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]
      }

      const todayStr = toISODate(now)

      let effectivePeriod = activePeriodState
      if (activePeriodState === 'custom' && (!customStartDate || !customEndDate)) {
        effectivePeriod = 'month'
      }

      if (effectivePeriod === 'week') {
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        startStr = toISODate(weekAgo)
        endStr = todayStr

        const prevWeekEnd = new Date(weekAgo)
        prevWeekEnd.setDate(prevWeekEnd.getDate() - 1)
        const prevWeekStart = new Date(prevWeekEnd)
        prevWeekStart.setDate(prevWeekStart.getDate() - 7)
        
        prevStartStr = toISODate(prevWeekStart)
        prevEndStr = toISODate(prevWeekEnd)
        
      } else if (effectivePeriod === 'year') {
        startStr = `${currentYear}-01-01`
        endStr = todayStr
        
        prevStartStr = `${currentYear - 1}-01-01`
        prevEndStr = `${currentYear - 1}-12-31`
        
      } else if (effectivePeriod === 'custom') {
        startStr = customStartDate
        endStr = customEndDate
        
        const startDt = new Date(customStartDate)
        const endDt = new Date(customEndDate)
        const diffTime = Math.abs(endDt.getTime() - startDt.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        const prevEndDt = new Date(startDt)
        prevEndDt.setDate(prevEndDt.getDate() - 1)
        const prevStartDt = new Date(prevEndDt)
        prevStartDt.setDate(prevStartDt.getDate() - diffDays)
        
        prevStartStr = toISODate(prevStartDt)
        prevEndStr = toISODate(prevEndDt)
        
      } else {
        // month
        startStr = firstDayCurrentMonth
        endStr = lastDayCurrentMonth
        prevStartStr = firstDayLastMonth
        prevEndStr = lastDayLastMonth
      }

      const { data: periodTxns, error: currentTxnError } = await supabase
        .from('transactions')
        .select(`*, categories:category_id (*)`)
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr)

      if (currentTxnError) throw currentTxnError

      const { data: prevPeriodTxns, error: lastTxnError } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('date', prevStartStr)
        .lte('date', prevEndStr)

      if (lastTxnError) throw lastTxnError

      const { data: recentTxns, error: recentErr } = await supabase
        .from('transactions')
        .select(`*, categories:category_id (*)`)
        .eq('user_id', user.id)
        .eq('is_recurring', false)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: false })
        .limit(5)
        
      if (recentErr) throw recentErr

      const { data: recurringList, error: recurringErr } = await supabase
        .from('transactions')
        .select(`*, categories:category_id (*)`)
        .eq('user_id', user.id)
        .eq('is_recurring', true)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: false })
        .limit(5)
        
      if (recurringErr) throw recurringErr

      const { data: budgetExpensesData, error: budgetExpenseErr } = await supabase
        .from('transactions')
        .select('amount, category_id')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', firstDayCurrentMonth)
        .lte('date', lastDayCurrentMonth)

      if (budgetExpenseErr) throw budgetExpenseErr

      const { data: budgetsData, error: budgetErr } = await supabase
        .from('budgets')
        .select(`*, categories:category_id (*)`)
        .eq('user_id', user.id)
        .eq('month', currentMonthStr)

      if (budgetErr) throw budgetErr

      let currentIncome = 0
      let currentExpense = 0
      
      periodTxns?.forEach(t => {
        if (t.type === 'income') currentIncome += Number(t.amount)
        if (t.type === 'expense') currentExpense += Number(t.amount)
      })

      let lastIncome = 0
      let lastExpense = 0
      
      prevPeriodTxns?.forEach(t => {
        if (t.type === 'income') lastIncome += Number(t.amount)
        if (t.type === 'expense') lastExpense += Number(t.amount)
      })

      const netBalance = currentIncome - currentExpense
      
      const incomeChange = lastIncome === 0 
        ? (currentIncome > 0 ? 1000000 : 0) 
        : ((currentIncome - lastIncome) / lastIncome) * 100
        
      const expenseChange = lastExpense === 0 
        ? (currentExpense > 0 ? 1000000 : 0) 
        : ((currentExpense - lastExpense) / lastExpense) * 100

      const budgetProgress: BudgetProgress[] = budgetsData?.map(b => {
        const category = b.categories || {}
        const spent = budgetExpensesData
          ?.filter(t => t.category_id === b.category_id)
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0
          
        const limit = Number(b.monthly_limit)
        const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
        
        return {
          categoryName: category.name || 'Unknown',
          categoryIcon: category.icon || 'HelpCircle',
          categoryColor: category.color || '#6B7280',
          spent,
          limit,
          percentage
        }
      }) || []

      setData({
        totalIncome: currentIncome,
        totalExpense: currentExpense,
        netBalance,
        incomeChange,
        expenseChange,
        recentTransactions: recentTxns || [],
        recurringTransactions: recurringList || [],
        budgetProgress,
        isLoading: false,
        isRefetching: false,
        error: null,
        refetch: fetchDashboardData,
        userName,
        activePeriod: activePeriodState,
        customStartDate,
        customEndDate,
        setActivePeriod,
        setCustomStartDate,
        setCustomEndDate,
        periodLabel
      })
      
      setIsFirstLoad(false)
      
    } catch (err: any) {
      setData(prev => ({ ...prev, isLoading: false, isRefetching: false, error: err.message || 'An error occurred fetching dashboard data' }))
    }
  }, [supabase, activePeriodState, customStartDate, customEndDate, periodLabel, isFirstLoad, setActivePeriod])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return data
}
