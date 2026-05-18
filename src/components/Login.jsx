import { useState } from 'react'
import { Car, Lock, User, Shield, Building2 } from 'lucide-react'

const COMPANY_DEMO_EMAIL = 'admin@riyadhrentals.com'
const MASTER_DEMO_EMAIL = 'master@platform.com'

export default function Login({ onBack, onLogin }) {
  const [accountType, setAccountType] = useState('company')
  const [email, setEmail] = useState(COMPANY_DEMO_EMAIL)
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const switchType = (type) => {
    setAccountType(type)
    setEmail(type === 'master' ? MASTER_DEMO_EMAIL : COMPANY_DEMO_EMAIL)
    setPassword('demo123')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    setIsSubmitting(true)

    try {
      await onLogin({
        accountType,
        email,
        password,
      })
    } catch (loginError) {
      setError(loginError.message || 'Incorrect email or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-screen w-screen flex bg-slate-900">
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-900 text-white items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Car size={40} />
            </div>
            <div className="text-3xl font-bold">Fleet Tracker</div>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Track every car. Every customer. Every kilometer.
          </h1>
          <p className="text-blue-100 text-lg">
            One fleet platform for rental, transport, logistics, and delivery businesses.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 text-sm">
            <Feature title="Live tracking" desc="Real-time GPS for every vehicle" />
            <Feature title="Templates" desc="Pre-made setups for each business type" />
            <Feature title="Geofences" desc="Zone restrictions & alerts" />
            <Feature title="Maintenance" desc="Service & oil change reminders" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl"
        >
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-blue-600 hover:underline mb-6"
            >
              ← Back to site
            </button>
          )}
          <div className="md:hidden flex items-center gap-2 mb-6 text-slate-900">
            <Car size={28} />
            <span className="text-2xl font-bold">Fleet Tracker</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-5">Sign in to your dashboard</p>

          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => switchType('company')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                accountType === 'company'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 size={14} />
              Company
            </button>
            <button
              type="button"
              onClick={() => switchType('master')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                accountType === 'master'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield size={14} />
              Master
            </button>
          </div>

          <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
          <div className="relative mb-4">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="you@company.com"
            />
          </div>

          <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
          <div className="relative mb-2">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-xs mb-6 mt-2">
            <label className="flex items-center gap-1.5 text-slate-600">
              <input type="checkbox" defaultChecked className="rounded" />
              Remember me
            </label>
            <a href="#" className="text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="text-center text-xs text-slate-500 mt-6">
            Seeded demo credentials are pre-filled. New trial accounts now use the backend
            database and session cookie.
          </div>
        </form>
      </div>
    </div>
  )
}

function Feature({ title, desc }) {
  return (
    <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
      <div className="font-semibold mb-0.5">{title}</div>
      <div className="text-xs text-blue-100">{desc}</div>
    </div>
  )
}
