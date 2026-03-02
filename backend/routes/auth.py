"""
Authentication routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from database import User
import re

bp = Blueprint('auth', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    return True, ""

@bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validation
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Check if user already exists
        if User.find_by_email(email):
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create user
        user_id = User.create(email, password)
        
        # Generate tokens
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {'id': user_id, 'email': email}
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.find_by_email(email)
        if not user or not User.verify_password(user, password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate tokens
        access_token = create_access_token(identity=user['id'])
        refresh_token = create_refresh_token(identity=user['id'])
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {'id': user['id'], 'email': user['email']}
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        user_id = get_jwt_identity()
        access_token = create_access_token(identity=user_id)
        return jsonify({'access_token': access_token}), 200
    except Exception as e:
        return jsonify({'error': f'Token refresh failed: {str(e)}'}), 500

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': user['id'],
            'email': user['email'],
            'created_at': user['created_at']
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get user info: {str(e)}'}), 500
