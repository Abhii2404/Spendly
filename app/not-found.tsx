import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#091428] flex flex-col items-center justify-center p-[20px] text-center">
      <div className="text-[80px] font-[800] text-[#6A42E3] leading-none mb-[16px]">404</div>
      <h1 className="text-[20px] font-bold text-white mb-[8px]">Page not found</h1>
      <p className="text-[14px] text-[#6B7280] mb-[32px] max-w-[260px]">
        The page you're looking for doesn't exist.
      </p>
      <Link 
        href="/dashboard"
        className="px-[32px] py-[14px] bg-[#6A42E3] text-white rounded-full font-semibold hover:bg-[#5b36c4] transition-colors"
      >
        Go Home
      </Link>
    </div>
  )
}
