import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ModalProvider } from '@/context/ModalContext'
import { RefetchProvider } from '@/context/RefetchContext'
import BottomNav from '@/components/layout/BottomNav'
import FABButton from '@/components/layout/FABButton'
import AddTransactionModal from '@/components/transactions/AddTransactionModal'

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <ModalProvider>
      <RefetchProvider>
        <div className="min-h-screen bg-[#091428] relative">
          <main className="pb-24">
            {children}
          </main>
          
          <FABButton />
          <BottomNav />
          <AddTransactionModal />
        </div>
      </RefetchProvider>
    </ModalProvider>
  )
}
