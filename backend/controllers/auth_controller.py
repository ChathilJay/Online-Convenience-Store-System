from flask import Blueprint, g, jsonify, request

from middleware.auth_middleware import auth_middleware
from repositories.user_repository import UserRepository
from services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
auth_service = AuthService(UserRepository())


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    if not data or not all(k in data for k in ("name", "email", "password")):
        return jsonify({"error": "Missing fields"}), 400

    try:
        # Allow admin creation only when no users exist (first user)
        user_type = 'admin' if UserRepository().get_user_count() == 0 else 'customer'
        user, access_token = auth_service.register_user(
            data["name"],
            data["email"],
            data["password"],
            user_type
        )
        return jsonify({
            "message": "User registered successfully",
            "user": user.to_dict(),
            "access_token": access_token,
            "token_type": "bearer"
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data or not all(k in data for k in ("email", "password")):
        return jsonify({"error": "Missing fields"}), 400

    try:
        user, access_token = auth_service.login_user(
            data["email"], data["password"])
        return jsonify({
            "message": "Login successful",
            "user": user.to_dict(),
            "access_token": access_token,
            "token_type": "bearer"
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401


@auth_bp.route("/me", methods=["GET"])
@auth_middleware
def get_current_user():
    return jsonify({"user": g.user.to_dict()}), 200


@auth_bp.route("/profile", methods=["PUT"])
@auth_middleware
def update_profile():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        updated_user = auth_service.update_profile(g.user.id, data)
        return jsonify({
            "message": "Profile updated successfully",
            "user": updated_user.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/password", methods=["PUT"])
@auth_middleware
def change_password():
    data = request.json
    if not data or not all(k in data for k in (
            "current_password", "new_password")):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        updated_user = auth_service.change_password(
            g.user.id,
            data["current_password"],
            data["new_password"]
        )
        return jsonify({
            "message": "Password changed successfully",
            "user": updated_user.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
