"""
Document processing utilities
"""
import os
from typing import List, Dict
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from config import Config

class DocumentProcessor:
    """Handle PDF processing and text extraction"""
    
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=Config.CHUNK_SIZE,
            chunk_overlap=Config.CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def extract_text_from_pdf(self, file_path: str) -> List[Dict[str, any]]:
        """
        Extract text from PDF with page numbers
        
        Returns:
            List of dicts with 'page_number', 'text', and 'metadata'
        """
        try:
            reader = PdfReader(file_path)
            pages = []
            
            for page_num, page in enumerate(reader.pages, start=1):
                text = page.extract_text()
                if text.strip():  # Only add non-empty pages
                    pages.append({
                        'page_number': page_num,
                        'text': text,
                        'metadata': {
                            'source': os.path.basename(file_path),
                            'page': page_num
                        }
                    })
            
            return pages
            
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    def chunk_text(self, pages: List[Dict[str, any]], doc_id: int, filename: str) -> List[Dict[str, any]]:
        """
        Split text into chunks while maintaining page references
        
        Returns:
            List of chunks with metadata
        """
        chunks = []
        
        for page_data in pages:
            page_num = page_data['page_number']
            text = page_data['text']
            
            # Split text into chunks
            text_chunks = self.text_splitter.split_text(text)
            
            for chunk_idx, chunk in enumerate(text_chunks):
                chunks.append({
                    'text': chunk,
                    'metadata': {
                        'doc_id': doc_id,
                        'filename': filename,
                        'page_number': page_num,
                        'chunk_index': chunk_idx
                    }
                })
        
        return chunks
    
    def get_page_count(self, file_path: str) -> int:
        """Get total page count of PDF"""
        try:
            reader = PdfReader(file_path)
            return len(reader.pages)
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")
