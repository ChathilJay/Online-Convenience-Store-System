from database.db import db
from datetime import datetime


class IdempotencyKey(db.Model):
    __tablename__ = 'idempotency_keys'

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(255), nullable=False, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    # e.g., '/api/orders/checkout'
    endpoint = db.Column(db.String(255), nullable=False)
    # Hash of request data for validation
    request_hash = db.Column(db.String(64), nullable=True)
    # JSON response to return for duplicates
    response_data = db.Column(db.Text, nullable=True)
    status_code = db.Column(db.Integer, nullable=True)  # HTTP status code
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)  # Optional expiration

    # Relationships
    user = db.relationship("User", backref="idempotency_keys")

    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'user_id': self.user_id,
            'endpoint': self.endpoint,
            'response_data': self.response_data,
            'status_code': self.status_code,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }
