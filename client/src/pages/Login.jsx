import { useState }    from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login }   = useAuth()
  const navigate    = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs text-gold tracking-widest uppercase mb-3">
            Digital Signature System
          </p>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-lg p-8">

          {error && (
            <div className="bg-rose/10 border border-rose/30 text-rose text-sm
                            font-mono px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-xs text-gray-400
                                tracking-wider uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-panel border border-border rounded px-4 py-3
                           text-white text-sm focus:outline-none focus:border-gold
                           transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-gray-400
                                tracking-wider uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-panel border border-border rounded px-4 py-3
                           text-white text-sm focus:outline-none focus:border-gold
                           transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-bg font-mono font-semibold text-sm
                         tracking-wider uppercase py-3 rounded
                         hover:bg-yellow-400 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}