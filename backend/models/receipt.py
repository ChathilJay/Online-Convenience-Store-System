from datetime import datetime
import uuid
from database.db import db


class Receipt(db.Model):
    __tablename__ = 'receipts'

    id = db.Column(
        db.String(36),
        primary_key=True,
        default=lambda: str(
            uuid.uuid4()))
    order_id = db.Column(
        db.Integer,
        db.ForeignKey('orders.id'),
        nullable=False)
    payment_id = db.Column(
        db.String(36),
        db.ForeignKey('payments.id'),
        nullable=False)
    receipt_number = db.Column(db.String(50), unique=True, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transaction_id = db.Column(db.String(100), nullable=True)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Customer snapshot for receipt
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(120), nullable=False)

    # Relationships
    order = db.relationship(
        'Order', backref=db.backref(
            'receipt', uselist=False))
    payment = db.relationship(
        'Payment', backref=db.backref(
            'receipt', uselist=False))

    def __init__(self, order_id, payment_id, receipt_number, payment_method,
                 amount, transaction_id=None, customer_name=None, customer_email=None):
        self.order_id = order_id
        self.payment_id = payment_id
        self.receipt_number = receipt_number
        self.payment_method = payment_method
        self.amount = amount
        self.transaction_id = transaction_id
        self.customer_name = customer_name
        self.customer_email = customer_email

    def to_dict(self):
        return {
            'id': self.id,
            'receipt_number': self.receipt_number,
            'order_id': self.order_id,
            'payment_id': self.payment_id,
            'payment_method': self.payment_method,
            'amount': self.amount,
            'transaction_id': self.transaction_id,
            'issued_at': self.issued_at.isoformat() if self.issued_at else None,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email
        }
