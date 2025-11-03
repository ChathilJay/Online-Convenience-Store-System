import uuid
from datetime import datetime
from models.invoice import Invoice


class InvoiceService:
    def __init__(self, invoice_repository, notification_service):
        self.invoice_repository = invoice_repository
        self.notification_service = notification_service

    def generate_invoice(self, order) -> Invoice:
        """Generate invoice for paid order - Observer Pattern"""
        invoice_number = self._generate_invoice_number()
        invoice = Invoice(order=order, invoice_number=invoice_number)

        self.invoice_repository.save(invoice)

        # Notify customer
        self.notification_service.send_invoice_notification(invoice)

        return invoice

    def _generate_invoice_number(self) -> str:
        """Generate unique invoice number"""
        timestamp = datetime.utcnow().strftime('%Y%m%d')
        unique_id = str(uuid.uuid4())[:8].upper()
        return f"INV-{timestamp}-{unique_id}"

    def get_invoice_by_order(self, order_id: str) -> Invoice:
        """Retrieve invoice for order"""
        return self.invoice_repository.find_by_order_id(order_id)

    def resend_invoice(self, invoice_id: str) -> bool:
        """Resend invoice to customer"""
        invoice = self.invoice_repository.get_by_id(invoice_id)
        if invoice:
            self.notification_service.send_invoice_notification(invoice)
            return True
        return False
