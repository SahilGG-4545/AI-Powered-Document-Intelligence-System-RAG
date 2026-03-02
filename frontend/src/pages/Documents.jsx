import { useState, useEffect } from 'react'
import { documentsAPI } from '../services/api'
import { Upload, FileText, Trash2, FileCheck, AlertCircle, Sparkles, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null) // Track which doc is being deleted
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [summaryDoc, setSummaryDoc] = useState(null)
  const [summary, setSummary] = useState('')
  const [loadingSummary, setLoadingSummary] = useState(false)
  
  // Helper function to clean filename (remove UUID prefix)
  const getCleanFilename = (filename) => {
    // Remove UUID prefix pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx_
    return filename.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i, '')
  }
  
  useEffect(() => {
    loadDocuments()
  }, [])
  
  const loadDocuments = async () => {
    try {
      const response = await documentsAPI.getAll()
      setDocuments(response.data.documents)
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
  }
  
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    )
    setSelectedFiles(files)
  }
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return
    
    setUploading(true)
    try {
      const response = await documentsAPI.upload(selectedFiles)
      console.log('Upload response:', response)
      setSelectedFiles([])
      await loadDocuments()
      alert(`Successfully uploaded ${response.data.documents?.length || 0} document(s)!`)
    } catch (error) {
      console.error('Upload failed:', error)
      console.error('Error response:', error.response?.data)
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to upload documents. Please try again.'
      alert(errorMsg)
    } finally {
      setUploading(false)
    }
  }
  
  const handleDelete = async (id, filename) => {
    const cleanFilename = getCleanFilename(filename)
    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${cleanFilename}"?\n\nThis action cannot be undone.`)) {
      return
    }
    
    setDeleting(id) // Show loading state for this specific document
    
    try {
      await documentsAPI.delete(id)
      await loadDocuments()
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete document. Please try again.')
    } finally {
      setDeleting(null)
    }
  }
  
  const handleSummary = async (doc) => {
    setSummaryDoc(doc)
    setLoadingSummary(true)
    setSummary('')
    
    try {
      const response = await documentsAPI.getSummary(doc.id)
      setSummary(response.data.summary)
    } catch (error) {
      console.error('Summary failed:', error)
      setSummary('Failed to generate summary. Please try again.')
    } finally {
      setLoadingSummary(false)
    }
  }
  
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
        <p className="text-gray-600">Upload and manage your PDF documents</p>
      </div>
      
      {/* Upload Section */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Documents</h2>
        
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop PDF files here or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Support for multiple files • Max 50MB per file
          </p>
          
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="btn btn-primary cursor-pointer">
            Select Files
          </label>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 mb-3">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="space-y-2 mb-4">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn btn-primary w-full disabled:opacity-50 flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="ml-2">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span className="ml-2">Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Documents List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Your Documents ({documents.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-lg"></div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600">Upload your first PDF document to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{getCleanFilename(doc.filename)}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500">{doc.page_count} pages</span>
                      <span className="text-sm text-gray-500">
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSummary(doc)}
                    className="btn btn-secondary flex items-center gap-2"
                    disabled={deleting === doc.id}
                  >
                    <Sparkles className="w-4 h-4" />
                    Summary
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.filename)}
                    className="btn btn-danger flex items-center gap-2"
                    disabled={deleting === doc.id}
                  >
                    {deleting === doc.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Summary Modal */}
      {summaryDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{getCleanFilename(summaryDoc.filename)}</h3>
                  <p className="text-sm text-gray-500 mt-1">AI-Generated Summary</p>
                </div>
                <button
                  onClick={() => setSummaryDoc(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {loadingSummary ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Generating summary...</p>
                </div>
              ) : (
                <div className="markdown prose max-w-none">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
