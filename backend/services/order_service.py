from typing import List, Optional
from database.db import db
from models.cart import Cart
from models.order import Order
from models.order_item import OrderItem
from models.user import User
from repositories.order_repository import OrderRepository
from domain.order_lifecycle import (
    OrderStatus, OrderPlacedState, OrderPaidState, OrderDispatchedState,
    OrderDeliveredState, OrderCancelledState
)
from exceptions.order_exceptions import (
    OrderModificationAfterPaymentError,
    OrderAlreadyCancelledError
)


class OrderService:
    """Service layer for order business logic"""

    def __init__(self, order_repository: OrderRepository):
        self.order_repository = order_repository
        self._sse_service = None  # Lazy load to avoid circular imports

    def _get_sse_service(self):
        """Lazy load SSE service to avoid circular imports"""
        if self._sse_service is None:
            from services.sse_service import sse_service
            self._sse_service = sse_service
        return self._sse_service

    def create_order_from_cart(self, cart: Cart, user: User) -> Order:
        """Create a new order from a cart"""
        if not cart.items:
            raise ValueError("Cannot create order from empty cart")

        # Create order using factory method
        order = self._create_order_from_cart(cart, user)

        # Save the order
        self.order_repository.save(order)

        # Send SSE notification for order creation
        self._get_sse_service().send_order_created(
            user.id, order.id, order.total_amount
        )

        return order

    def get_order(self, order_id: int) -> Optional[Order]:
        """Get an order by ID"""
        return self.order_repository.find_by_id(order_id)

    def get_customer_orders(self, customer_id: int) -> List[Order]:
        """Get all orders for a customer"""
        return self.order_repository.find_by_customer(customer_id)

    def get_orders_by_status(self, status: OrderStatus) -> List[Order]:
        """Get all orders with a specific status"""
        return self.order_repository.find_by_status(status)

    def get_recent_orders(self, limit: int = 10) -> List[Order]:
        """Get recent orders"""
        return self.order_repository.find_recent_orders(limit)

    def get_all_orders(self) -> List[Order]:
        """Get all orders (admin only)"""
        return self.order_repository.find_all()

    def dispatch_order(self, order_id: int) -> bool:
        """Mark an order as dispatched"""
        order = self.order_repository.find_by_id(order_id)
        if not order:
            return False

        old_status = order.status
        state_machine = self._get_state_machine(order)
        if state_machine.dispatch():
            order.status = OrderStatus.DISPATCHED.value
            order.updated_at = db.func.now()
            self.order_repository.save(order)

            # Send SSE notification
            self._get_sse_service().send_order_status_update(
                order.user_id, order_id, old_status, OrderStatus.DISPATCHED.value
            )
            return True
        return False

    def deliver_order(self, order_id: int) -> bool:
        """Mark an order as delivered"""
        order = self.order_repository.find_by_id(order_id)
        if not order:
            return False

        old_status = order.status
        state_machine = self._get_state_machine(order)
        if state_machine.deliver():
            order.status = OrderStatus.DELIVERED.value
            order.updated_at = db.func.now()
            self.order_repository.save(order)

            # Send SSE notification
            self._get_sse_service().send_order_status_update(
                order.user_id, order_id, old_status, OrderStatus.DELIVERED.value
            )
            return True
        return False

    def cancel_order(self, order_id: int) -> bool:
        """Cancel an order"""
        order = self.order_repository.find_by_id(order_id)
        if not order:
            return False

        old_status = order.status
        state_machine = self._get_state_machine(order)
        if state_machine.cancel():
            order.status = OrderStatus.CANCELLED.value
            order.updated_at = db.func.now()
            self.order_repository.save(order)

            # Send SSE notification
            self._get_sse_service().send_order_status_update(
                order.user_id, order_id, old_status, OrderStatus.CANCELLED.value
            )
            return True
        return False

    def add_item_to_order(self, order_id: int, product_id: int,
                          quantity: int, unit_price: float):
        """Add item to order (only allowed before payment)"""
        order = self.order_repository.find_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        self._check_immutable_after_payment(order)

        order_item = OrderItem(
            product_id=product_id,
            quantity=quantity,
            unit_price=unit_price)
        order.items.append(order_item)
        self._recalculate_total(order)
        self.order_repository.save(order)

    def remove_item_from_order(self, order_id: int, order_item_id: int):
        """Remove item from order (only allowed before payment)"""
        order = self.order_repository.find_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        self._check_immutable_after_payment(order)

        item_to_remove = None
        for item in order.items:
            if item.id == order_item_id:
                item_to_remove = item
                break

        if item_to_remove:
            order.items.remove(item_to_remove)
            self._recalculate_total(order)
            self.order_repository.save(order)

    def update_order_total(self, order_id: int, new_total: float):
        """Update total amount (only allowed before payment)"""
        order = self.order_repository.find_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        self._check_immutable_after_payment(order)
        order.total_amount = new_total
        order.updated_at = db.func.now()
        self.order_repository.save(order)

    def get_total_revenue(self) -> float:
        """Get total revenue from paid orders"""
        return self.order_repository.get_total_revenue()

    def _create_order_from_cart(self, cart: Cart, user: User) -> Order:
        """Factory method to create Order from Cart with customer/address snapshots"""
        # Create order items from cart items
        order_items = []
        total_amount = 0.0

        for cart_item in cart.items:
            # Create OrderItem with price snapshot
            order_item = OrderItem(
                product_id=cart_item.product_id,
                product_name=cart_item.product.name,
                quantity=cart_item.quantity,
                unit_price=cart_item.product.price
            )
            order_items.append(order_item)
            total_amount += order_item.line_total

        # Create order with customer/address snapshot
        order = Order(
            user_id=cart.user_id,
            customer_name=user.name,
            customer_email=user.email,
            customer_phone=user.phone_number,
            shipping_street=user.street,
            shipping_city=user.city,
            shipping_state=user.state,
            shipping_postal_code=user.postal_code,
            shipping_country=user.country,
            total_amount=total_amount
        )

        # Associate order items with the order
        order.items = order_items

        return order

    def _get_state_machine(self, order: Order):
        """Get the appropriate state machine for the order"""
        status_map = {
            OrderStatus.PLACED.value: OrderPlacedState,
            OrderStatus.PAID.value: OrderPaidState,
            OrderStatus.DISPATCHED.value: OrderDispatchedState,
            OrderStatus.DELIVERED.value: OrderDeliveredState,
            OrderStatus.CANCELLED.value: OrderCancelledState,
        }
        state_class = status_map.get(order.status, OrderPlacedState)
        return state_class(order)

    def _check_immutable_after_payment(self, order: Order):
        """Check if order can be modified (immutable after payment)"""
        if order.status in [OrderStatus.PAID.value,
                            OrderStatus.DISPATCHED.value, OrderStatus.DELIVERED.value]:
            raise OrderModificationAfterPaymentError()
        if order.status == OrderStatus.CANCELLED.value:
            raise OrderAlreadyCancelledError()

    def _recalculate_total(self, order: Order):
        """Recalculate total from items"""
        order.total_amount = sum(item.line_total for item in order.items)
        order.updated_at = db.func.now()
