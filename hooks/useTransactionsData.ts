import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export type FilterPeriod = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'

interface Category {
  id: string
  name: string
  icon: string
  color: string
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
  categories: Category
}

export interface TransactionsState {
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  activeFilter: FilterPeriod
  typeFilter: 'all' | 'income' | 'expense'
  categoryFilter: string
  activeTab: 'one-time' | 'recurring'
  setSearchQuery: (q: string) => void
  setActiveFilter: (f: FilterPeriod) => void
  setTypeFilter: (t: 'all' | 'income' | 'expense') => void
  setCategoryFilter: (c: string) => void
  setActiveTab: (t: 'one-time' | 'recurring') => void
  deleteTransaction: (id: string) => void
  refetch: () => void
  totalIncomeThisMonth: number
  totalExpenseThisMonth: number
  categoriesList: Category[]
}

export function useTransactionsData(): TransactionsState {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categoriesList, setCategoriesList] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterPeriod>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'one-time' | 'recurring'>('one-time')

  const supabase = createClient()

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        setIsLoading(false)
        return
      }

      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id, name, icon, color')
        .eq('user_id', user.id)
        .order('name')
        
      if (catError) throw catError
      if (catData) setCategoriesList(catData)

      // Fetch all transactions
      const { data: txns, error: txnsError } = await supabase
        .from('transactions')
        .select(`*, categories:category_id (*)`)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (txnsError) throw txnsError

      if (txns) setTransactions(txns as unknown as Transaction[])

    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const deleteTransaction = async (id: string) => {
    const backup = [...transactions]
    setTransactions(prev => prev.filter(t => t.id !== id))
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        
      if (error) throw error
    } catch (err: any) {
      setTransactions(backup)
      setError('Failed to delete transaction')
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Tab filter
      const isRecurring = activeTab === 'recurring'
      if (t.is_recurring !== isRecurring) return false

      // 2. Search filter
      if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false

      // 3. Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) return false

      // 4. Category filter
      if (categoryFilter && t.category_id !== categoryFilter) return false

      // 5. Period filter
      const txnDate = new Date(t.date)
      // Normalizing Dates to compare properly against YYYY-MM-DD
      const now = new Date()
      // Adjust to local timezone ISO string correctly if needed, or simply string compare
      const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0]
      
      if (activeFilter === 'today') {
        if (t.date !== todayStr) return false
      } else if (activeFilter === 'week') {
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        if (txnDate < weekAgo) return false
      } else if (activeFilter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        if (txnDate < startOfMonth) return false
      } else if (activeFilter === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        if (txnDate < startOfYear) return false
      }
      
      return true
    })
  }, [transactions, activeTab, searchQuery, typeFilter, categoryFilter, activeFilter])

  const currentMonthData = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    
    let inc = 0
    let exp = 0
    
    transactions.forEach(t => {
      if (t.date >= startOfMonth) {
        if (t.type === 'income') inc += Number(t.amount)
        if (t.type === 'expense') exp += Number(t.amount)
      }
    })
    
    return { inc, exp }
  }, [transactions])

  return {
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
    refetch: fetchTransactions,
    totalIncomeThisMonth: currentMonthData.inc,
    totalExpenseThisMonth: currentMonthData.exp,
    categoriesList
  }
}
