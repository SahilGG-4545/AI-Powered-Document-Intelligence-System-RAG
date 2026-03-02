import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }
  
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-700" />
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900">{user?.email}</div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="btn btn-secondary flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  )
}
