'use client'

import { Plus } from 'lucide-react'
import { useModal } from '@/context/ModalContext'
import React, { useState } from 'react'

export default React.memo(function FABButton() {
  const { isAddTransactionOpen, openAddTransaction } = useModal()
  const [isHovered, setIsHovered] = useState(false)

  // Determine glow based on state
  const shadow = isHovered 
    ? '0 0 25px rgba(106, 66, 227, 0.6), 0 0 50px rgba(106, 66, 227, 0.3)'
    : '0 0 20px rgba(106, 66, 227, 0.5), 0 0 40px rgba(106, 66, 227, 0.2)'

  return (
    <button
      onClick={openAddTransaction}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group fixed bottom-[80px] left-1/2 -translate-x-1/2 lg:bottom-[32px] lg:left-[auto] lg:right-[32px] lg:translate-x-0 w-[56px] h-[56px] bg-[#6A42E3] rounded-full flex items-center justify-center z-[51] flex-shrink-0 border-none cursor-pointer hover:brightness-110 active:scale-95 transition-all duration-100 ease-out"
      style={{ boxShadow: shadow }}
      aria-label="Add Transaction"
    >
      <Plus 
        color="#FFFFFF" 
        size={24} 
        className={`transition-transform duration-300 ease-out ${
          isAddTransactionOpen ? 'rotate-45' : 'group-hover:rotate-90'
        }`}
      />
    </button>
  )
})
