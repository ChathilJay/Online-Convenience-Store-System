# Custom Exceptions for Order State Transitions
class InvalidOrderStateTransitionError(Exception):
    """Raised when attempting an invalid state transition"""

    def __init__(self, current_state, attempted_state, message=None):
        self.current_state = current_state
        self.attempted_state = attempted_state
        if message is None:
            message = f"Cannot transition from {current_state} to {attempted_state}"
        super().__init__(message)


class OrderModificationAfterPaymentError(Exception):
    """Raised when attempting to modify an order after payment"""

    def __init__(self, message="Cannot modify order after payment"):
        super().__init__(message)


class OrderAlreadyCancelledError(Exception):
    """Raised when attempting to modify a cancelled order"""

    def __init__(self, message="Cannot modify a cancelled order"):
        super().__init__(message)
