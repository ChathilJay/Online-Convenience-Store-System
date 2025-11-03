from datetime import datetime, timedelta
import uuid
from database.db import db


class Invoice(db.Model):
    __tablename__ = 'invoices'

    id = db.Column(
        db.String(36),
        primary_key=True,
        default=lambda: str(
            uuid.uuid4()))
    order_id = db.Column(
        db.Integer,
        db.ForeignKey('orders.id'),
        nullable=False)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    issue_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    tax_amount = db.Column(db.Float, default=0.0)
    shipping_amount = db.Column(db.Float, default=0.0)
    # issued, paid, cancelled
    status = db.Column(db.String(20), default='issued')

    # Customer snapshot
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(120), nullable=False)
    billing_address = db.Column(db.JSON, nullable=False)

    # Relationships
    order = db.relationship(
        'Order', backref=db.backref(
            'invoice', uselist=False))

    def __init__(self, order, invoice_number):
        self.order_id = order.id
        self.invoice_number = invoice_number
        self.total_amount = order.total_amount
        self.due_date = datetime.utcnow() + timedelta(days=30)  # 30 days terms

        # Snapshot customer data
        self.customer_name = order.customer_name
        self.customer_email = order.customer_email
        self.billing_address = {
            'street': order.billing_street,
            'city': order.billing_city,
            'state': order.billing_state,
            'postal_code': order.billing_postal_code,
            'country': order.billing_country
        }

    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'issue_date': self.issue_date.isoformat(),
            'due_date': self.due_date.isoformat(),
            'total_amount': self.total_amount,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'status': self.status,
            'order_id': self.order_id
        }
