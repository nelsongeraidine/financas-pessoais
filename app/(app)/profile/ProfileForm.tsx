'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface ProfileFormProps {
  profile: Profile
  email: string
}

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
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400"
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <hr className="border-gray-200" />
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        Alterar Senha <span className="normal-case font-normal">(deixe em branco para manter)</span>
      </p>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Nova Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar Senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
