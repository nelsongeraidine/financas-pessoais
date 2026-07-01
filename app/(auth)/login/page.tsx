'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-space-deep"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(50,100,255,0.15), transparent)',
      }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-10 backdrop-blur-xl"
        style={{ background: '#121224', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex justify-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="NGG" style={{ width: 140, objectFit: 'contain' }} />
        </div>
        <h1 className="text-xl font-semibold text-starlight mb-1 text-center">
          Bem-vindo de volta
        </h1>
        <p className="text-[#8d90a1] text-sm mb-6 text-center">Entre com sua conta</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#c3c5d8] mb-1.5">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-[#e2e2e2] placeholder-[#434655] focus:outline-none focus:ring-1 focus:ring-[#3264FF] transition-colors"
              style={{ background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#c3c5d8] mb-1.5">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-[#e2e2e2] placeholder-[#434655] focus:outline-none focus:ring-1 focus:ring-[#3264FF] transition-colors"
              style={{ background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-[#ffb4ab] text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-electric-blue text-white py-2.5 rounded-lg text-sm font-medium hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)] disabled:opacity-50 transition-all mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
