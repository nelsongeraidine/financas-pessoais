'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface ProfileFormProps {
  profile: Profile
  email: string
}

const inputCls =
  'w-full rounded-lg px-3 py-2.5 text-sm text-[#e2e2e2] placeholder-[#434655] focus:outline-none focus:ring-1 focus:ring-[#3264FF] transition-colors'
const inputSty = { background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }
const labelCls = 'block text-sm font-medium text-[#c3c5d8] mb-1.5'

export default function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter()
  const [name, setName] = useState(profile.name)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', profile.id)

    if (profileError) {
      setMessage({ type: 'error', text: 'Erro ao salvar nome.' })
      setLoading(false)
      return
    }

    if (password) {
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'As senhas não coincidem.' })
        setLoading(false)
        return
      }
      if (password.length < 6) {
        setMessage({ type: 'error', text: 'A senha deve ter ao menos 6 caracteres.' })
        setLoading(false)
        return
      }
      const { error: pwError } = await supabase.auth.updateUser({ password })
      if (pwError) {
        setMessage({ type: 'error', text: 'Erro ao atualizar senha.' })
        setLoading(false)
        return
      }
    }

    setMessage({ type: 'success', text: 'Perfil atualizado com sucesso.' })
    setPassword('')
    setConfirmPassword('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-md">
      <div>
        <label className={labelCls}>E-mail</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full rounded-lg px-3 py-2.5 text-sm text-[#434655]"
          style={{
            background: '#1a1c1c',
            border: '1px solid rgba(255,255,255,0.05)',
            cursor: 'not-allowed',
          }}
        />
      </div>
      <div>
        <label htmlFor="name" className={labelCls}>Nome</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputCls}
          style={inputSty}
        />
      </div>
      <hr style={{ borderColor: 'rgba(255,255,255,0.07)' }} />
      <p className="text-xs text-[#8d90a1] font-medium uppercase tracking-widest">
        Alterar Senha{' '}
        <span className="normal-case font-normal text-[#434655]">(deixe em branco para manter)</span>
      </p>
      <div>
        <label htmlFor="password" className={labelCls}>Nova Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          style={inputSty}
          placeholder="••••••••"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className={labelCls}>Confirmar Senha</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputCls}
          style={inputSty}
          placeholder="••••••••"
        />
      </div>
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-[#4ade80]' : 'text-[#ffb4ab]'}`}>
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="bg-electric-blue text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)] disabled:opacity-50 transition-all"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
