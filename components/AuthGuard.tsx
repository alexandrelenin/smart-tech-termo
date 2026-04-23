import { useEffect, useState } from 'react'
import { authClient } from '../lib/auth-client'

interface Props {
  children: React.ReactNode
}

export default function AuthGuard({ children }: Props) {
  const { data: session, isPending } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="text-white/40">Carregando...</div>
      </div>
    )
  }

  if (session) return <>{children}</>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        const res = await authClient.signIn.email({ email, password })
        if (res.error) setError(res.error.message ?? 'Erro ao entrar')
      } else {
        const res = await authClient.signUp.email({ email, password, name })
        if (res.error) setError(res.error.message ?? 'Erro ao criar conta')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await authClient.signIn.social({ provider: 'google', callbackURL: '/' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080808]">
      <div className="bg-[#111111] p-8 rounded-2xl shadow-2xl border border-white/10 w-full max-w-sm">
        <h1 className="text-xl font-black mb-6 text-center text-white">Smart Tech — Termos</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red-600"
            />
          )}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red-600"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red-600"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-sm font-black disabled:opacity-50"
          >
            {loading ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
        <div className="relative my-4">
          <div className="border-t border-white/10" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-[#111111] px-2 text-white/30 text-xs">ou</span>
        </div>
        <button
          onClick={handleGoogle}
          aria-label="Entrar com Google"
          className="mt-3 w-full bg-white border border-white/20 text-gray-700 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-3 hover:bg-gray-100 active:scale-95 transition-transform"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Entrar com Google
        </button>
        <p className="mt-4 text-center text-sm text-white/40">
          {mode === 'signin' ? (
            <>Não tem conta?{' '}
              <button onClick={() => setMode('signup')} className="text-red-500 hover:text-red-400 hover:underline">Criar conta</button>
            </>
          ) : (
            <>Já tem conta?{' '}
              <button onClick={() => setMode('signin')} className="text-red-500 hover:text-red-400 hover:underline">Entrar</button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
