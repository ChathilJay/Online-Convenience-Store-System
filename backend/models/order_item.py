from database.db import db


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(
        db.Integer,
        db.ForeignKey("orders.id"),
        nullable=False)
    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False)
    product_name = db.Column(db.String(200),
                             nullable=False)  # Snapshot of product name
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    # Snapshot of price at time of order

    # Relationships
    product = db.relationship("Product")

    def __init__(self, product_id, product_name,
                 quantity, unit_price, order_id=None):
        self.order_id = order_id
        self.product_id = product_id
        self.product_name = product_name
        self.quantity = quantity
        self.unit_price = unit_price

    @property
    def line_total(self):
        """Calculate the total for this line item"""
        return self.quantity * self.unit_price

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product_name,
            "product": self.product.to_dict() if self.product else None,
            "quantity": self.quantity,
            "unit_price": self.unit_price,
            "line_total": self.line_total,
        }
