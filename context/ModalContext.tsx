'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ModalContextType {
  isAddTransactionOpen: boolean
  openAddTransaction: () => void
  closeAddTransaction: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)

  const openAddTransaction = () => setIsAddTransactionOpen(true)
  const closeAddTransaction = () => setIsAddTransactionOpen(false)

  return (
    <ModalContext.Provider value={{ isAddTransactionOpen, openAddTransaction, closeAddTransaction }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
