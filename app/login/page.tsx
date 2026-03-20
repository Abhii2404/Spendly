'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Asterisk, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (error) setError(null)
  }, [email, password])
  
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      setError('Google sign-in failed. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Invalid email or password')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#091428] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Radial Glow */}
      <div 
        className="absolute w-[600px] h-[600px] -top-[150px] left-1/2 -translate-x-1/2 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(106,66,227,0.15), transparent 70%)' }}
      />
      
      {/* Card */}
      <div 
        className={`w-full max-w-sm mx-auto p-8 rounded-[24px] relative z-10 transition-all duration-400 ease-out flex flex-col ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.04)', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-7">
          <Asterisk color="#6A42E3" size={28} />
          <span className="font-extrabold text-[24px] text-white tracking-tight">Spendly</span>
        </div>

        {/* Heading Section */}
        <div className="mb-6">
          <h1 className="font-bold text-[20px] text-white mb-1">Welcome back</h1>
          <p className="font-normal text-[#6B7280] text-[14px]">Track your finances with Spendly</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-[12px] text-[#6B7280] font-medium mb-[6px]">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-[#1A1A23] border border-white/10 rounded-[12px] px-4 py-[14px] text-white text-[14px] placeholder:text-[#6B7280] focus:border-[#6A42E3] focus:ring-[3px] focus:ring-[#6A42E3]/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[12px] text-[#6B7280] font-medium mb-[6px]">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#1A1A23] border border-white/10 rounded-[12px] px-4 py-[14px] text-white text-[14px] placeholder:text-[#6B7280] focus:border-[#6A42E3] focus:ring-[3px] focus:ring-[#6A42E3]/20 focus:outline-none transition-all"
              />
            </div>
          </div>
          
          {error && (
            <div className="flex items-center gap-[6px] text-[#F86161] text-[12px] mt-4 mb-[-8px]">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#6A42E3] text-white font-semibold text-[15px] rounded-full p-[14px] mt-6 hover:brightness-110 active:scale-[0.98] transition-all duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-[24px]">
          <div className="h-[1px] flex-1 bg-[rgba(255,255,255,0.08)]"></div>
          <span className="text-[12px] text-[#6B7280]">or continue with</span>
          <div className="h-[1px] flex-1 bg-[rgba(255,255,255,0.08)]"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full flex items-center justify-center gap-[10px] p-[13px] rounded-full transition-all duration-150 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          onMouseOver={(e) => {
             if (e.currentTarget.disabled) return;
             e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
             e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          }}
          onMouseOut={(e) => {
             if (e.currentTarget.disabled) return;
             e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
             e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
          }}
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="animate-spin text-[#FFFFFF]" size={18} />
              <span className="text-[14px] font-[600] text-[#FFFFFF]">Redirecting...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-[14px] font-[600] text-[#FFFFFF]">Continue with Google</span>
            </>
          )}
        </button>

        <div className="mt-[24px] text-center text-[13px] text-[#6B7280]">
          <Link href="/signup" className="text-[#6A42E3] font-semibold hover:underline">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
