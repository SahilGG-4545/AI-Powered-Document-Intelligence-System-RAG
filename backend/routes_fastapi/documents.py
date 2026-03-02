"""
Documents routes for FastAPI
"""
import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from typing import List
from database import Document
from utils.document_processor import DocumentProcessor
from utils.vector_store import VectorStore
from config import Config
from .dependencies import get_current_user

router = APIRouter()

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_documents(
    files: List[UploadFile] = File(...),
    user_id: int = Depends(get_current_user)
):
    """Upload and process multiple PDF documents"""
    try:
        print(f"[UPLOAD] User ID: {user_id}")
        print(f"[UPLOAD] Received {len(files)} files")
        
        if not files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No files provided"
            )
        
        processor = DocumentProcessor()
        vector_store = VectorStore(user_id)
        uploaded_docs = []
        errors = []
        
        for file in files:
            if file.filename and allowed_file(file.filename):
                try:
                    print(f"[UPLOAD] Processing: {file.filename}")
                    
                    # Generate unique filename
                    original_filename = file.filename
                    unique_filename = f"{uuid.uuid4()}_{original_filename}"
                    
                    # Save file
                    user_upload_dir = os.path.join(Config.UPLOAD_FOLDER, f"user_{user_id}")
                    os.makedirs(user_upload_dir, exist_ok=True)
                    file_path = os.path.join(user_upload_dir, unique_filename)
                    
                    # Read and save file content
                    content = await file.read()
                    with open(file_path, 'wb') as f:
                        f.write(content)
                    print(f"[UPLOAD] Saved to: {file_path}")
                    
                    # Get page count
                    page_count = processor.get_page_count(file_path)
                    print(f"[UPLOAD] Page count: {page_count}")
                    
                    # Save to database
                    doc_id = Document.create(
                        user_id=user_id,
                        filename=unique_filename,
                        original_filename=original_filename,
                        file_path=file_path,
                        page_count=page_count
                    )
                    print(f"[UPLOAD] DB doc_id: {doc_id}")
                    
                    # Process document
                    print(f"[UPLOAD] Extracting text...")
                    pages = processor.extract_text_from_pdf(file_path)
                    chunks = processor.chunk_text(pages, doc_id, original_filename)
                    print(f"[UPLOAD] Created {len(chunks)} chunks")
                    
                    # Add to vector store
                    print(f"[UPLOAD] Generating embeddings...")
                    vector_store.add_documents(chunks)
                    print(f"[UPLOAD] Successfully added to vector store")
                    
                    uploaded_docs.append({
                        'id': doc_id,
                        'filename': original_filename,
                        'page_count': page_count,
                        'chunks': len(chunks)
                    })
                    
                except Exception as e:
                    print(f"[UPLOAD ERROR] Failed to process {file.filename}: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    errors.append({
                        'filename': file.filename,
                        'error': str(e)
                    })
            else:
                errors.append({
                    'filename': file.filename or 'unknown',
                    'error': 'Invalid file type. Only PDF files are allowed.'
                })
        
        response = {
            'message': f'Successfully uploaded {len(uploaded_docs)} document(s)',
            'documents': uploaded_docs
        }
        
        if errors:
            response['errors'] = errors
        
        print(f"[UPLOAD] Complete. Success: {len(uploaded_docs)}, Errors: {len(errors)}")
        
        if not uploaded_docs and errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=response
            )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[UPLOAD CRITICAL ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

@router.get("")
async def get_documents(user_id: int = Depends(get_current_user)):
    """Get all documents for current user"""
    try:
        documents = Document.get_by_user(user_id)
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch documents: {str(e)}"
        )

@router.get("/stats")
async def get_stats(user_id: int = Depends(get_current_user)):
    """Get document statistics"""
    try:
        stats = Document.get_stats(user_id)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stats: {str(e)}"
        )

@router.get("/{doc_id}")
async def get_document(doc_id: int, user_id: int = Depends(get_current_user)):
    """Get document by ID"""
    try:
        doc = Document.get_by_id(doc_id, user_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        return doc
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch document: {str(e)}"
        )

@router.delete("/{doc_id}")
async def delete_document(doc_id: int, user_id: int = Depends(get_current_user)):
    """Delete document"""
    try:
        print(f"[DELETE] User ID: {user_id}, Doc ID: {doc_id}")
        
        doc = Document.get_by_id(doc_id, user_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        print(f"[DELETE] Found document: {doc['filename']}")
        
        # Delete from vector store
        try:
            print(f"[DELETE] Initializing vector store...")
            vector_store = VectorStore(user_id)
            print(f"[DELETE] Deleting from vector store...")
            vector_store.delete_document(doc_id)
            print(f"[DELETE] Deleted from vector store")
        except Exception as ve:
            print(f"[DELETE ERROR] Vector store error: {str(ve)}")
            import traceback
            traceback.print_exc()
        
        # Delete file
        if os.path.exists(doc["file_path"]):
            os.remove(doc["file_path"])
            print(f"[DELETE] Deleted file: {doc['file_path']}")
        
        # Delete from database
        Document.delete(doc_id, user_id)
        print(f"[DELETE] Deleted from database")
        
        return {"message": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[DELETE CRITICAL ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )

@router.get("/{doc_id}/summary")
async def get_summary(doc_id: int, user_id: int = Depends(get_current_user)):
    """Generate document summary"""
    try:
        from utils.rag_pipeline import RAGPipeline
        
        doc = Document.get_by_id(doc_id, user_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        rag = RAGPipeline(user_id)
        summary = rag.summarize_document(doc_id, doc["filename"])
        
        return {"summary": summary}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )
