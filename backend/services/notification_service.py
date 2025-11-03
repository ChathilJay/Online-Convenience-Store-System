from typing import Protocol
from models.user import User
from repositories.user_repository import UserRepository


class Observer(Protocol):
    def update(self, message: str) -> None:
        pass


class NotificationService(Observer):
    def __init__(self):
        self._user_repository = UserRepository()

    def update(self, message: str) -> None:
        """
        Send notification to all admin users
        """
        admin_users = self._user_repository.get_users_by_type('admin')
        for admin in admin_users:
            self._notify_admin(admin, message)

    def _notify_admin(self, admin: User, message: str) -> None:
        """
        Currently prints to console, but could be extended to:
        - Send emails
        - Send SMS
        - Push notifications
        - Slack notifications
        etc.
        """
        print(f"Notification sent to admin {admin.email}: {message}")

    def send_invoice_notification(self, invoice) -> None:
        """
        Send invoice notification to customer
        """
        print(
            f"Invoice {invoice.invoice_number} sent to customer {invoice.customer_email}")
        # In a real application, this would send an email with the invoice

    def send_order_confirmation(self, order, invoice) -> None:
        """
        Send order confirmation to customer
        """
        print(f"Order confirmation sent to customer {order.customer_email}")
        print(f"Order ID: {order.id}, Invoice: {invoice.invoice_number}")
        # In a real application, this would send an email with order details

    def send_receipt_email(self, receipt, order) -> None:
        """
        Send receipt (proof of payment) to customer
        """
        print(
            f"Receipt {receipt.receipt_number} sent to customer {receipt.customer_email}")
        print(f"Payment confirmed - Transaction ID: {receipt.transaction_id}")
        print(f"Amount: ${receipt.amount}, Method: {receipt.payment_method}")
        # In a real application, this would send an email with the receipt
