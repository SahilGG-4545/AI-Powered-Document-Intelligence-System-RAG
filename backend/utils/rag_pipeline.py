"""
RAG (Retrieval-Augmented Generation) pipeline
"""
from typing import List, Dict, Optional
from openai import OpenAI
from groq import Groq
from config import Config
from utils.vector_store import VectorStore
from database import ChatHistory

class RAGPipeline:
    """Handle RAG query processing"""
    
    def __init__(self, user_id: int, session_id: Optional[str] = None):
        self.user_id = user_id
        self.session_id = session_id
        self.ai_provider = Config.AI_PROVIDER
        
        # Initialize appropriate client
        if self.ai_provider == 'groq':
            self.client = Groq(api_key=Config.GROQ_API_KEY)
        else:
            self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
        
        self.vector_store = VectorStore(user_id)
        self.llm_model = Config.LLM_MODEL
        self.temperature = Config.TEMPERATURE
    
    def _is_greeting(self, query: str) -> bool:
        """Check if the query is a greeting or casual conversation"""
        greetings = [
            'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon',
            'good evening', 'howdy', 'what\'s up', 'whats up', 'sup',
            'how are you', 'how do you do', 'nice to meet you'
        ]
        query_lower = query.lower().strip()
        return any(greeting in query_lower for greeting in greetings) and len(query.split()) < 10
    
    def _get_conversation_history(self, limit: int = 5) -> List[Dict]:
        """Get recent conversation history for context"""
        if not self.session_id:
            return []
        try:
            history = ChatHistory.get_by_session(self.user_id, self.session_id, limit=limit)
            return history
        except:
            return []
    
    def _build_prompt(self, query: str, context_chunks: List[Dict]) -> str:
        """Build prompt with strict instructions to prevent hallucination"""
        
        # Format context with sources
        context_parts = []
        for i, chunk in enumerate(context_chunks, 1):
            metadata = chunk['metadata']
            context_parts.append(
                f"[Source {i}] Document: {metadata['filename']}, "
                f"Page: {metadata['page_number']}\n{chunk['text']}\n"
            )
        
        context = "\n".join(context_parts)
        
        prompt = f"""You are a professional document assistant. Provide clear, well-structured answers based on the provided context.

FORMATTING RULES:
1. Use proper markdown formatting:
   - Use **bold** for important terms and key points
   - Use numbered lists (1., 2., 3.) or bullet points (- ) for multiple items
   - Use clear paragraph breaks for readability
   - Use headings (##) only when needed for long responses
2. Structure your response professionally with clear paragraphs
3. Make the response easy to read and scan

CONTENT RULES:
1. Answer ONLY using information from the context below
2. If the context doesn't contain the answer, say "I don't have enough information in the provided documents to answer this question."
3. DO NOT use external knowledge or make assumptions
4. Cite sources using [Source X] notation
5. Be concise and factual

CONTEXT:
{context}

USER QUESTION: {query}

Provide a well-formatted, professional answer:"""
        
        return prompt
    
    def query(self, question: str) -> Dict[str, any]:
        """
        Process a query using RAG
        
        Returns:
            Dict with 'answer' and 'sources'
        """
        try:
            # Handle greetings and casual conversation
            if self._is_greeting(question):
                return {
                    'answer': "Hello! 👋 I'm your document assistant. I can help you find information from your uploaded documents, answer questions, and provide summaries. What would you like to know?",
                    'sources': []
                }
            
            # Retrieve relevant chunks
            relevant_chunks = self.vector_store.search(question, k=Config.TOP_K_RETRIEVAL)
            
            # Check if we have any documents
            if not relevant_chunks:
                return {
                    'answer': "No documents have been uploaded yet. Please upload documents to ask questions.",
                    'sources': []
                }
            
            # Build prompt
            prompt = self._build_prompt(question, relevant_chunks)
            
            # Generate answer using OpenAI
            response = self.client.chat.completions.create(
                model=self.llm_model,
                messages=[
                    {"role": "system", "content": "You are a precise document assistant that answers questions only from provided context."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=1000
            )
            
            answer = response.choices[0].message.content.strip()
            
            # Extract unique sources
            sources = []
            seen_sources = set()
            
            for chunk in relevant_chunks:
                metadata = chunk['metadata']
                source_key = (metadata['doc_id'], metadata['page_number'])
                
                if source_key not in seen_sources:
                    sources.append({
                        'doc_id': metadata['doc_id'],
                        'filename': metadata['filename'],
                        'page_number': metadata['page_number'],
                        'text_preview': chunk['text'][:200] + "..."
                    })
                    seen_sources.add(source_key)
            
            return {
                'answer': answer,
                'sources': sources
            }
            
        except Exception as e:
            raise Exception(f"Error processing query: {str(e)}")
    
    def summarize_document(self, doc_id: int, filename: str) -> str:
        """Generate a summary of a specific document"""
        try:
            # Get all chunks for this document
            all_chunks = [
                item for item in self.vector_store.metadata
                if item['metadata'].get('doc_id') == doc_id
            ]
            
            if not all_chunks:
                return "Document not found in vector store."
            
            # Sort by page and chunk index
            all_chunks.sort(
                key=lambda x: (x['metadata']['page_number'], x['metadata']['chunk_index'])
            )
            
            # Combine text (limit to avoid token limits)
            combined_text = "\n\n".join([chunk['text'] for chunk in all_chunks[:20]])
            
            # Create summary prompt
            prompt = f"""Provide a comprehensive, professionally formatted summary of the following document.

FORMATTING REQUIREMENTS:
- Use clear headings with ## for main sections
- Use **bold** for key terms and important concepts
- Use bullet points (-) or numbered lists (1., 2., 3.) for multiple items
- Write in clear, well-structured paragraphs
- Make it easy to read and professional

Document: {filename}

Content:
{combined_text}

Please provide a well-structured summary covering:

## Overview
Brief description of the document's main purpose and topic

## Key Points
Main findings, concepts, or information (use bullet points)

## Important Details
Any critical details, conclusions, or recommendations

Provide the summary in markdown format:"""
            
            # Generate summary
            response = self.client.chat.completions.create(
                model=self.llm_model,
                messages=[
                    {"role": "system", "content": "You are a professional document summarization assistant. Always use proper markdown formatting with headings, bold text, and bullet points for clarity."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            summary = response.choices[0].message.content.strip()
            return summary
            
        except Exception as e:
            raise Exception(f"Error generating summary: {str(e)}")
