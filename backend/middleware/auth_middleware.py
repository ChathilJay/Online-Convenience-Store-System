from functools import wraps

from flask import g, jsonify, request

from repositories.user_repository import UserRepository
from utils.jwt_handler import JWTHandler


def auth_middleware(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 401

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            payload = JWTHandler.verify_token(token)
            if payload is None:
                return jsonify({"error": "Invalid token"}), 402

            user_repo = UserRepository()
            current_user = user_repo.get_by_id(payload.get("user_id"))

            if current_user is None:
                return jsonify({"error": "User not found"}), 403

            # Store user in Flask's g object for access within the request
            # context
            g.user = current_user
            g.user_id = current_user.id

        except Exception as e:
            return jsonify({"error": "Authentication failed"}), 404

        return f(*args, **kwargs)

    return decorated
