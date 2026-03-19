import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { seedCategories } from '@/lib/supabase/seedCategories'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: string
}

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
  error: string | null
  refetch: () => void
  userName: string
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
    error: null,
    refetch: () => {},
    userName: ''
  })
  
  const supabase = createClient()

  const fetchDashboardData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setData(prev => ({ ...prev, isLoading: false, error: 'User not authenticated' }))
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

      const { data: currentMonthTxns, error: currentTxnError } = await supabase
        .from('transactions')
        .select(`*, categories:category_id (*)`)
        .eq('user_id', user.id)
        .gte('date', firstDayCurrentMonth)
        .lte('date', lastDayCurrentMonth)

      if (currentTxnError) throw currentTxnError

      const { data: lastMonthTxns, error: lastTxnError } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .gte('date', firstDayLastMonth)
        .lte('date', lastDayLastMonth)

      if (lastTxnError) throw lastTxnError

      const { data: recentTxns, error: recentErr } = await supabase
        .from('transactions')
        .select(`*, categories:category_id (*)`)
        .eq('user_id', user.id)
        .eq('is_recurring', false)
        .order('date', { ascending: false })
        .limit(5)
        
      if (recentErr) throw recentErr

      const { data: recurringList, error: recurringErr } = await supabase
        .from('transactions')
        .select(`*, categories:category_id (*)`)
        .eq('user_id', user.id)
        .eq('is_recurring', true)
        .order('date', { ascending: false })
        .limit(5)
        
      if (recurringErr) throw recurringErr

      const { data: budgetsData, error: budgetErr } = await supabase
        .from('budgets')
        .select(`*, categories:category_id (*)`)
        .eq('user_id', user.id)
        .eq('month', currentMonthStr)

      if (budgetErr) throw budgetErr

      let currentIncome = 0
      let currentExpense = 0
      
      currentMonthTxns?.forEach(t => {
        if (t.type === 'income') currentIncome += Number(t.amount)
        if (t.type === 'expense') currentExpense += Number(t.amount)
      })

      let lastIncome = 0
      let lastExpense = 0
      
      lastMonthTxns?.forEach(t => {
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

      const currentMonthExpenses = currentMonthTxns?.filter(t => t.type === 'expense') || []
      
      const budgetProgress: BudgetProgress[] = budgetsData?.map(b => {
        const category = b.categories || {}
        const spent = currentMonthExpenses
          .filter(t => t.category_id === b.category_id)
          .reduce((sum, t) => sum + Number(t.amount), 0)
          
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
        error: null,
        refetch: fetchDashboardData,
        userName
      })
      
    } catch (err: any) {
      setData(prev => ({ ...prev, isLoading: false, error: err.message || 'An error occurred fetching dashboard data' }))
    }
  }, [supabase])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return data
}
