import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function seedTestData() {
  console.log('Seeding test data...')
  
  // 1. Sign up/in
  let { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'testuser2@spendly.com',
    password: 'password123'
  })
  
  if (signInError) {
    console.log('User not found, attempting sign up...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'testuser2@spendly.com',
      password: 'password123'
    })
    if (signUpError) throw signUpError
    user = signUpData.user
  }

  
  console.log('User authenticated:', user.id)
  
  // Ensure profile exists
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) {
    await supabase.from('profiles').insert({ id: user.id, name: 'Test User' })
  }

  // 2. Default categories (simulate what useDashboardData does)
  const defaultCategories = [
    { name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#F86161' },
    { name: 'Shopping', type: 'expense', icon: 'ShoppingCart', color: '#6A42E3' },
    { name: 'Subscriptions', type: 'expense', icon: 'Youtube', color: '#E7BE29' },
    { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#42E3D0' }
  ]

  for (const cat of defaultCategories) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', cat.name)
      .single()
      
    if (!existing) {
      await supabase.from('categories').insert({
        user_id: user.id,
        ...cat
      })
    }
  }

  // 3. Fetch categories
  const { data: categories, error: catErr } = await supabase.from('categories').select('*').eq('user_id', user.id)
  if (catErr) console.error('Category Fetch Error:', catErr)
  
  const getCatId = (name) => (categories || []).find(c => c.name === name)?.id

  const today = new Date().toISOString().split('T')[0]

  // 4. Insert Transactions
  console.log('Inserting transactions...')
  await supabase.from('transactions').delete().eq('user_id', user.id) // clean up first
  
  const transactions = [
    {
      user_id: user.id,
      name: 'Monthly Salary',
      amount: 50000,
      type: 'income',
      category_id: getCatId('Salary'),
      date: today,
      is_recurring: true,
      recurring_frequency: 'monthly'
    },
    {
      user_id: user.id,
      name: 'Grocery Shopping',
      amount: 2500,
      type: 'expense',
      category_id: getCatId('Food & Dining'),
      date: today,
      is_recurring: false
    },
    {
      user_id: user.id,
      name: 'Netflix',
      amount: 649,
      type: 'expense',
      category_id: getCatId('Subscriptions'),
      date: today,
      is_recurring: true,
      recurring_frequency: 'monthly'
    }
  ]

  const { error: txErr } = await supabase.from('transactions').insert(transactions)
  if (txErr) console.error('Transactions Error:', txErr)

  // 5. Insert Budget
  console.log('Inserting budget...')
  await supabase.from('budgets').delete().eq('user_id', user.id)
  
  const now = new Date()
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const { error: bErr } = await supabase.from('budgets').insert({
    user_id: user.id,
    category_id: getCatId('Food & Dining'),
    monthly_limit: 5000,
    month: monthStr
  })
  
  if (bErr) console.error('Budget Error:', bErr)

  console.log('Test data setup complete!')
}

seedTestData().catch(console.error)
