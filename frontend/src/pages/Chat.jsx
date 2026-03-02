import { useState, useEffect, useRef } from 'react'
import { chatAPI, documentsAPI } from '../services/api'
import { Send, Bot, User, FileText, Sparkles, AlertCircle, Plus, MessageSquare, Clock, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function Chat() {
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef(null)
  
  // Helper function to clean filename (remove UUID prefix)
  const getCleanFilename = (filename) => {
    return filename.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i, '')
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  useEffect(() => {
    // Load available documents and sessions
    const loadData = async () => {
      try {
        const [docsRes, sessionsRes] = await Promise.all([
          documentsAPI.getAll(),
          chatAPI.getSessions()
        ])
        setDocuments(docsRes.data.documents)
        setSessions(sessionsRes.data.sessions)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [])
  
  const createNewSession = () => {
    setCurrentSessionId(null)
    setMessages([])
    setShowHistory(false)
  }
  
  const loadSession = async (sessionId) => {
    try {
      const response = await chatAPI.getSessionHistory(sessionId)
      const history = response.data.history
      
      // Convert history to messages format
      const msgs = []
      history.forEach(item => {
        msgs.push({
          role: 'user',
          content: item.question,
          timestamp: new Date(item.timestamp)
        })
        msgs.push({
          role: 'assistant',
          content: item.answer,
          sources: item.sources,
          timestamp: new Date(item.timestamp)
        })
      })
      
      setMessages(msgs)
      setCurrentSessionId(sessionId)
      setShowHistory(false)
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    
    try {
      const response = await chatAPI.query(input, currentSessionId)
      
      // Update session ID if new
      if (!currentSessionId) {
        setCurrentSessionId(response.data.session_id)
        // Reload sessions
        const sessionsRes = await chatAPI.getSessions()
        setSessions(sessionsRes.data.sessions)
      }
      
      const assistantMessage = {
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        role: 'error',
        content: 'Failed to get response. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }
  
  const suggestedQuestions = [
    "What are the main topics covered in my documents?",
    "Can you summarize the key findings?",
    "What information is available about [specific topic]?",
    "Compare different sections of the documents"
  ]
  
  const getSessionTitle = (session) => {
    if (session.first_question) {
      return session.first_question.substring(0, 50) + (session.first_question.length > 50 ? '...' : '')
    }
    return `Session ${new Date(session.first_message).toLocaleDateString()}`
  }
  
  return (
    <div className="h-full flex bg-gray-50">
      {/* History Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${showHistory ? 'w-80' : 'w-0'} overflow-hidden`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Chat History</h2>
          <button
            onClick={() => setShowHistory(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No chat history yet
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map(session => (
                <button
                  key={session.session_id}
                  onClick={() => loadSession(session.session_id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentSessionId === session.session_id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getSessionTitle(session)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          {new Date(session.last_message).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {session.message_count} messages
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle history"
              >
                <MessageSquare className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Chat Assistant</h1>
                <p className="text-sm text-gray-600">
                  {documents.length > 0 
                    ? `Searching across ${documents.length} document${documents.length > 1 ? 's' : ''}`
                    : 'Upload documents to start chatting'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {documents.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">{documents.length} Active</span>
                </div>
              )}
              <button
                onClick={createNewSession}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto">
              {documents.length > 1 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Smart Multi-Document Search</p>
                      <p className="text-blue-700">
                        Your questions will search across all {documents.length} uploaded documents. 
                        The AI will automatically find and cite the most relevant information from any document.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-center mb-12 animate-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Welcome to DocIntel AI Chat
                </h2>
                <p className="text-gray-600 text-lg">
                  Ask questions about your uploaded documents and get instant, accurate answers 
                  with source citations.
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 mb-3">Suggested questions:</p>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="w-full text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all group"
                  >
                    <p className="text-gray-700 group-hover:text-primary-700">{question}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div key={index} className="animate-slide-up">
                  {message.role === 'user' ? (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ) : message.role === 'error' ? (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-red-600">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                          <ReactMarkdown className="markdown prose max-w-none">
                            {message.content}
                          </ReactMarkdown>
                          
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-3">Sources:</p>
                              <div className="space-y-2">
                                {message.sources.map((source, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                                  >
                                    <FileText className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900">
                                        {getCleanFilename(source.filename)} - Page {source.page_number}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {source.text_preview}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={documents.length > 0 ? "Ask anything about your documents..." : "Upload documents to start chatting..."}
                disabled={loading || documents.length === 0}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || !input.trim() || documents.length === 0}
                className="btn btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
