'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Asterisk, AlertCircle, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (error) setError(null)
  }, [fullName, email, password, confirmPassword])
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('already registered')) {
        setError('An account with this email already exists')
      } else {
        setError(signUpError.message)
      }
      setIsLoading(false)
      return
    }

    const user = signUpData.user

    if (!user) {
      setError('Error creating user account')
      setIsLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: user.id, name: fullName })

    if (profileError) {
      setError('Account created, but failed to set profile name. Please contact support.')
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
          <h1 className="font-bold text-[20px] text-white mb-1">Create your account</h1>
          <p className="font-normal text-[#6B7280] text-[14px]">Start tracking your finances today</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="fullName" className="block text-[12px] text-[#6B7280] font-medium mb-[6px]">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-[#1A1A23] border border-white/10 rounded-[12px] px-4 py-[14px] text-white text-[14px] placeholder:text-[#6B7280] focus:border-[#6A42E3] focus:ring-[3px] focus:ring-[#6A42E3]/20 focus:outline-none transition-all"
              />
            </div>
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
                placeholder="Create a password"
                className="w-full bg-[#1A1A23] border border-white/10 rounded-[12px] px-4 py-[14px] text-white text-[14px] placeholder:text-[#6B7280] focus:border-[#6A42E3] focus:ring-[3px] focus:ring-[#6A42E3]/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-[12px] text-[#6B7280] font-medium mb-[6px]">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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
                <span>Creating account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-[13px] text-[#6B7280]">
          <Link href="/login" className="text-[#6A42E3] font-semibold hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
