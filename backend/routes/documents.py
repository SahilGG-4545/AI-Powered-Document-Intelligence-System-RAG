"""
Document management routes
"""
import os
import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from database import Document
from utils.document_processor import DocumentProcessor
from utils.vector_store import VectorStore
from config import Config

bp = Blueprint('documents', __name__)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_documents():
    """Upload and process multiple PDF documents"""
    try:
        user_id = get_jwt_identity()
        print(f"[UPLOAD] User ID: {user_id}")
        
        # Check if files are present
        if 'files' not in request.files:
            print("[UPLOAD ERROR] No files in request")
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        print(f"[UPLOAD] Received {len(files)} files")
        
        if not files or all(file.filename == '' for file in files):
            print("[UPLOAD ERROR] No files selected")
            return jsonify({'error': 'No files selected'}), 400
        
        processor = DocumentProcessor()
        vector_store = VectorStore(user_id)
        uploaded_docs = []
        errors = []
        
        for file in files:
            if file and allowed_file(file.filename):
                try:
                    print(f"[UPLOAD] Processing: {file.filename}")
                    # Generate unique filename
                    original_filename = secure_filename(file.filename)
                    unique_filename = f"{uuid.uuid4()}_{original_filename}"
                    
                    # Save file
                    user_upload_dir = os.path.join(Config.UPLOAD_FOLDER, f"user_{user_id}")
                    os.makedirs(user_upload_dir, exist_ok=True)
                    file_path = os.path.join(user_upload_dir, unique_filename)
                    file.save(file_path)
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
                    'filename': file.filename,
                    'error': 'Invalid file type. Only PDF files are allowed.'
                })
        
        response = {
            'message': f'Successfully uploaded {len(uploaded_docs)} document(s)',
            'documents': uploaded_docs
        }
        
        if errors:
            response['errors'] = errors
        
        print(f"[UPLOAD] Complete. Success: {len(uploaded_docs)}, Errors: {len(errors)}")
        return jsonify(response), 201 if uploaded_docs else 400
        
    except Exception as e:
        print(f"[UPLOAD CRITICAL ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@bp.route('/', methods=['GET'])
@jwt_required()
def get_documents():
    """Get all documents for current user"""
    try:
        user_id = get_jwt_identity()
        documents = Document.get_by_user(user_id)
        
        doc_list = []
        for doc in documents:
            doc_list.append({
                'id': doc['id'],
                'filename': doc['original_filename'],
                'page_count': doc['page_count'],
                'upload_date': doc['upload_date']
            })
        
        return jsonify({'documents': doc_list}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch documents: {str(e)}'}), 500

@bp.route('/<int:doc_id>', methods=['GET'])
@jwt_required()
def get_document(doc_id):
    """Get specific document details"""
    try:
        user_id = get_jwt_identity()
        document = Document.get_by_id(doc_id, user_id)
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        return jsonify({
            'id': document['id'],
            'filename': document['original_filename'],
            'page_count': document['page_count'],
            'upload_date': document['upload_date']
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch document: {str(e)}'}), 500

@bp.route('/<int:doc_id>', methods=['DELETE'])
@jwt_required()
def delete_document(doc_id):
    """Delete a document"""
    try:
        user_id = get_jwt_identity()
        
        # Get document info
        document = Document.get_by_id(doc_id, user_id)
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        # Delete from vector store
        vector_store = VectorStore(user_id)
        vector_store.delete_document(doc_id)
        
        # Delete file
        if os.path.exists(document['file_path']):
            os.remove(document['file_path'])
        
        # Delete from database
        Document.delete(doc_id, user_id)
        
        return jsonify({
            'message': 'Document deleted successfully',
            'filename': document['original_filename']
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to delete document: {str(e)}'}), 500

@bp.route('/<int:doc_id>/summary', methods=['GET'])
@jwt_required()
def summarize_document(doc_id):
    """Generate document summary"""
    try:
        user_id = get_jwt_identity()
        
        # Verify document belongs to user
        document = Document.get_by_id(doc_id, user_id)
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        # Generate summary
        from utils.rag_pipeline import RAGPipeline
        rag = RAGPipeline(user_id)
        summary = rag.summarize_document(doc_id, document['original_filename'])
        
        return jsonify({
            'document': document['original_filename'],
            'summary': summary
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate summary: {str(e)}'}), 500

@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get document statistics"""
    try:
        user_id = get_jwt_identity()
        
        # Get document count from database
        documents = Document.get_by_user(user_id)
        total_docs = len(documents)
        total_pages = sum(doc['page_count'] or 0 for doc in documents)
        
        # Get vector store stats
        vector_store = VectorStore(user_id)
        total_chunks = vector_store.get_chunk_count()
        
        return jsonify({
            'total_documents': total_docs,
            'total_pages': total_pages,
            'total_chunks': total_chunks
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch stats: {str(e)}'}), 500
