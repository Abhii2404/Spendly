import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface PieSlice {
  categoryName: string
  categoryColor: string
  categoryIcon: string
  amount: number
  percentage: number
}

export interface BarMonth {
  month: string
  income: number
  expense: number
}

export interface LinePoint {
  label: string
  value: number
}

export interface AnalyticsData {
  totalIncome: number
  totalExpense: number
  netProfit: number
  pieChartData: PieSlice[]
  barChartData: BarMonth[]
  lineChartData: LinePoint[]
  pieType: 'income' | 'expense'
  barPeriod: 'week' | 'month' | 'quarter'
  linePeriod: 'weekly' | 'monthly' | 'quarterly'
  lineType: 'income' | 'expense'
  setPieType: (t: 'income' | 'expense') => void
  setBarPeriod: (p: 'week' | 'month' | 'quarter') => void
  setLinePeriod: (p: 'weekly' | 'monthly' | 'quarterly') => void
  setLineType: (t: 'income' | 'expense') => void
  isLoading: boolean
  error: string | null
  refetch: () => void
}

interface Transaction {
  amount: number
  type: 'income' | 'expense'
  date: string
  category_id: string
  categories: { name: string, color: string, icon: string }
}

export function useAnalyticsData(): AnalyticsData {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pieType, setPieType] = useState<'income' | 'expense'>('expense')
  const [barPeriod, setBarPeriod] = useState<'week' | 'month' | 'quarter'>('month')
  const [linePeriod, setLinePeriod] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly')
  const [lineType, setLineType] = useState<'income' | 'expense'>('expense')

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

      // We need up to 12 months ago
      const date12MonthsAgo = new Date()
      date12MonthsAgo.setMonth(date12MonthsAgo.getMonth() - 12)
      // Beginning of that month
      date12MonthsAgo.setDate(1)
      const startDateStr = new Date(date12MonthsAgo.getTime() - date12MonthsAgo.getTimezoneOffset() * 60000).toISOString().split('T')[0]

      const { data, error: txnsError } = await supabase
        .from('transactions')
        .select(`amount, type, date, category_id, categories:category_id (name, color, icon)`)
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .order('date', { ascending: true })

      if (txnsError) throw txnsError

      if (data) setTransactions(data as any as Transaction[])

    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const now = new Date()
  
  // Base date helpers
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Summary Metrics
  const summary = useMemo(() => {
    let income = 0
    let expense = 0

    transactions.forEach(t => {
      const d = new Date(t.date)
      const localD = new Date(d.getTime() + d.getTimezoneOffset() * 60000)
      if (localD.getMonth() === currentMonth && localD.getFullYear() === currentYear) {
        if (t.type === 'income') income += Number(t.amount)
        if (t.type === 'expense') expense += Number(t.amount)
      }
    })

    return { totalIncome: income, totalExpense: expense, netProfit: income - expense }
  }, [transactions, currentMonth, currentYear])

  // Pie Chart Data (Current Month)
  const pieChartData = useMemo(() => {
    const categoryTotals: Record<string, { name: string, color: string, icon: string, amount: number }> = {}
    let grandTotal = 0

    transactions.forEach(t => {
      const d = new Date(t.date)
      const localD = new Date(d.getTime() + d.getTimezoneOffset() * 60000)
      if (localD.getMonth() === currentMonth && localD.getFullYear() === currentYear && t.type === pieType) {
        const amt = Number(t.amount)
        const cat = t.categories
        if (!cat) return
        
        if (!categoryTotals[t.category_id]) {
          categoryTotals[t.category_id] = { name: cat.name, color: cat.color, icon: cat.icon, amount: 0 }
        }
        categoryTotals[t.category_id].amount += amt
        grandTotal += amt
      }
    })

    const result: PieSlice[] = Object.values(categoryTotals).map(c => ({
      categoryName: c.name,
      categoryColor: c.color,
      categoryIcon: c.icon,
      amount: c.amount,
      percentage: grandTotal > 0 ? (c.amount / grandTotal) * 100 : 0
    }))

    return result.sort((a, b) => b.amount - a.amount)
  }, [transactions, currentMonth, currentYear, pieType])

  // Bar Chart Data (Last 6 months)
  const barChartData = useMemo(() => {
    const result: BarMonth[] = []
    
    // Generate last 6 months list oldest to newest
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1)
      const monthLabel = d.toLocaleString('en-US', { month: 'short' })
      const yearStr = d.getFullYear()
      const mIdx = d.getMonth()
      
      let inc = 0
      let exp = 0
      
      transactions.forEach(t => {
        const td = new Date(t.date)
        const localTD = new Date(td.getTime() + td.getTimezoneOffset() * 60000)
        if (localTD.getMonth() === mIdx && localTD.getFullYear() === yearStr) {
          if (t.type === 'income') inc += Number(t.amount)
          if (t.type === 'expense') exp += Number(t.amount)
        }
      })
      
      result.push({ month: monthLabel, income: inc, expense: exp })
    }
    return result
  }, [transactions, currentMonth, currentYear])

  // Line Chart Data
  const lineChartData = useMemo(() => {
    const result: LinePoint[] = []

    if (linePeriod === 'weekly') {
      // Last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        startOfWeek.setDate(now.getDate() - now.getDay() - (i * 7)) // Sunday
        startOfWeek.setHours(0,0,0,0)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6) // Saturday
        endOfWeek.setHours(23,59,59,999)
        
        let sum = 0
        transactions.forEach(t => {
          const td = new Date(t.date)
          const localTD = new Date(td.getTime() + td.getTimezoneOffset() * 60000)
          
          if (localTD >= startOfWeek && localTD <= endOfWeek && t.type === lineType) {
            sum += Number(t.amount)
          }
        })

        const label = `W${8-i}`
        result.push({ label, value: sum })
      }
    } else if (linePeriod === 'monthly') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1)
        const monthLabel = d.toLocaleString('en-US', { month: 'short' })
        
        let sum = 0
        transactions.forEach(t => {
          const td = new Date(t.date)
          const localTD = new Date(td.getTime() + td.getTimezoneOffset() * 60000)
          if (localTD.getMonth() === d.getMonth() && localTD.getFullYear() === d.getFullYear() && t.type === lineType) {
            sum += Number(t.amount)
          }
        })
        result.push({ label: monthLabel, value: sum })
      }
    } else if (linePeriod === 'quarterly') {
      // Last 4 quarters
      const getQuarter = (date: Date) => Math.floor(date.getMonth() / 3) + 1
      const currentQ = getQuarter(now)
      
      for (let i = 3; i >= 0; i--) {
        let q = currentQ - i
        let y = currentYear
        while (q <= 0) {
          q += 4
          y -= 1
        }
        
        let sum = 0
        transactions.forEach(t => {
          const td = new Date(t.date)
          const localTD = new Date(td.getTime() + td.getTimezoneOffset() * 60000)
          const tq = getQuarter(localTD)
          if (tq === q && localTD.getFullYear() === y && t.type === lineType) {
            sum += Number(t.amount)
          }
        })
        
        result.push({ label: `Q${q} ${y}`, value: sum })
      }
    }

    return result
  }, [transactions, linePeriod, lineType, now, currentYear, currentMonth])

  return {
    ...summary,
    pieChartData,
    barChartData,
    lineChartData,
    pieType,
    barPeriod,
    linePeriod,
    lineType,
    setPieType,
    setBarPeriod,
    setLinePeriod,
    setLineType,
    isLoading,
    error,
    refetch: fetchTransactions
  }
}
