from datetime import datetime
from domain.payment_strategy import MockPaymentStrategy
from models.payment import Payment
from database.db import db


class PaymentProcessor:
    def __init__(self, payment_strategy=None):
        self.payment_strategy = payment_strategy or MockPaymentStrategy()

    def process_payment(self, amount, payment_details, idempotency_key):
        # Authorize payment
        auth_result = self.payment_strategy.authorize(
            amount, payment_details, idempotency_key)

        if auth_result.success:
            # Capture payment immediately (simplified flow)
            capture_result = self.payment_strategy.capture(
                auth_result.transaction_id)
            return capture_result
        else:
            return auth_result


class PaymentService:
    def __init__(self):
        self.payment_processor = PaymentProcessor()

    def create_payment(self, order_id, amount, payment_method):
        payment = Payment(
            order_id=order_id,
            amount=amount,
            payment_method=payment_method
        )
        db.session.add(payment)
        db.session.commit()
        return payment

    def process_order_payment(
            self, order, payment_details, idempotency_key=None):
        try:
            # Create payment record
            payment = self.create_payment(order.id, order.total_amount, "card")

            # Use provided idempotency key or generate one as fallback
            if not idempotency_key:
                idempotency_key = f"order_{order.id}_{order.created_at.strftime('%Y%m%d%H%M%S')}"

            payment_result = self.payment_processor.process_payment(
                order.total_amount,
                payment_details,
                idempotency_key
            )

            # Update payment status
            payment.status = payment_result.status.value
            payment.transaction_id = payment_result.transaction_id
            payment.updated_at = datetime.utcnow()

            db.session.commit()

            return {
                'success': payment_result.success,
                'payment': payment,
                'message': payment_result.message
            }

        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'error': str(e)
            }
