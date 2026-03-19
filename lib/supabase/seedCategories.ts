import { SupabaseClient } from '@supabase/supabase-js'

export async function seedCategories(supabase: SupabaseClient, userId: string) {
  const { count, error: countError } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countError) {
    return false
  }

  if (count && count > 0) {
    return true
  }

  const defaultCategories = [
    { name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#F86161', type: 'expense' },
    { name: 'Transport', icon: 'Car', color: '#42E3D0', type: 'expense' },
    { name: 'Shopping', icon: 'ShoppingBag', color: '#E7BE29', type: 'expense' },
    { name: 'Health', icon: 'Heart', color: '#F97316', type: 'expense' },
    { name: 'Entertainment', icon: 'Tv', color: '#A855F7', type: 'expense' },
    { name: 'Bills & Utilities', icon: 'Zap', color: '#06B6D4', type: 'expense' },
    { name: 'Travel', icon: 'Plane', color: '#3B82F6', type: 'expense' },
    { name: 'Education', icon: 'BookOpen', color: '#10B981', type: 'expense' },
    { name: 'Subscriptions', icon: 'RefreshCw', color: '#8B5CF6', type: 'expense' },
    { name: 'Other', icon: 'MoreHorizontal', color: '#6B7280', type: 'expense' },
    { name: 'Salary', icon: 'Briefcase', color: '#42E3D0', type: 'income' },
    { name: 'Freelance', icon: 'Laptop', color: '#6A42E3', type: 'income' },
    { name: 'Investments', icon: 'TrendingUp', color: '#E7BE29', type: 'income' },
    { name: 'Rental', icon: 'Home', color: '#F97316', type: 'income' },
    { name: 'Gifts', icon: 'Gift', color: '#F86161', type: 'income' },
    { name: 'Other', icon: 'MoreHorizontal', color: '#6B7280', type: 'income' },
  ]

  const recordsToInsert = defaultCategories.map(cat => ({
    ...cat,
    user_id: userId
  }))

  const { error: insertError } = await supabase
    .from('categories')
    .insert(recordsToInsert)

  if (insertError) {
    return false
  }

  return true
}
