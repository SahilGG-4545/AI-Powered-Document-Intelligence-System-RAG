import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { documentsAPI } from '../services/api'
import { FileText, TrendingUp, Database, Clock } from 'lucide-react'

// Helper function to clean filename (remove UUID prefix)
const getCleanFilename = (filename) => {
  if (!filename) return ''
  return filename.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i, '')
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])
  
  const loadData = async () => {
    try {
      const [statsRes, docsRes] = await Promise.all([
        documentsAPI.getStats(),
        documentsAPI.getAll()
      ])
      
      setStats(statsRes.data)
      setRecentDocs(docsRes.data.documents.slice(0, 5))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const statCards = [
    {
      icon: FileText,
      label: 'Total Documents',
      value: stats?.total_documents || 0,
      color: 'bg-gray-900',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-900'
    },
    {
      icon: Database,
      label: 'Total Pages',
      value: stats?.total_pages || 0,
      color: 'bg-primary-600',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700'
    },
    {
      icon: TrendingUp,
      label: 'Text Chunks',
      value: stats?.total_chunks || 0,
      color: 'bg-accent-600',
      bgColor: 'bg-accent-50',
      textColor: 'text-accent-700'
    },
  ]
  
  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton h-32"></div>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your document intelligence system</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Documents */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Documents</h2>
          <Link to="/app/documents" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        {recentDocs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600 mb-4">Upload your first document to get started</p>
            <Link to="/app/documents" className="btn btn-primary">
              Upload Document
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{getCleanFilename(doc.filename)}</h3>
                    <p className="text-sm text-gray-500">{doc.page_count} pages</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {new Date(doc.upload_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link to="/app/chat" className="card hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">💬</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Start Chatting</h3>
          <p className="text-gray-600">Ask questions about your documents and get instant answers</p>
        </Link>
        
        <Link to="/app/documents" className="card hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">📁</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Documents</h3>
          <p className="text-gray-600">Upload, view, and organize your document library</p>
        </Link>
      </div>
    </div>
  )
}
