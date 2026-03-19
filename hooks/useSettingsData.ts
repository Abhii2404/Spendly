import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

export interface NewCategory {
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

export interface Budget {
  id: string
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  monthly_limit: number
  month: string
}

export interface SettingsData {
  categories: Category[]
  isLoading: boolean
  error: string | null
  addCategory: (data: NewCategory) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  isAddingCategory: boolean
  isDeletingCategory: string | null
  addCategoryError: string | null
  refetch: () => void
  userProfile: { name: string, email: string, avatarUrl: string | null } | null
  budgets: Budget[]
  isLoadingBudgets: boolean
  setBudgetLimit: (categoryId: string, limit: number) => Promise<void>
  removeBudgetLimit: (budgetId: string) => Promise<void>
}

export function useSettingsData(): SettingsData {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isDeletingCategory, setIsDeletingCategory] = useState<string | null>(null)
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null)
  
  const [userProfile, setUserProfile] = useState<{ name: string, email: string, avatarUrl: string | null } | null>(null)
  
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(true)

  const supabase = createClient()

  const fetchSettingsData = useCallback(async () => {
    setIsLoading(true)
    setIsLoadingBudgets(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        setIsLoading(false)
        setIsLoadingBudgets(false)
        return
      }

      // Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single()

      setUserProfile({
        name: profile?.name || 'User',
        email: user.email || '',
        avatarUrl: profile?.avatar_url || null
      })

      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('type', { ascending: false }) // Expense then income loosely
        .order('name', { ascending: true })

      if (catError) throw catError
      if (catData) {
        // Sort explicitly by type then alphabetically
        const sorted = catData.sort((a, b) => {
          if (a.type !== b.type) return a.type.localeCompare(b.type)
          return a.name.localeCompare(b.name)
        })
        setCategories(sorted as Category[])
      }

      // Fetch Budgets
      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          id,
          monthly_limit,
          month,
          category_id,
          categories:category_id (name, icon, color)
        `)
        .eq('user_id', user.id)
        .eq('month', currentMonth)

      if (budgetError) throw budgetError
      
      if (budgetData) {
        const formattedBudgets = budgetData.map((b: any) => ({
          id: b.id,
          category_id: b.category_id,
          category_name: b.categories?.name || 'Unknown',
          category_icon: b.categories?.icon || 'CircleDot',
          category_color: b.categories?.color || '#FFFFFF',
          monthly_limit: b.monthly_limit,
          month: b.month
        })).sort((a, b) => a.category_name.localeCompare(b.category_name))
        
        setBudgets(formattedBudgets)
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch settings data')
    } finally {
      setIsLoading(false)
      setIsLoadingBudgets(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSettingsData()
  }, [fetchSettingsData])

  const addCategory = async (data: NewCategory) => {
    setAddCategoryError(null)
    
    if (!data.name.trim()) {
      setAddCategoryError('Category name cannot be empty')
      return
    }
    if (!data.icon) {
      setAddCategoryError('Please select an icon')
      return
    }
    if (!data.color) {
      setAddCategoryError('Please select a color')
      return
    }

    const isDuplicate = categories.some(
      cat => cat.name.toLowerCase() === data.name.trim().toLowerCase() && cat.type === data.type
    )

    if (isDuplicate) {
      setAddCategoryError(`You already have an ${data.type} category named "${data.name.trim()}"`)
      return
    }

    setIsAddingCategory(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('categories').insert({
        user_id: user.id,
        name: data.name.trim(),
        type: data.type,
        icon: data.icon,
        color: data.color
      })

      if (error) throw error
      await fetchSettingsData()
    } catch (err: any) {
      setAddCategoryError(err.message || 'Failed to add category')
    } finally {
      setIsAddingCategory(false)
    }
  }

  const setBudgetLimit = async (categoryId: string, limit: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const currentMonth = new Date().toISOString().slice(0, 7)

      const { error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          category_id: categoryId,
          month: currentMonth,
          monthly_limit: limit
        }, {
          onConflict: 'user_id, category_id, month'
        })

      if (error) throw error
      await fetchSettingsData()
    } catch (err: any) {
      setError(err.message || 'Failed to set budget limit')
      throw err
    }
  }

  const removeBudgetLimit = async (budgetId: string) => {
    try {
      setBudgets(prev => prev.filter(b => b.id !== budgetId))
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)
        .eq('user_id', user.id)

      if (error) {
        await fetchSettingsData()
        throw error
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove budget limit')
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    setError(null)
    setIsDeletingCategory(id)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check transactions
      const { data: txns, error: txnsError, count } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id)
        .eq('user_id', user.id)

      if (txnsError) throw txnsError

      if (count && count > 0) {
         setError(`Cannot delete — ${count} transactions use this category.`)
         setIsDeletingCategory(null)
         return
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete category')
    } finally {
      setIsDeletingCategory(null)
    }
  }

  return {
    categories,
    isLoading,
    error,
    addCategory,
    deleteCategory,
    isAddingCategory,
    isDeletingCategory,
    addCategoryError,
    refetch: fetchSettingsData,
    userProfile,
    budgets,
    isLoadingBudgets,
    setBudgetLimit,
    removeBudgetLimit
  }
}
