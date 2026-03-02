import { useState, useEffect } from 'react'
import { chatAPI } from '../services/api'
import { History as HistoryIcon, Trash2, MessageSquare, FileText, Clock } from 'lucide-react'

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadHistory()
  }, [])
  
  const loadHistory = async () => {
    try {
      const response = await chatAPI.getHistory()
      setHistory(response.data.history)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all chat history?')) return
    
    try {
      await chatAPI.clearHistory()
      setHistory([])
    } catch (error) {
      console.error('Failed to clear history:', error)
      alert('Failed to clear history. Please try again.')
    }
  }
  
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat History</h1>
          <p className="text-gray-600">View your past conversations</p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="btn btn-danger flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton h-32"></div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="card text-center py-12">
          <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No chat history</h3>
          <p className="text-gray-600 mb-4">Your conversations will appear here</p>
          <a href="/chat" className="btn btn-primary">
            Start Chatting
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="card hover:shadow-md transition-shadow">
              {/* Question */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">Question</p>
                  <p className="text-gray-700">{item.question}</p>
                </div>
              </div>
              
              {/* Answer */}
              <div className="flex items-start gap-4 mb-4 pl-12">
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">Answer</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{item.answer}</p>
                  
                  {item.sources && item.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Sources ({item.sources.length})
                      </p>
                      <div className="space-y-2">
                        {item.sources.map((source, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <FileText className="w-4 h-4 text-primary-600" />
                            <span>
                              {source.filename} - Page {source.page_number}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Timestamp */}
              <div className="flex items-center gap-2 text-sm text-gray-500 pl-12">
                <Clock className="w-4 h-4" />
                {new Date(item.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
