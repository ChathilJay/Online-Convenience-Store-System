from datetime import datetime
from database.db import db


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Customer snapshot (immutable after creation)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(120), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=True)

    # Address snapshot (immutable after creation)
    shipping_street = db.Column(db.String(255), nullable=True)
    shipping_city = db.Column(db.String(100), nullable=True)
    shipping_state = db.Column(db.String(100), nullable=True)
    shipping_postal_code = db.Column(db.String(20), nullable=True)
    shipping_country = db.Column(db.String(100), nullable=True)

    # Billing address (can be same as shipping)
    billing_street = db.Column(db.String(255), nullable=True)
    billing_city = db.Column(db.String(100), nullable=True)
    billing_state = db.Column(db.String(100), nullable=True)
    billing_postal_code = db.Column(db.String(20), nullable=True)
    billing_country = db.Column(db.String(100), nullable=True)

    # Order details
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="placed")

    # Timestamps
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow)

    # Relationships
    items = db.relationship(
        "OrderItem",
        backref="order",
        cascade="all, delete-orphan")

    # Add payment relationship
    payment_id = db.Column(
        db.String,
        db.ForeignKey('payments.id'),
        nullable=True)
    payment = db.relationship(
        "Payment",
        backref="order",
        foreign_keys=[payment_id])

    def __init__(self, user_id, customer_name, customer_email, customer_phone=None,
                 shipping_street=None, shipping_city=None, shipping_state=None,
                 shipping_postal_code=None, shipping_country=None,
                 billing_street=None, billing_city=None, billing_state=None,
                 billing_postal_code=None, billing_country=None,
                 total_amount=0.0, status="placed", payment_id=None):
        self.user_id = user_id
        self.customer_name = customer_name
        self.customer_email = customer_email
        self.customer_phone = customer_phone
        self.shipping_street = shipping_street
        self.shipping_city = shipping_city
        self.shipping_state = shipping_state
        self.shipping_postal_code = shipping_postal_code
        self.shipping_country = shipping_country
        self.billing_street = billing_street
        self.billing_city = billing_city
        self.billing_state = billing_state
        self.billing_postal_code = billing_postal_code
        self.billing_country = billing_country
        self.total_amount = total_amount
        self.status = status
        self.payment_id = payment_id

    @property
    def item_count(self):
        """Get total number of items in the order"""
        return sum(item.quantity for item in self.items)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "customer_name": self.customer_name,
            "customer_email": self.customer_email,
            "customer_phone": self.customer_phone,
            "shipping_address": {
                "street": self.shipping_street,
                "city": self.shipping_city,
                "state": self.shipping_state,
                "postal_code": self.shipping_postal_code,
                "country": self.shipping_country,
            },
            "billing_address": {
                "street": self.billing_street,
                "city": self.billing_city,
                "state": self.billing_state,
                "postal_code": self.billing_postal_code,
                "country": self.billing_country,
            },
            "total_amount": self.total_amount,
            "status": self.status,
            "item_count": self.item_count,
            "items": [item.to_dict() for item in self.items],
            "payment": self.payment.to_dict() if self.payment else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
