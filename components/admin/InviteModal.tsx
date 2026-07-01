'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inviteSchema, type InviteFormData } from '@/lib/schemas'

interface InviteModalProps {
  onClose: () => void
}

const inputCls =
  'w-full rounded-lg px-3 py-2.5 text-sm text-[#e2e2e2] placeholder-[#434655] focus:outline-none focus:ring-1 focus:ring-[#3264FF] transition-colors'
const inputSty = { background: '#1a1c1c', border: '1px solid rgba(255,255,255,0.1)' }
const labelCls = 'block text-sm font-medium text-[#c3c5d8] mb-1.5'

export default function InviteModal({ onClose }: InviteModalProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({ resolver: zodResolver(inviteSchema) })

  async function onSubmit(data: InviteFormData) {
    setServerError(null)
    const response = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const { error } = await response.json()
      setServerError(error ?? 'Erro ao enviar convite.')
      return
    }
    setSuccess(true)
    setTimeout(() => { onClose(); router.refresh() }, 1500)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-6"
        style={{ background: '#1e2020', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-starlight">Convidar Membro</h2>
          <button
            onClick={onClose}
            className="text-[#8d90a1] hover:text-[#e2e2e2] transition-colors"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>
        {success ? (
          <p className="text-[#4ade80] text-sm text-center py-4">Convite enviado com sucesso!</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className={labelCls}>Nome</label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className={inputCls}
                style={inputSty}
                placeholder="Maria Silva"
              />
              {errors.name && (
                <p className="text-[#ffb4ab] text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className={labelCls}>E-mail</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={inputCls}
                style={inputSty}
                placeholder="maria@email.com"
              />
              {errors.email && (
                <p className="text-[#ffb4ab] text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            {serverError && <p className="text-[#ffb4ab] text-sm">{serverError}</p>}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg text-sm text-[#3264FF] hover:bg-[rgba(50,100,255,0.08)] transition-all"
                style={{ border: '1px solid #3264FF' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-electric-blue text-white py-2.5 rounded-lg text-sm font-medium hover:brightness-110 hover:shadow-[0_0_20px_rgba(50,100,255,0.3)] disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Convite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
