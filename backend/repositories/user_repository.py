from database.db import db
from models.user import User


class UserRepository:
    def get_by_email(self, email):
        return User.query.filter_by(email=email).first()

    def get_by_id(self, user_id):
        return User.query.get(user_id)

    def add_user(self, user):
        db.session.add(user)
        db.session.commit()
        return user

    def get_user_count(self):
        return User.query.count()

    def update_profile(self, user_id, profile_data):
        user = self.get_by_id(user_id)
        if not user:
            return None

        # Update only the provided fields
        for field in ['name', 'phone_number', 'address',
                      'street', 'city', 'state', 'postal_code', 'country']:
            if field in profile_data:
                setattr(user, field, profile_data[field])

        db.session.commit()
        return user

    def update_password(self, user_id, new_password_hash):
        user = self.get_by_id(user_id)
        if not user:
            return None

        user.password_hash = new_password_hash
        db.session.commit()
        return user
