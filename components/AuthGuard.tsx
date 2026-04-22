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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-6 text-center">Smart Tech — Termos</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 text-sm"
            />
          )}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
        <button
          onClick={handleGoogle}
          className="mt-3 w-full border py-2 rounded text-sm hover:bg-gray-50"
        >
          Entrar com Google
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          {mode === 'signin' ? (
            <>Não tem conta?{' '}
              <button onClick={() => setMode('signup')} className="text-blue-600 hover:underline">Criar conta</button>
            </>
          ) : (
            <>Já tem conta?{' '}
              <button onClick={() => setMode('signin')} className="text-blue-600 hover:underline">Entrar</button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
