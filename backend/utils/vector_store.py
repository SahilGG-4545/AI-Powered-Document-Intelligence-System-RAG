"""
Vector store management using FAISS
"""
import os
import pickle
import numpy as np
from typing import List, Dict, Optional
from langchain_huggingface import HuggingFaceEmbeddings
import faiss
from config import Config

class VectorStore:
    """Manage FAISS vector store for user documents"""
    
    def __init__(self, user_id: int):
        self.user_id = user_id
        # Use free HuggingFace embeddings (all-MiniLM-L6-v2 is fast and good quality)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.dimension = 384  # all-MiniLM-L6-v2 dimension
        
        # User-specific paths
        self.store_dir = os.path.join(Config.VECTOR_STORE_PATH, f"user_{user_id}")
        self.index_path = os.path.join(self.store_dir, "faiss.index")
        self.metadata_path = os.path.join(self.store_dir, "metadata.pkl")
        
        # Create directory if doesn't exist
        os.makedirs(self.store_dir, exist_ok=True)
        
        # Load or create index
        self.index = self._load_or_create_index()
        self.metadata = self._load_metadata()
    
    def _load_or_create_index(self) -> faiss.Index:
        """Load existing index or create new one"""
        if os.path.exists(self.index_path):
            return faiss.read_index(self.index_path)
        else:
            # Create a new FAISS index (L2 distance)
            return faiss.IndexFlatL2(self.dimension)
    
    def _load_metadata(self) -> List[Dict]:
        """Load metadata or return empty list"""
        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, 'rb') as f:
                return pickle.load(f)
        return []
    
    def _save_index(self):
        """Save FAISS index to disk"""
        faiss.write_index(self.index, self.index_path)
    
    def _save_metadata(self):
        """Save metadata to disk"""
        with open(self.metadata_path, 'wb') as f:
            pickle.dump(self.metadata, f)
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings using HuggingFace sentence-transformers"""
        try:
            # Use LangChain's embed_documents method
            embeddings = self.embeddings.embed_documents(texts)
            return np.array(embeddings, dtype='float32')
            
        except Exception as e:
            raise Exception(f"Error generating embeddings: {str(e)}")
    
    def add_documents(self, chunks: List[Dict[str, any]]):
        """Add document chunks to vector store"""
        if not chunks:
            return
        
        # Extract texts and metadata
        texts = [chunk['text'] for chunk in chunks]
        metadatas = [chunk['metadata'] for chunk in chunks]
        
        # Generate embeddings
        embeddings = self.generate_embeddings(texts)
        
        # Add to FAISS index
        self.index.add(embeddings)
        
        # Store metadata with text
        for text, metadata in zip(texts, metadatas):
            self.metadata.append({
                'text': text,
                'metadata': metadata
            })
        
        # Save to disk
        self._save_index()
        self._save_metadata()
    
    def search(self, query: str, k: int = None) -> List[Dict[str, any]]:
        """
        Search for similar documents
        
        Returns:
            List of dicts with 'text', 'metadata', and 'score'
        """
        if k is None:
            k = Config.TOP_K_RETRIEVAL
        
        # Handle empty index
        if self.index.ntotal == 0:
            return []
        
        # Limit k to available vectors
        k = min(k, self.index.ntotal)
        
        # Generate query embedding
        query_embedding = self.generate_embeddings([query])[0]
        query_embedding = np.array([query_embedding], dtype='float32')
        
        # Search in FAISS
        distances, indices = self.index.search(query_embedding, k)
        
        # Format results
        results = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx != -1 and idx < len(self.metadata):
                result = {
                    'text': self.metadata[idx]['text'],
                    'metadata': self.metadata[idx]['metadata'],
                    'score': float(distance)
                }
                results.append(result)
        
        return results
    
    def delete_document(self, doc_id: int):
        """
        Delete all chunks for a specific document
        Note: FAISS doesn't support deletion, so we rebuild the index
        """
        # Filter out chunks from this document
        remaining_chunks = [
            item for item in self.metadata
            if item['metadata'].get('doc_id') != doc_id
        ]
        
        if len(remaining_chunks) == len(self.metadata):
            return  # Nothing to delete
        
        # Rebuild index
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata = []
        
        if remaining_chunks:
            # Re-add remaining chunks
            texts = [item['text'] for item in remaining_chunks]
            embeddings = self.generate_embeddings(texts)
            self.index.add(embeddings)
            self.metadata = remaining_chunks
        
        # Save
        self._save_index()
        self._save_metadata()
    
    def clear(self):
        """Clear all documents from vector store"""
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata = []
        self._save_index()
        self._save_metadata()
    
    def get_document_count(self) -> int:
        """Get number of unique documents in store"""
        doc_ids = set(item['metadata'].get('doc_id') for item in self.metadata)
        return len(doc_ids)
    
    def get_chunk_count(self) -> int:
        """Get total number of chunks in store"""
        return len(self.metadata)
