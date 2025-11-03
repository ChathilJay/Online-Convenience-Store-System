from models.invoice import Invoice
from database.db import db


class InvoiceRepository:
    def save(self, invoice: Invoice) -> Invoice:
        db.session.add(invoice)
        db.session.commit()
        return invoice

    def get_by_id(self, invoice_id: str) -> Invoice:
        return Invoice.query.get(invoice_id)

    def find_by_order_id(self, order_id: str) -> Invoice:
        return Invoice.query.filter_by(order_id=order_id).first()

    def find_by_customer(self, customer_email: str) -> list:
        return Invoice.query.filter_by(customer_email=customer_email).all()
