from enum import Enum
from abc import ABC, abstractmethod
from exceptions.order_exceptions import InvalidOrderStateTransitionError, OrderAlreadyCancelledError


class OrderStatus(Enum):
    PLACED = "placed"  # Order created but not paid
    PAID = "paid"  # Payment successful
    DISPATCHED = "dispatched"  # Shipped to customer
    DELIVERED = "delivered"  # Customer received
    CANCELLED = "cancelled"  # Order cancelled


class OrderState(ABC):
    """Abstract base class for order states"""

    def __init__(self, order):
        self.order = order

    @property
    @abstractmethod
    def status(self):
        """Return the OrderStatus enum value for this state"""
        pass

    @abstractmethod
    def can_transition_to(self, new_state_class):
        """Check if transition to new state is allowed"""
        pass

    @abstractmethod
    def pay(self):
        """Handle payment action"""
        pass

    @abstractmethod
    def dispatch(self):
        """Handle dispatch action"""
        pass

    @abstractmethod
    def deliver(self):
        """Handle delivery action"""
        pass

    @abstractmethod
    def cancel(self):
        """Handle cancellation action"""
        pass

    def _check_not_cancelled(self):
        """Helper to check order is not cancelled"""
        if self.order.status == OrderStatus.CANCELLED.value:
            raise OrderAlreadyCancelledError()


class OrderPlacedState(OrderState):
    """Order has been placed but not paid"""

    @property
    def status(self):
        return OrderStatus.PLACED

    def can_transition_to(self, new_state_class):
        return new_state_class in [OrderPaidState, OrderCancelledState]

    def pay(self):
        """Transition to paid state"""
        return True

    def dispatch(self):
        """Cannot dispatch unpaid order"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.DISPATCHED.value,
            "Cannot dispatch an unpaid order"
        )

    def deliver(self):
        """Cannot deliver unpaid order"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.DELIVERED.value,
            "Cannot deliver an unpaid order"
        )

    def cancel(self):
        """Cancel the order"""
        return True


class OrderPaidState(OrderState):
    """Order has been paid"""

    @property
    def status(self):
        return OrderStatus.PAID

    def can_transition_to(self, new_state_class):
        return new_state_class in [OrderDispatchedState, OrderCancelledState]

    def pay(self):
        """Already paid"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.PAID.value,
            "Order is already paid"
        )

    def dispatch(self):
        """Transition to dispatched state"""
        return True

    def deliver(self):
        """Cannot deliver undispatched order"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.DELIVERED.value,
            "Cannot deliver an undispatched order"
        )

    def cancel(self):
        """Cancel the paid order (may involve refunds)"""
        return True


class OrderDispatchedState(OrderState):
    """Order has been dispatched/shipped"""

    @property
    def status(self):
        return OrderStatus.DISPATCHED

    def can_transition_to(self, new_state_class):
        return new_state_class in [OrderDeliveredState]

    def pay(self):
        """Already paid"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.PAID.value,
            "Order is already paid"
        )

    def dispatch(self):
        """Already dispatched"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.DISPATCHED.value,
            "Order is already dispatched"
        )

    def deliver(self):
        """Mark as delivered"""
        return True

    def cancel(self):
        """Cannot cancel dispatched order"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.CANCELLED.value,
            "Cannot cancel a dispatched order"
        )


class OrderDeliveredState(OrderState):
    """Order has been delivered"""

    @property
    def status(self):
        return OrderStatus.DELIVERED

    def can_transition_to(self, new_state_class):
        # Final state - no transitions allowed
        return False

    def pay(self):
        """Already paid"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.PAID.value,
            "Order is already paid"
        )

    def dispatch(self):
        """Already dispatched"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.DISPATCHED.value,
            "Order is already dispatched"
        )

    def deliver(self):
        """Already delivered"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.DELIVERED.value,
            "Order is already delivered"
        )

    def cancel(self):
        """Cannot cancel delivered order"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.CANCELLED.value,
            "Cannot cancel a delivered order"
        )


class OrderCancelledState(OrderState):
    """Order has been cancelled"""

    @property
    def status(self):
        return OrderStatus.CANCELLED

    def can_transition_to(self, new_state_class):
        # Final state - no transitions allowed
        return False

    def pay(self):
        """Cannot pay cancelled order"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.PAID.value,
            "Cannot pay a cancelled order"
        )

    def dispatch(self):
        """Cannot dispatch cancelled order"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.DISPATCHED.value,
            "Cannot dispatch a cancelled order"
        )

    def deliver(self):
        """Cannot deliver cancelled order"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.DELIVERED.value,
            "Cannot deliver a cancelled order"
        )

    def cancel(self):
        """Already cancelled"""
        raise InvalidOrderStateTransitionError(
            self.status.value, OrderStatus.CANCELLED.value,
            "Order is already cancelled"
        )
