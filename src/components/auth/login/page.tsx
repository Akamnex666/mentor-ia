// components/LoginForm.tsx
import { useState, FormEvent } from 'react'
import { useAuth } from '@/context/authContext'
import { AuthMode, Message, LoginFormProps } from '@/types/auth'

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<Message>({ type: '', content: '' })
  const [mode, setMode] = useState<AuthMode>('login')

  const { login, signUp, resetPassword } = useAuth()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: '', content: '' })

    try {
      let result

      if (mode === 'login') {
        result = await login(email, password)
      } else if (mode === 'signup') {
        result = await signUp(email, password, {
          full_name: 'Usuario'
        })
      } else if (mode === 'forgot') {
        result = await resetPassword(email)
        if (!result.error) {
          setMessage({
            type: 'success',
            content: 'Revisa tu email para restablecer tu contraseña'
          })
        }
        return
      }

      if (result.error) {
        throw result.error
      }

      if (mode === 'signup' && result.data.user && !result.data.user.identities?.length) {
        setMessage({
          type: 'success',
          content: '¡Registro exitoso! Revisa tu email para confirmar tu cuenta.'
        })
      }

      if (onSuccess && mode === 'login') {
        onSuccess()
      }

    } catch (error: any) {
      setMessage({
        type: 'error',
        content: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'login' && 'Inicia sesión en tu cuenta'}
            {mode === 'signup' && 'Crea tu cuenta'}
            {mode === 'forgot' && 'Recupera tu contraseña'}
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {message.content && (
            <div
              className={`rounded-md p-4 ${
                message.type === 'error' 
                  ? 'bg-red-50 text-red-700' 
                  : 'bg-green-50 text-green-700'
              }`}
            >
              {message.content}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Cargando...' : 
                mode === 'login' ? 'Iniciar sesión' :
                mode === 'signup' ? 'Registrarse' :
                'Enviar instrucciones'
              }
            </button>
          </div>

          <div className="flex flex-col space-y-2 text-sm">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  ¿No tienes cuenta? Regístrate
                </button>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </>
            )}
            
            {mode === 'signup' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-indigo-600 hover:text-indigo-500"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            )}
            
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Volver al inicio de sesión
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}