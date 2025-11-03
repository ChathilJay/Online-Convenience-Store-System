from typing import List, Optional
from database.db import db
from models.order import Order
from domain.order_lifecycle import OrderStatus


class OrderRepository:
    """Concrete implementation of OrderRepository using SQLAlchemy"""

    def save(self, order: Order) -> None:
        """Save or update an order"""
        db.session.add(order)
        db.session.commit()

    def find_by_id(self, order_id: int) -> Optional[Order]:
        """Find an order by its ID"""
        return Order.query.get(order_id)

    def find_by_customer(self, customer_id: int) -> List[Order]:
        """Find all orders for a specific customer"""
        return Order.query.filter_by(user_id=customer_id).order_by(
            Order.created_at.desc()).all()

    def find_by_status(self, status: OrderStatus) -> List[Order]:
        """Find all orders with a specific status"""
        return Order.query.filter_by(status=status.value).order_by(
            Order.created_at.desc()).all()

    def update_status(self, order_id: int, status: OrderStatus) -> bool:
        """Update the status of an order. Returns True if successful."""
        order = self.find_by_id(order_id)
        if not order:
            return False

        order.status = status.value
        order.updated_at = db.func.now()
        db.session.commit()
        return True

    def find_recent_orders(self, limit: int = 10) -> List[Order]:
        """Find the most recent orders, limited by the specified number"""
        return Order.query.order_by(Order.created_at.desc()).limit(limit).all()

    def find_all(self) -> List[Order]:
        """Find all orders"""
        return Order.query.order_by(Order.created_at.desc()).all()

    def get_total_revenue(self) -> float:
        """Calculate total revenue from all paid orders"""
        from sqlalchemy import func
        result = db.session.query(func.sum(Order.total_amount)).filter(
            Order.status.in_([OrderStatus.PAID.value,
                              OrderStatus.DISPATCHED.value,
                              OrderStatus.DELIVERED.value])
        ).scalar()
        return result or 0.0
