import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#091428] flex flex-col items-center justify-center p-[20px]">
      <Loader2 className="w-[40px] h-[40px] text-[#6A42E3] animate-spin mb-[16px]" />
      <div className="text-[14px] text-[#6B7280] font-medium">Loading Spendly...</div>
    </div>
  )
}
