"""Seed script to populate the database with test data"""

from datetime import datetime, timedelta
from database.db import db
from models.user import User
from models.product import Product
from models.cart import Cart
from models.cart_item import CartItem
from models.order import Order
from models.order_item import OrderItem
from models.payment import Payment
from models.idempotency_key import IdempotencyKey
from main import app  # to get the app context
import uuid

def seed_database():
    with app.app_context():
        print("Starting database seeding...")
        
        # Clear existing data (optional, for fresh start)
        print("Clearing existing data...")
        db.session.query(IdempotencyKey).delete()
        db.session.query(OrderItem).delete()
        
        # Need to clear payment_id from orders first before deleting payments
        orders = db.session.query(Order).all()
        for order in orders:
            order.payment_id = None
        db.session.commit()
        
        db.session.query(Payment).delete()
        db.session.query(Order).delete()
        db.session.query(CartItem).delete()
        db.session.query(Cart).delete()
        db.session.query(Product).delete()
        db.session.query(User).delete()
        db.session.commit()

        # Create admin user
        print("Creating admin user...")
        admin = User(
            name="Admin User",
            email="admin@store.com",
            password="admin123"
        )
        admin.user_type = "admin"
        admin.phone_number = "+1234567890"
        admin.address = "123 Admin Street"
        admin.street = "123 Admin Street"
        admin.city = "New York"
        admin.state = "NY"
        admin.postal_code = "10001"
        admin.country = "USA"
        db.session.add(admin)
        
        # Create regular users
        print("Creating customer users...")
        customer1 = User(
            name="John Doe",
            email="john@example.com",
            password="password123"
        )
        customer1.phone_number = "+1234567891"
        customer1.address = "456 Customer Ave"
        customer1.street = "456 Customer Ave"
        customer1.city = "Los Angeles"
        customer1.state = "CA"
        customer1.postal_code = "90001"
        customer1.country = "USA"
        db.session.add(customer1)
        
        customer2 = User(
            name="Jane Smith",
            email="jane@example.com",
            password="password123"
        )
        customer2.phone_number = "+1234567892"
        customer2.address = "789 Buyer Blvd"
        customer2.street = "789 Buyer Blvd"
        customer2.city = "Chicago"
        customer2.state = "IL"
        customer2.postal_code = "60601"
        customer2.country = "USA"
        db.session.add(customer2)
        
        db.session.commit()
        
        # Create products
        print("Creating products...")
        products_data = [
            {
                "name": "Wireless Headphones",
                "description": "High-quality wireless headphones with noise cancellation",
                "price": 99.99,
                "stock": 50,
                "category": "Electronics",
                "low_stock_threshold": 10,
                "image_path": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
            },
            {
                "name": "Smart Watch",
                "description": "Fitness tracking smartwatch with heart rate monitor",
                "price": 199.99,
                "stock": 30,
                "category": "Electronics",
                "low_stock_threshold": 5,
                "image_path": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
            },
            {
                "name": "Coffee Maker",
                "description": "Programmable coffee maker with thermal carafe",
                "price": 79.99,
                "stock": 25,
                "category": "Home & Kitchen",
                "low_stock_threshold": 8,
                "image_path": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500"
            },
            {
                "name": "Yoga Mat",
                "description": "Non-slip yoga mat with carrying strap",
                "price": 29.99,
                "stock": 100,
                "category": "Sports",
                "low_stock_threshold": 20,
                "image_path": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500"
            },
            {
                "name": "Bluetooth Speaker",
                "description": "Portable waterproof Bluetooth speaker",
                "price": 49.99,
                "stock": 60,
                "category": "Electronics",
                "low_stock_threshold": 15,
                "image_path": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"
            },
            {
                "name": "Running Shoes",
                "description": "Comfortable running shoes with cushioned sole",
                "price": 89.99,
                "stock": 40,
                "category": "Sports",
                "low_stock_threshold": 10,
                "image_path": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
            },
            {
                "name": "Backpack",
                "description": "Durable laptop backpack with multiple compartments",
                "price": 59.99,
                "stock": 45,
                "category": "Accessories",
                "low_stock_threshold": 12,
                "image_path": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"
            },
            {
                "name": "Water Bottle",
                "description": "Insulated stainless steel water bottle",
                "price": 24.99,
                "stock": 80,
                "category": "Sports",
                "low_stock_threshold": 20,
                "image_path": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500"
            },
            {
                "name": "Desk Lamp",
                "description": "LED desk lamp with adjustable brightness",
                "price": 39.99,
                "stock": 35,
                "category": "Home & Kitchen",
                "low_stock_threshold": 10,
                "image_path": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500"
            },
            {
                "name": "Phone Case",
                "description": "Protective phone case with card holder",
                "price": 19.99,
                "stock": 120,
                "category": "Accessories",
                "low_stock_threshold": 25,
                "image_path": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500"
            },
            {
                "name": "Notebook Set",
                "description": "Set of 3 premium notebooks with lined pages",
                "price": 14.99,
                "stock": 90,
                "category": "Stationery",
                "low_stock_threshold": 30,
                "image_path": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500"
            },
            {
                "name": "USB-C Cable",
                "description": "Fast charging USB-C cable 6ft",
                "price": 12.99,
                "stock": 150,
                "category": "Electronics",
                "low_stock_threshold": 40,
                "image_path": "https://images.unsplash.com/photo-1591290619762-5b09d0d1aa1c?w=500"
            }
        ]
        
        products = []
        for product_data in products_data:
            product = Product(
                name=product_data["name"],
                description=product_data["description"],
                price=product_data["price"],
                stock=product_data["stock"],
                image_path=product_data["image_path"]
            )
            product.category = product_data["category"]
            product.low_stock_threshold = product_data["low_stock_threshold"]
            db.session.add(product)
            products.append(product)
        
        db.session.commit()
        
        # Create a cart with items for customer1
        print("Creating sample cart...")
        cart1 = Cart(user_id=customer1.id)
        db.session.add(cart1)
        db.session.commit()
        
        # Add some items to customer1's cart
        cart_item1 = CartItem(cart_id=cart1.id, product_id=products[0].id, quantity=1)
        cart_item2 = CartItem(cart_id=cart1.id, product_id=products[1].id, quantity=2)
        db.session.add(cart_item1)
        db.session.add(cart_item2)
        db.session.commit()
        
        # Create sample orders
        print("Creating sample orders...")
        
        # Order 1 - Completed order for customer1
        order1 = Order(
            user_id=customer1.id,
            customer_name=customer1.name,
            customer_email=customer1.email,
            customer_phone=customer1.phone_number,
            shipping_street=customer1.street,
            shipping_city=customer1.city,
            shipping_state=customer1.state,
            shipping_postal_code=customer1.postal_code,
            shipping_country=customer1.country,
            billing_street=customer1.street,
            billing_city=customer1.city,
            billing_state=customer1.state,
            billing_postal_code=customer1.postal_code,
            billing_country=customer1.country,
            total_amount=229.97,
            status="delivered"
        )
        order1.created_at = datetime.utcnow() - timedelta(days=5)
        order1.updated_at = datetime.utcnow() - timedelta(days=2)
        db.session.add(order1)
        db.session.commit()
        
        # Order items for order1
        order_item1 = OrderItem(
            order_id=order1.id,
            product_id=products[0].id,
            product_name=products[0].name,
            quantity=1,
            unit_price=products[0].price
        )
        order_item2 = OrderItem(
            order_id=order1.id,
            product_id=products[4].id,
            product_name=products[4].name,
            quantity=2,
            unit_price=products[4].price
        )
        order_item3 = OrderItem(
            order_id=order1.id,
            product_id=products[7].id,
            product_name=products[7].name,
            quantity=3,
            unit_price=products[7].price
        )
        db.session.add_all([order_item1, order_item2, order_item3])
        db.session.commit()
        
        # Payment for order1
        payment1 = Payment(
            id=str(uuid.uuid4()),
            order_id=order1.id,
            amount=order1.total_amount,
            payment_method="credit_card",
            status="completed",
            transaction_id=f"TXN{uuid.uuid4().hex[:10].upper()}",
            created_at=datetime.utcnow() - timedelta(days=5),
            updated_at=datetime.utcnow() - timedelta(days=5)
        )
        db.session.add(payment1)
        order1.payment_id = payment1.id
        db.session.commit()
        
        # Order 2 - Processing order for customer2
        order2 = Order(
            user_id=customer2.id,
            customer_name=customer2.name,
            customer_email=customer2.email,
            customer_phone=customer2.phone_number,
            shipping_street=customer2.street,
            shipping_city=customer2.city,
            shipping_state=customer2.state,
            shipping_postal_code=customer2.postal_code,
            shipping_country=customer2.country,
            billing_street=customer2.street,
            billing_city=customer2.city,
            billing_state=customer2.state,
            billing_postal_code=customer2.postal_code,
            billing_country=customer2.country,
            total_amount=289.98,
            status="processing"
        )
        order2.created_at = datetime.utcnow() - timedelta(days=1)
        order2.updated_at = datetime.utcnow() - timedelta(hours=12)
        db.session.add(order2)
        db.session.commit()
        
        # Order items for order2
        order_item4 = OrderItem(
            order_id=order2.id,
            product_id=products[1].id,
            product_name=products[1].name,
            quantity=1,
            unit_price=products[1].price
        )
        order_item5 = OrderItem(
            order_id=order2.id,
            product_id=products[5].id,
            product_name=products[5].name,
            quantity=1,
            unit_price=products[5].price
        )
        db.session.add_all([order_item4, order_item5])
        db.session.commit()
        
        # Payment for order2
        payment2 = Payment(
            id=str(uuid.uuid4()),
            order_id=order2.id,
            amount=order2.total_amount,
            payment_method="paypal",
            status="completed",
            transaction_id=f"TXN{uuid.uuid4().hex[:10].upper()}",
            created_at=datetime.utcnow() - timedelta(days=1),
            updated_at=datetime.utcnow() - timedelta(days=1)
        )
        db.session.add(payment2)
        order2.payment_id = payment2.id
        db.session.commit()
        
        # Create sample idempotency keys
        print("Creating sample idempotency keys...")
        idempotency_key1 = IdempotencyKey(
            key=str(uuid.uuid4()),
            user_id=customer1.id,
            endpoint="/api/orders/checkout",
            request_hash="abc123hash",
            response_data='{"order_id": 1, "status": "success"}',
            status_code=201,
            created_at=datetime.utcnow() - timedelta(days=5),
            expires_at=datetime.utcnow() + timedelta(days=25)
        )
        db.session.add(idempotency_key1)
        db.session.commit()
        
        print("\n" + "="*60)
        print("Database seeded successfully!")
        print("="*60)
        print("\nTest Accounts:")
        print("-" * 60)
        print("Admin Account:")
        print("  Email: admin@store.com")
        print("  Password: admin123")
        print("\nCustomer Accounts:")
        print("  Email: john@example.com")
        print("  Password: password123")
        print("\n  Email: jane@example.com")
        print("  Password: password123")
        print("-" * 60)
        print(f"\nTotal Users: {User.query.count()}")
        print(f"Total Products: {Product.query.count()}")
        print(f"Total Carts: {Cart.query.count()}")
        print(f"Total Cart Items: {CartItem.query.count()}")
        print(f"Total Orders: {Order.query.count()}")
        print(f"Total Order Items: {OrderItem.query.count()}")
        print(f"Total Payments: {Payment.query.count()}")
        print(f"Total Idempotency Keys: {IdempotencyKey.query.count()}")
        print("="*60)

if __name__ == "__main__":
    seed_database()