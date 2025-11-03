from database.db import db


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(50), nullable=False, default='general')
    image_path = db.Column(db.String(255), nullable=True)
    low_stock_threshold = db.Column(db.Integer, nullable=False, default=5)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    def __init__(self, name, description, price, stock, image_path=None):
        self.name = name
        self.description = description
        self.price = price
        self.stock = stock
        self.image_path = image_path

    def to_dict(self):
        # Check if image_path is already a full URL or a local file
        image_url = None
        if self.image_path:
            if self.image_path.startswith(('http://', 'https://')):
                image_url = self.image_path
            else:
                image_url = f'/static/product_images/{self.image_path}'

        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'category': self.category,
            'image_path': image_url,
            'is_active': self.is_active
        }

    def can_fulfill_order(self, quantity: int) -> bool:
        """Check if product can fulfill order quantity"""
        return self.stock >= quantity

    def reserve_stock(self, quantity: int) -> bool:
        """Reserve stock for order"""
        if self.can_fulfill_order(quantity):
            self.stock -= quantity
            return True
        return False

    def release_stock(self, quantity: int) -> None:
        """Release reserved stock"""
        self.stock += quantity
