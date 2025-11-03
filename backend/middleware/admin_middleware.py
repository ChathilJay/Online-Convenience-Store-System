from functools import wraps
from flask import request, jsonify
from models.user import User
from utils.jwt_handler import JWTHandler


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            data = JWTHandler.verify_token(token)
            if not data:
                raise ValueError("Invalid token")
            current_user = User.query.filter_by(id=data['user_id']).first()

            if not current_user or current_user.user_type != 'admin':
                return jsonify({'message': 'Admin access required'}), 403

            return f(*args, **kwargs)
        except Exception:
            return jsonify({'message': 'Invalid token'}), 401

    return decorated
