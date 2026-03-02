# Quick Start Guide

## Windows Setup

### 1. Backend Setup

Open PowerShell in the backend directory:

```powershell
# Navigate to backend
cd "C:\Users\Annsh\Desktop\RAG Project\backend"

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
copy .env.example .env

# Edit .env file and add your Groq API key
notepad .env
```

In `.env`, set:
```
GROQ_API_KEY=your-groq-api-key-here
SECRET_KEY=your-random-secret-key-here
JWT_SECRET_KEY=your-random-jwt-secret-here
```

**Get Free Groq API Key**: https://console.groq.com/keys

Start the backend:
```powershell
python main.py
```

### 2. Frontend Setup

Open a new PowerShell window in the frontend directory:

```powershell
# Navigate to frontend
cd "C:\Users\Annsh\Desktop\RAG Project\frontend"

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Access the Application

Open your browser and go to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 4. First Use

1. Click "Sign up" to create an account
2. Login with your credentials
3. Upload some PDF documents
4. Start asking questions in the Chat page!

## Common Issues

### Backend Issues

**Issue**: Module not found
**Solution**: Make sure virtual environment is activated and all packages are installed
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Issue**: OpenAI API error
**Solution**: Check your API key in `.env` file is correct and has credits

**Issue**: Database error
**Solution**: Delete `data.db` and restart the backend to recreate it

### Frontend Issues

**Issue**: npm install fails
**Solution**: Delete `node_modules` and try again
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

**Issue**: Cannot connect to backend
**Solution**: Make sure backend is running on port 5000

**Issue**: Login fails
**Solution**: Check browser console for errors and verify backend is running

## Testing the System

1. **Upload Test Documents**:
   - Go to Documents page
   - Drag and drop or select PDF files
   - Wait for processing to complete

2. **Test Chat**:
   - Navigate to Chat page
   - Ask: "What topics are covered in my documents?"
   - Verify you get an answer with sources

3. **Test Summary**:
   - Go to Documents page
   - Click "Summary" on any document
   - Wait for AI-generated summary

4. **Check History**:
   - Go to History page
   - See all your past conversations

## Production Notes

For production deployment:

1. **Backend**:
   - Use a production WSGI server (Gunicorn)
   - Switch to PostgreSQL
   - Set proper SECRET_KEY and JWT_SECRET_KEY
   - Enable HTTPS
   - Set up rate limiting

2. **Frontend**:
   - Build: `npm run build`
   - Serve with Nginx or similar
   - Configure proper CORS
   - Enable compression

3. **Security**:
   - Never commit `.env` files
   - Use strong secret keys
   - Implement rate limiting
   - Regular security updates
   - Monitor API usage

## Support

If you encounter issues:
1. Check the console/terminal for error messages
2. Verify all prerequisites are installed
3. Ensure API keys are valid
4. Check firewall settings
5. Review the main README.md for detailed information

Happy building! 🚀
