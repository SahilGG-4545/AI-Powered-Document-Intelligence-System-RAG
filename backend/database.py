"""
Database models and initialization
"""
import sqlite3
import bcrypt
from datetime import datetime
from contextlib import contextmanager
from config import Config

@contextmanager
def get_db():
    """Get database connection"""
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Initialize database tables"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Documents table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                filename TEXT NOT NULL,
                original_filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                page_count INTEGER,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ''')
        
        # Chat history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_id TEXT,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                sources TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ''')
        
        # Add session_id column if it doesn't exist (migration)
        try:
            cursor.execute('ALTER TABLE chat_history ADD COLUMN session_id TEXT')
        except sqlite3.OperationalError:
            pass  # Column already exists
        
        # Create indexes for performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id)')

class User:
    """User model"""
    
    @staticmethod
    def create(email, password):
        """Create a new user"""
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO users (email, password_hash) VALUES (?, ?)',
                (email, password_hash)
            )
            return cursor.lastrowid
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
            return cursor.fetchone()
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
            return cursor.fetchone()
    
    @staticmethod
    def verify_password(user, password):
        """Verify user password"""
        return bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8'))

class Document:
    """Document model"""
    
    @staticmethod
    def create(user_id, filename, original_filename, file_path, page_count):
        """Create a new document record"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''INSERT INTO documents (user_id, filename, original_filename, file_path, page_count)
                   VALUES (?, ?, ?, ?, ?)''',
                (user_id, filename, original_filename, file_path, page_count)
            )
            return cursor.lastrowid
    
    @staticmethod
    def get_by_user(user_id):
        """Get all documents for a user"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'SELECT * FROM documents WHERE user_id = ? ORDER BY upload_date DESC',
                (user_id,)
            )
            return cursor.fetchall()
    
    @staticmethod
    def get_by_id(doc_id, user_id):
        """Get a specific document"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'SELECT * FROM documents WHERE id = ? AND user_id = ?',
                (doc_id, user_id)
            )
            return cursor.fetchone()
    
    @staticmethod
    def delete(doc_id, user_id):
        """Delete a document"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'DELETE FROM documents WHERE id = ? AND user_id = ?',
                (doc_id, user_id)
            )
            return cursor.rowcount > 0
    
    @staticmethod
    def get_stats(user_id):
        """Get document statistics for a user"""
        import os
        import pickle
        from config import Config
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''SELECT 
                    COUNT(*) as total_documents,
                    COALESCE(SUM(page_count), 0) as total_pages
                   FROM documents WHERE user_id = ?''',
                (user_id,)
            )
            result = cursor.fetchone()
            
            # Calculate total chunks from vector store metadata
            total_chunks = 0
            metadata_path = os.path.join(Config.VECTOR_STORE_PATH, f"user_{user_id}", "metadata.pkl")
            if os.path.exists(metadata_path):
                try:
                    with open(metadata_path, 'rb') as f:
                        metadata = pickle.load(f)
                        total_chunks = len(metadata)
                except Exception:
                    pass  # If error reading metadata, keep chunks as 0
            
            return {
                'total_documents': result['total_documents'],
                'total_pages': result['total_pages'],
                'total_chunks': total_chunks
            }

class ChatHistory:
    """Chat history model"""
    
    @staticmethod
    def create(user_id, question, answer, sources, session_id=None):
        """Create a new chat history entry"""
        import json
        sources_json = json.dumps(sources) if sources else None
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''INSERT INTO chat_history (user_id, session_id, question, answer, sources)
                   VALUES (?, ?, ?, ?, ?)''',
                (user_id, session_id, question, answer, sources_json)
            )
            return cursor.lastrowid
    
    @staticmethod
    def get_by_user(user_id, limit=50):
        """Get chat history for a user"""
        import json
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''SELECT * FROM chat_history WHERE user_id = ?
                   ORDER BY timestamp DESC LIMIT ?''',
                (user_id, limit)
            )
            rows = cursor.fetchall()
            
            # Parse sources JSON
            history = []
            for row in rows:
                item = dict(row)
                if item['sources']:
                    item['sources'] = json.loads(item['sources'])
                history.append(item)
            
            return history
    
    @staticmethod
    def get_sessions(user_id):
        """Get all chat sessions for a user"""
        import json
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''SELECT session_id, 
                          MIN(timestamp) as first_message,
                          MAX(timestamp) as last_message,
                          COUNT(*) as message_count,
                          (SELECT question FROM chat_history ch2 
                           WHERE ch2.session_id = chat_history.session_id 
                           ORDER BY timestamp ASC LIMIT 1) as first_question
                   FROM chat_history 
                   WHERE user_id = ? AND session_id IS NOT NULL
                   GROUP BY session_id
                   ORDER BY last_message DESC''',
                (user_id,)
            )
            rows = cursor.fetchall()
            
            sessions = []
            for row in rows:
                sessions.append(dict(row))
            
            return sessions
    
    @staticmethod
    def get_by_session(user_id, session_id, limit=100):
        """Get chat history for a specific session"""
        import json
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''SELECT * FROM chat_history 
                   WHERE user_id = ? AND session_id = ?
                   ORDER BY timestamp ASC LIMIT ?''',
                (user_id, session_id, limit)
            )
            rows = cursor.fetchall()
            
            # Parse sources JSON
            history = []
            for row in rows:
                item = dict(row)
                if item['sources']:
                    item['sources'] = json.loads(item['sources'])
                history.append(item)
            
            return history
    
    @staticmethod
    def delete_by_user(user_id):
        """Delete all chat history for a user"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM chat_history WHERE user_id = ?', (user_id,))
            return cursor.rowcount
