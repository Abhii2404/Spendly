import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ModalProvider } from '@/context/ModalContext'
import { RefetchProvider } from '@/context/RefetchContext'
import BottomNav from '@/components/layout/BottomNav'
import FABButton from '@/components/layout/FABButton'
import AddTransactionModal from '@/components/transactions/AddTransactionModal'
import Sidebar from '@/components/layout/Sidebar'
import DesktopHeader from '@/components/layout/DesktopHeader'

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
        <div className="min-h-screen bg-[#091428] relative flex">
          
          <Sidebar />
          <DesktopHeader />
          
          <main className="flex-1 w-full lg:ml-[260px] lg:pt-[64px] transition-all duration-300">
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
