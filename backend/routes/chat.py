"""
Chat and query routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import ChatHistory
from utils.rag_pipeline import RAGPipeline

bp = Blueprint('chat', __name__)

@bp.route('/query', methods=['POST'])
@jwt_required()
def query():
    """Process a query using RAG"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        question = data.get('question', '').strip()
        if not question:
            return jsonify({'error': 'Question is required'}), 400
        
        # Process query using RAG
        rag = RAGPipeline(user_id)
        result = rag.query(question)
        
        # Save to chat history
        ChatHistory.create(
            user_id=user_id,
            question=question,
            answer=result['answer'],
            sources=result['sources']
        )
        
        return jsonify({
            'question': question,
            'answer': result['answer'],
            'sources': result['sources']
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Query failed: {str(e)}'}), 500

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get chat history for current user"""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 50, type=int)
        
        history = ChatHistory.get_by_user(user_id, limit=limit)
        
        return jsonify({'history': history}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch history: {str(e)}'}), 500

@bp.route('/history', methods=['DELETE'])
@jwt_required()
def clear_history():
    """Clear all chat history for current user"""
    try:
        user_id = get_jwt_identity()
        deleted_count = ChatHistory.delete_by_user(user_id)
        
        return jsonify({
            'message': 'Chat history cleared successfully',
            'deleted_count': deleted_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to clear history: {str(e)}'}), 500
