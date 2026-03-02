import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, FileText, History, Sparkles } from 'lucide-react'

export default function Sidebar() {
  const navItems = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/app/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/app/documents', icon: FileText, label: 'Documents' },
    { to: '/app/history', icon: History, label: 'History' },
  ]
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">DocIntel AI</h1>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Need Help?</h3>
          <p className="text-xs text-gray-600 mb-3">
            Check our documentation
          </p>
          <button className="text-xs text-gray-900 font-medium hover:underline">
            Learn More →
          </button>
        </div>
      </div>
    </aside>
  )
}
