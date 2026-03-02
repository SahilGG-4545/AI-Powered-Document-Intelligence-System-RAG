# API Documentation

Base URL: `http://localhost:5000/api`

**Framework**: FastAPI with Uvicorn
**Authentication**: JWT (PyJWT)
**AI Stack**: Groq (LLM) + HuggingFace (Embeddings)

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Register
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### Login
**POST** `/auth/login`

Authenticate and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### Refresh Token
**POST** `/auth/refresh`

Get a new access token using refresh token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Get Current User
**GET** `/auth/me`

Get current user information.

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2024-01-08 10:30:00"
}
```

---

## Documents

### Upload Documents
**POST** `/documents/upload`

Upload one or multiple PDF documents.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `files` (can be multiple)

**Example using curl:**
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "files=@document1.pdf" \
  -F "files=@document2.pdf"
```

**Response:** `201 Created`
```json
{
  "message": "Successfully uploaded 2 document(s)",
  "documents": [
    {
      "id": 1,
      "filename": "document1.pdf",
      "page_count": 10,
      "chunks": 45
    },
    {
      "id": 2,
      "filename": "document2.pdf",
      "page_count": 5,
      "chunks": 23
    }
  ],
  "errors": []
}
```

### Get All Documents
**GET** `/documents/`

Get all documents for the current user.

**Response:** `200 OK`
```json
{
  "documents": [
    {
      "id": 1,
      "filename": "document1.pdf",
      "page_count": 10,
      "upload_date": "2024-01-08 10:30:00"
    },
    {
      "id": 2,
      "filename": "document2.pdf",
      "page_count": 5,
      "upload_date": "2024-01-08 10:35:00"
    }
  ]
}
```

### Get Document by ID
**GET** `/documents/{id}`

Get details of a specific document.

**Response:** `200 OK`
```json
{
  "id": 1,
  "filename": "document1.pdf",
  "page_count": 10,
  "upload_date": "2024-01-08 10:30:00"
}
```

### Delete Document
**DELETE** `/documents/{id}`

Delete a document and its associated data.

**Response:** `200 OK`
```json
{
  "message": "Document deleted successfully",
  "filename": "document1.pdf"
}
```

### Generate Document Summary
**GET** `/documents/{id}/summary`

Generate an AI-powered summary of a document.

**Response:** `200 OK`
```json
{
  "document": "document1.pdf",
  "summary": "This document discusses the implementation of RAG systems. Key topics include:\n\n1. Document Processing: Methods for extracting and chunking text...\n\n2. Vector Embeddings: Using OpenAI's embedding models...\n\n3. Retrieval: FAISS-based similarity search...\n\nThe document concludes with best practices for production deployment."
}
```

### Get Statistics
**GET** `/documents/stats`

Get document statistics for the current user.

**Response:** `200 OK`
```json
{
  "total_documents": 5,
  "total_pages": 47,
  "total_chunks": 234
}
```

---

## Chat

### Query Documents
**POST** `/chat/query`

Ask a question about uploaded documents using RAG.

**Request Body:**
```json
{
  "question": "What are the main topics covered in my documents?",
  "session_id": "uuid-string-here"  // Optional - for conversation continuity
}
```

**Response:** `200 OK`
```json
{
  "question": "What are the main topics covered in my documents?",
  "answer": "Based on your documents, the main topics covered are:\n\n1. **RAG Systems**: Implementation of Retrieval-Augmented Generation [Source 1]\n2. **Vector Databases**: Using FAISS for similarity search [Source 2]\n3. **Document Processing**: Text extraction and chunking strategies [Source 1]\n\nThese topics are discussed across multiple pages with detailed examples and best practices.",
  "session_id": "uuid-string-here",  // Session ID for this conversation
  "sources": [
    {
      "doc_id": 1,
      "filename": "rag_guide.pdf",
      "page_number": 3,
      "text_preview": "RAG systems combine retrieval and generation to provide accurate answers. The process involves extracting relevant context from documents and using it to generate responses..."
    },
    {
      "doc_id": 1,
      "filename": "rag_guide.pdf",
      "page_number": 7,
      "text_preview": "Vector databases like FAISS enable efficient similarity search. Documents are converted to embeddings and stored in an index that supports fast nearest-neighbor queries..."
    }
  ]
}
```

### Get Chat History
**GET** `/chat/history`

### Get Chat History
**GET** `/chat/history`

Get chat history for the current user.

**Query Parameters:**
- `limit` (optional): Number of history items to return (default: 50)

**Response:** `200 OK`
```json
{
  "history": [
    {
      "id": 1,
      "question": "What are RAG systems?",
      "answer": "RAG (Retrieval-Augmented Generation) systems combine information retrieval with text generation...",
      "session_id": "uuid-string",
      "sources": [
        {
          "doc_id": 1,
          "filename": "rag_guide.pdf",
          "page_number": 2,
          "text_preview": "..."
        }
      ],
      "timestamp": "2024-01-08 10:45:00"
    }
  ]
}
```

### Get Chat Sessions
**GET** `/chat/sessions`

Get all chat sessions with conversation previews.

**Response:** `200 OK`
```json
{
  "sessions": [
    {
      "session_id": "uuid-string",
      "first_question": "What are RAG systems?",
      "message_count": 5,
      "created_at": "2024-01-08 10:45:00",
      "updated_at": "2024-01-08 11:30:00"
    }
  ]
}
```

### Get Session History
**GET** `/chat/sessions/{session_id}`

Get full conversation for a specific session.

**Response:** `200 OK`
```json
{
  "session_id": "uuid-string",
  "messages": [
    {
      "id": 1,
      "question": "What are RAG systems?",
      "answer": "RAG systems combine retrieval and generation...",
      "sources": [...],
      "timestamp": "2024-01-08 10:45:00"
    }
  ]
}
```

### Clear Chat History
**DELETE** `/chat/history`

Clear all chat history for the current user.

**Response:** `200 OK`
```json
{
  "message": "Chat history cleared successfully",
  "deleted_count": 15
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid email or password"
}
```

### 404 Not Found
```json
{
  "error": "Document not found"
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "error": "Upload failed: <error message>"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production:
- Implement rate limiting per user/IP
- Suggested: 100 requests per minute for queries
- Suggested: 10 uploads per hour per user

---

## Best Practices

### Authentication
1. Store tokens securely (httpOnly cookies or secure storage)
2. Refresh tokens before expiry
3. Handle 401 responses by redirecting to login
4. Don't expose tokens in URLs or logs

### File Uploads
1. Validate file types on client side
2. Show upload progress
3. Handle large files with chunked uploads (future enhancement)
4. Implement retry logic for failed uploads

### Queries
1. Debounce user input to avoid excessive requests
2. Show loading states during processing
3. Cache recent queries (optional)
4. Implement timeout handling

### Error Handling
1. Display user-friendly error messages
2. Log errors for debugging
3. Implement retry logic for transient failures
4. Provide fallback UI for critical errors

---

## Webhooks (Future Enhancement)

Planned webhooks for:
- Document processing completion
- Summary generation completion
- Error notifications

---

## Versioning

Current API version: `v1`

Future versions will be accessible via:
- `/api/v2/...`

Breaking changes will be introduced only in new versions.

---

## Support

For API issues or questions:
- Check error messages and status codes
- Review this documentation
- Check application logs
- Open an issue on GitHub
