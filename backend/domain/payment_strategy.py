from abc import ABC, abstractmethod
from enum import Enum
from datetime import datetime
from dataclasses import dataclass


class PaymentStatus(Enum):
    PENDING = "pending"
    AUTHORIZED = "authorized"
    CAPTURED = "captured"
    DECLINED = "declined"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


@dataclass
class PaymentResult:
    success: bool
    transaction_id: str
    status: PaymentStatus
    message: str
    amount: float
    timestamp: datetime


class PaymentStrategy(ABC):
    @abstractmethod
    def authorize(self, amount: float, payment_details: dict,
                  idempotency_key: str) -> PaymentResult:
        pass

    @abstractmethod
    def capture(self, transaction_id: str) -> PaymentResult:
        pass

    @abstractmethod
    def refund(self, transaction_id: str, amount: float) -> PaymentResult:
        pass


class MockPaymentStrategy(PaymentStrategy):
    def __init__(self):
        self.processed_keys = set()  # Track idempotency keys

    def authorize(self, amount: float, payment_details: dict,
                  idempotency_key: str) -> PaymentResult:
        # Idempotency check
        if idempotency_key in self.processed_keys:
            return PaymentResult(
                success=False,
                transaction_id=f"dup_{idempotency_key}",
                status=PaymentStatus.DECLINED,
                message="Duplicate transaction detected",
                amount=amount,
                timestamp=datetime.utcnow()
            )

        # Mock validation
        card_number = payment_details.get('card_number', '')
        if not self._validate_card(card_number):
            return PaymentResult(
                success=False,
                transaction_id="",
                status=PaymentStatus.DECLINED,
                message="Invalid card details",
                amount=amount,
                timestamp=datetime.utcnow()
            )

        # Simulate processing delay
        import time
        time.sleep(1)

        transaction_id = f"mock_tx_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        self.processed_keys.add(idempotency_key)

        return PaymentResult(
            success=True,
            transaction_id=transaction_id,
            status=PaymentStatus.AUTHORIZED,
            message="Payment authorized successfully",
            amount=amount,
            timestamp=datetime.utcnow()
        )

    def capture(self, transaction_id: str) -> PaymentResult:
        return PaymentResult(
            success=True,
            transaction_id=transaction_id,
            status=PaymentStatus.CAPTURED,
            message="Payment captured successfully",
            amount=0.0,  # Would be actual amount
            timestamp=datetime.utcnow()
        )

    def refund(self, transaction_id: str, amount: float) -> PaymentResult:
        return PaymentResult(
            success=True,
            transaction_id=transaction_id,
            status=PaymentStatus.REFUNDED,
            message="Refund processed successfully",
            amount=amount,
            timestamp=datetime.utcnow()
        )

    def _validate_card(self, card_number: str) -> bool:
        """Simple mock card validation"""
        test_cards = [
            '4111111111111111',
            '4242424242424242',
            '5555555555554444']
        return card_number in test_cards
