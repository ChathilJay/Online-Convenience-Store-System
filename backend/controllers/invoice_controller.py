from flask import Blueprint, g, jsonify
from middleware.auth_middleware import auth_middleware
from services.invoice_service import InvoiceService
from repositories.invoice_repository import InvoiceRepository
from services.notification_service import NotificationService

invoice_bp = Blueprint('invoices', __name__, url_prefix='/api/invoices')


@invoice_bp.route('/orders/<int:order_id>/invoice', methods=['GET'])
@auth_middleware
def get_order_invoice(order_id):
    try:
        current_user_id = g.user_id

        invoice_service = InvoiceService(
            InvoiceRepository(),
            NotificationService()
        )

        invoice = invoice_service.get_invoice_by_order(order_id)
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404

        # Verify user owns the order
        if invoice.order.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        return jsonify(invoice.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@invoice_bp.route('/<invoice_id>/resend', methods=['POST'])
@auth_middleware
def resend_invoice(invoice_id):
    try:
        current_user_id = g.user_id

        invoice_service = InvoiceService(
            InvoiceRepository(),
            NotificationService()
        )

        # Get invoice to check ownership
        invoice = invoice_service.invoice_repository.get_by_id(invoice_id)
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404

        # Verify user owns the invoice/order
        if invoice.order.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        success = invoice_service.resend_invoice(invoice_id)

        if success:
            return jsonify({'message': 'Invoice resent successfully'}), 200
        else:
            return jsonify({'error': 'Failed to resend invoice'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500
