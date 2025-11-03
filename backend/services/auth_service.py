from datetime import timedelta

from models.user import User
from utils.jwt_handler import JWTHandler, ACCESS_TOKEN_EXPIRE_MINUTES
from utils.validator import validate_profile_update, validate_password_change
from werkzeug.security import generate_password_hash


class AuthService:
    def __init__(self, user_repository):
        self.user_repository = user_repository

    def register_user(self, name, email, password, user_type='customer'):
        if self.user_repository.get_by_email(email):
            raise ValueError("Email already exists")

        new_user = User(name, email, password)
        new_user.user_type = user_type
        user = self.user_repository.add_user(new_user)

        # Generate access token
        access_token = self._create_token(user)
        return user, access_token

    def login_user(self, email, password):
        user = self.user_repository.get_by_email(email)
        if not user:
            raise ValueError("Invalid email")

        if not user.check_password(password):
            raise ValueError("Invalid password")

        # Generate access token
        access_token = self._create_token(user)
        return user, access_token

    def _create_token(self, user):
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        return JWTHandler.create_access_token(
            data={"user_id": user.id, "email": user.email},
            expires_delta=access_token_expires,
        )

    def update_profile(self, user_id, profile_data):
        # Validate profile data
        validation_errors = validate_profile_update(profile_data)
        if validation_errors:
            raise ValueError(validation_errors)

        # Update user profile
        updated_user = self.user_repository.update_profile(
            user_id, profile_data)
        if not updated_user:
            raise ValueError("User not found")

        return updated_user

    def change_password(self, user_id, current_password, new_password):
        # Validate password change data
        validation_errors = validate_password_change({
            "current_password": current_password,
            "new_password": new_password
        })
        if validation_errors:
            raise ValueError(validation_errors)

        # Get user and verify current password
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if not user.check_password(current_password):
            raise ValueError("Current password is incorrect")

        # Update password
        new_password_hash = generate_password_hash(new_password)
        updated_user = self.user_repository.update_password(
            user_id, new_password_hash)

        return updated_user
