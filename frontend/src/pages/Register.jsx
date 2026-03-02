import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Check, X, Sparkles } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  
  // Password strength checks
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasDigit = /\d/.test(password)
  const passwordsMatch = password === confirmPassword && password !== ''
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasDigit
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!isPasswordValid) {
      setError('Please meet all password requirements')
      return
    }
    
    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await authAPI.register(email, password)
      const { access_token, user } = response.data
      
      setAuth(user, access_token)
      navigate('/app/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const RequirementCheck = ({ met, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <X className="w-4 h-4 text-gray-300" />
      )}
      <span className={met ? 'text-gray-900' : 'text-gray-500'}>{text}</span>
    </div>
  )
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-semibold text-gray-900">DocIntel AI</span>
        </Link>
        
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
            <p className="text-gray-600">Start your free trial today</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 bg-white"
                  placeholder="you@example.com"
                  autoComplete="off"
                  required
                  autoFocus
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 bg-white"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>
              
              {password && (
                <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-2">
                  <RequirementCheck met={hasMinLength} text="At least 8 characters" />
                  <RequirementCheck met={hasUpperCase} text="One uppercase letter" />
                  <RequirementCheck met={hasLowerCase} text="One lowercase letter" />
                  <RequirementCheck met={hasDigit} text="One number" />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 bg-white"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                />
              </div>
              {confirmPassword && (
                <div className="mt-2">
                  {passwordsMatch ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Passwords match</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <X className="w-4 h-4" />
                      <span>Passwords don't match</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-gray-900 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
