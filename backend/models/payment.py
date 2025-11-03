from database.db import db
from datetime import datetime
import uuid


class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(
        db.String(36),
        primary_key=True,
        default=lambda: str(
            uuid.uuid4()))
    order_id = db.Column(
        db.Integer,
        db.ForeignKey('orders.id'),
        nullable=False,
        unique=True)  # One payment per order
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    transaction_id = db.Column(db.String(100), nullable=True)
    idempotency_key = db.Column(db.String(255), unique=True)
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow)

    # Relationships
    # order relationship is defined via backref in Order model

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'amount': self.amount,
            'payment_method': self.payment_method,
            'status': self.status,
            'transaction_id': self.transaction_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def can_refund(self) -> bool:
        return self.status in ['captured', 'authorized']

    def mark_captured(self, transaction_id: str):
        self.status = 'captured'
        self.transaction_id = transaction_id
        self.updated_at = datetime.utcnow()

    def mark_declined(self, error_message: str):
        self.status = 'declined'
        self.error_message = error_message
        self.updated_at = datetime.utcnow()
