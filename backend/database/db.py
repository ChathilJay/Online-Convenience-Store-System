from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()


def init_db(app):
    """Initialize the database with the Flask app."""
    db.init_app(app)

    # Import models after db initialization to avoid circular imports
    from models.product import Product
    from models.user import User
    from models.cart import Cart
    from models.cart_item import CartItem
    from models.order_item import OrderItem
    from models.order import Order

    # Initialize Flask-Migrate
    migrate = Migrate(app, db)

    return db
