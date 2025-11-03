"""
SSE Controller for real-time notifications
"""
from flask import Blueprint, g, request, jsonify
from services.sse_service import sse_service
from utils.jwt_handler import JWTHandler

sse_bp = Blueprint('sse', __name__, url_prefix='/api/sse')


@sse_bp.route('/notifications', methods=['GET'])
def stream_notifications():
    """
    SSE endpoint for streaming real-time notifications to authenticated users
    Since EventSource doesn't support custom headers, we accept token as query param
    """
    # Get token from query parameter
    token = request.args.get('token')

    if not token:
        print("SSE: No token provided")
        return jsonify({'error': 'No authentication token provided'}), 401

    # Verify token
    try:
        payload = JWTHandler.verify_token(token)

        if not payload:
            print("SSE: Token verification failed - invalid token")
            return jsonify({'error': 'Invalid token'}), 401

        user_id = payload.get('user_id')

        if not user_id:
            print("SSE: Token verified but no user_id in payload")
            return jsonify({'error': 'Invalid token payload'}), 401

        print(f"SSE: Connection established for user {user_id}")
        # Return SSE stream
        return sse_service.stream(user_id)
    except Exception as e:
        print(f"SSE: Authentication error - {str(e)}")
        return jsonify({'error': f'Authentication failed: {str(e)}'}), 401
