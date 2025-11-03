from werkzeug.security import check_password_hash, generate_password_hash


class SecurityHelper:
    @staticmethod
    def hash_password(password):
        return generate_password_hash(password)

    @staticmethod
    def verify_password(password, hash_value):
        return check_password_hash(hash_value, password)
