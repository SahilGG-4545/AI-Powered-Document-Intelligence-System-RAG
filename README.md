# AI-Powered Document Intelligence System (RAG)

A professional MVP for intelligent document analysis using Retrieval-Augmented Generation (RAG).

## 🚀 Features

- **User Authentication**: JWT-based secure login and registration
- **Document Management**: Multi-PDF upload with per-user isolation and clean filenames
- **RAG Pipeline**: Advanced retrieval-augmented generation for accurate answers
- **Source Citations**: Every answer includes document and page references
- **Session-Based Chat**: ChatGPT-style interface with conversation history
- **Chat History Sidebar**: View and switch between multiple chat sessions
- **Greeting Detection**: Handles informal greetings without document context
- **Document Summaries**: One-click AI-generated summaries with markdown formatting
- **Real-time Dashboard**: Auto-refreshing stats (documents, pages, chunks)
- **Markdown Rendering**: Professional formatting for AI responses
- **Delete Confirmations**: Safe document deletion with loading states
- **Strict Prompts**: Prevents hallucination with context-only responses
- **100% Free AI**: Local embeddings + Groq API (no costs)

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python) with Uvicorn
- **Authentication**: JWT (PyJWT)
- **Vector Database**: FAISS
- **Embeddings**: HuggingFace (all-MiniLM-L6-v2) - Local & Free
- **LLM**: Groq (llama-3.3-70b-versatile) - Free Tier
- **PDF Processing**: PyPDF2 + LangChain
- **Database**: SQLite with session support

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Markdown**: React Markdown

## 📁 Project Structure

```
RAG Project/
├── backend/
│   ├── main.py                # FastAPI application entry
│   ├── config.py              # Configuration settings
│   ├── database.py            # Database models with session support
│   ├── routes_fastapi/
│   │   ├── auth.py           # Authentication routes
│   │   ├── documents.py      # Document management routes
│   │   └── chat.py           # Chat routes with session support
│   ├── utils/
│   │   ├── document_processor.py  # PDF processing
│   │   ├── vector_store.py        # FAISS with HuggingFace embeddings
│   │   └── rag_pipeline.py        # RAG with greeting detection
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── Header.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Chat.jsx
    │   │   ├── Documents.jsx
    │   │   └── History.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── store/
    │   │   └── authStore.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- OpenAI API Key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file:
```bash
copy .env.example .env
```

6. Edit `.env` and add your Groq API key:
```
GROQ_API_KEY=your-groq-api-key-here
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
```

7. Run the backend:
```bash
python main.py
```

Backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will start on `http://localhost:3000`

## 🎯 Usage

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in at `/login`
3. **Upload Documents**: Go to Documents page and upload PDF files (with delete confirmation)
4. **Dashboard**: View real-time stats - documents, pages, and chunks (auto-refreshes every 30s)
5. **Ask Questions**: Navigate to Chat and ask questions about your documents
6. **New Chat**: Click "New Chat" button to start fresh conversation sessions
7. **Chat History**: View and switch between past conversations in the sidebar
8. **Greetings**: Say "hi" or "hello" - AI handles casual conversation
9. **View Sources**: All answers include source citations with page numbers and clean filenames
10. **Generate Summaries**: Click "Summary" on any document for AI-generated overview with markdown
11. **Markdown Responses**: Enjoy professionally formatted AI responses with headings, lists, and tables

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Per-user document isolation
- Password hashing with bcrypt
- Secure file upload validation
- CORS protection
- SQL injection prevention
- XSS protection

## 🧠 RAG Implementation

The system uses a sophisticated RAG pipeline with 100% free AI:

1. **Document Processing**:
   - PDF text extraction with page tracking
   - Intelligent chunking with overlap (1000 chars, 200 overlap)
   - Metadata preservation with clean filenames

2. **Embedding Generation**:
   - HuggingFace all-MiniLM-L6-v2 (384 dimensions) - Runs locally, completely free
   - Batch processing for efficiency
   - FAISS L2 distance indexing
   - Real-time chunk count tracking

3. **Retrieval**:
   - Top-K similarity search (default: 5 chunks)
   - Context-aware ranking
   - Source tracking with page numbers
   - Greeting detection for casual conversation

4. **Generation**:
   - Groq llama-3.3-70b-versatile (fast & free tier)
   - Session-based conversation memory
   - Strict prompt engineering with markdown formatting
   - Context-only responses
   - Hallucination prevention
   - Source citation with clean filenames

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Documents
- `POST /api/documents/upload` - Upload PDFs (multipart/form-data)
- `GET /api/documents` - Get all documents
- `GET /api/documents/stats` - Get statistics (documents, pages, chunks)
- `GET /api/documents/{doc_id}` - Get document details
- `DELETE /api/documents/{doc_id}` - Delete document
- `GET /api/documents/{doc_id}/summary` - Generate summary

### Chat
- `POST /api/chat/query` - Ask question (with optional session_id)
- `GET /api/chat/sessions` - Get all chat sessions
- `GET /api/chat/sessions/{session_id}` - Get session history
- `GET /api/chat/history` - Get all chat history
- `DELETE /api/chat/history` - Clear history

## 🎨 UI Features

- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Responsive**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Transitions and loading states
- **Loading States**: Clear feedback with spinners and skeletons
- **Error Handling**: User-friendly error messages
- **Markdown Rendering**: Professional formatting for AI responses (headings, lists, tables, code blocks)
- **ReactMarkdown**: Full markdown support with custom styling
- **Delete Confirmation**: "Are you sure?" dialogs for safety
- **Clean Filenames**: UUID prefixes stripped from display
- **Session Management**: ChatGPT-style chat interface
- **History Sidebar**: Collapsible session list with conversation previews
- **Auto-Refresh Dashboard**: Stats update every 30 seconds
- **Drag & Drop**: Easy file uploads

## 🚀 Production Deployment

### Backend
1. Use production WSGI server (Gunicorn/uWSGI)
2. Set up proper environment variables
3. Use PostgreSQL instead of SQLite
4. Configure SSL/TLS
5. Set up rate limiting
6. Enable logging and monitoring

### Frontend
1. Build for production: `npm run build`
2. Serve static files with Nginx/Apache
3. Configure environment variables
4. Enable compression
5. Set up CDN for assets

## 🔧 Configuration

### Backend (`config.py`)
- `CHUNK_SIZE`: Text chunk size (default: 1000)
- `CHUNK_OVERLAP`: Chunk overlap (default: 200)
- `TOP_K_RETRIEVAL`: Number of chunks to retrieve (default: 5)
- `TEMPERATURE`: LLM temperature (default: 0.1)
- `EMBEDDING_MODEL`: HuggingFace model (all-MiniLM-L6-v2)
- `LLM_MODEL`: Groq model (llama-3.3-70b-versatile)
- `DASHBOARD_REFRESH_INTERVAL`: Dashboard auto-refresh (default: 30s)

### Frontend
- Vite configuration in `vite.config.js`
- Tailwind configuration in `tailwind.config.js`
- API base URL in `.env`

---

Built with ❤️ using React, Flask, and OpenAI
