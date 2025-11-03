from database.db import db


class Cart(db.Model):
    __tablename__ = "carts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", backref="carts")
    items = db.relationship(
        "CartItem", back_populates="cart", cascade="all, delete-orphan"
    )

    def get_total(self):
        return sum(item.product.price * item.quantity for item in self.items)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "items": [item.to_dict() for item in self.items],
            "total": self.get_total(),
        }
