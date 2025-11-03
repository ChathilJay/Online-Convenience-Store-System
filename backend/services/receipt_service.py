import uuid
from datetime import datetime
from models.receipt import Receipt
from database.db import db


class ReceiptService:
    def __init__(self, notification_service=None):
        self.notification_service = notification_service

    def generate_receipt(self, payment, order) -> Receipt:
        """
        Generate receipt for completed payment.
        Called after payment is successfully captured.
        """
        receipt_number = self._generate_receipt_number()

        receipt = Receipt(
            order_id=order.id,
            payment_id=payment.id,
            receipt_number=receipt_number,
            payment_method=payment.payment_method,
            amount=payment.amount,
            transaction_id=payment.transaction_id,
            customer_name=order.customer_name,
            customer_email=order.customer_email
        )

        db.session.add(receipt)
        db.session.commit()

        # Notify customer via email
        if self.notification_service:
            self.notification_service.send_receipt_email(receipt, order)

        return receipt

    def get_receipt(self, receipt_id: str) -> Receipt:
        """Retrieve receipt by ID"""
        return Receipt.query.get(receipt_id)

    def get_receipt_by_order(self, order_id: int) -> Receipt:
        """Retrieve receipt for a specific order"""
        return Receipt.query.filter_by(order_id=order_id).first()

    def get_receipt_by_number(self, receipt_number: str) -> Receipt:
        """Retrieve receipt by receipt number"""
        return Receipt.query.filter_by(receipt_number=receipt_number).first()

    def get_customer_receipts(self, customer_email: str):
        """Get all receipts for a customer"""
        return Receipt.query.filter_by(customer_email=customer_email).order_by(
            Receipt.issued_at.desc()
        ).all()

    def resend_receipt(self, receipt_id: str) -> bool:
        """Resend receipt to customer"""
        receipt = self.get_receipt(receipt_id)
        if receipt and self.notification_service:
            order = receipt.order
            self.notification_service.send_receipt_email(receipt, order)
            return True
        return False

    def _generate_receipt_number(self) -> str:
        """Generate unique receipt number"""
        timestamp = datetime.utcnow().strftime('%Y%m%d')
        unique_id = str(uuid.uuid4())[:8].upper()
        return f"RCP-{timestamp}-{unique_id}"
