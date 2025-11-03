from flask import Blueprint, jsonify, g
from middleware.auth_middleware import auth_middleware
from middleware.admin_middleware import admin_required
from services.receipt_service import ReceiptService
from services.notification_service import NotificationService
from repositories.order_repository import OrderRepository

receipt_bp = Blueprint("receipt", __name__, url_prefix="/api/receipts")

# Initialize services
notification_service = NotificationService()
receipt_service = ReceiptService(notification_service)


@receipt_bp.route("/<receipt_id>", methods=["GET"])
@auth_middleware
def get_receipt(receipt_id):
    """Get receipt details by receipt ID"""
    receipt = receipt_service.get_receipt(receipt_id)
    if not receipt:
        return jsonify({'error': 'Receipt not found'}), 404

    # Check if user owns this receipt or is admin
    user_id = g.user_id
    user_repo = OrderRepository()  # Reuse for user check

    if receipt.order.user_id != user_id:
        # Check if admin
        from repositories.user_repository import UserRepository
        user_repo = UserRepository()
        user = user_repo.get_by_id(user_id)
        if not user or user.user_type != 'admin':
            return jsonify({'error': 'Access denied'}), 403

    return jsonify(receipt.to_dict()), 200


@receipt_bp.route("/order/<int:order_id>", methods=["GET"])
@auth_middleware
def get_receipt_by_order(order_id):
    """Get receipt for a specific order"""
    from repositories.order_repository import OrderRepository
    order_repo = OrderRepository()
    order = order_repo.find_by_id(order_id)

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    # Check if user owns this order or is admin
    user_id = g.user_id
    if order.user_id != user_id:
        from repositories.user_repository import UserRepository
        user_repo = UserRepository()
        user = user_repo.get_by_id(user_id)
        if not user or user.user_type != 'admin':
            return jsonify({'error': 'Access denied'}), 403

    receipt = receipt_service.get_receipt_by_order(order_id)
    if not receipt:
        return jsonify({'error': 'Receipt not found for this order'}), 404

    return jsonify(receipt.to_dict()), 200


@receipt_bp.route("/<receipt_id>/resend", methods=["POST"])
@auth_middleware
def resend_receipt(receipt_id):
    """Resend receipt to customer email"""
    receipt = receipt_service.get_receipt(receipt_id)
    if not receipt:
        return jsonify({'error': 'Receipt not found'}), 404

    # Check access
    user_id = g.user_id
    if receipt.order.user_id != user_id:
        from repositories.user_repository import UserRepository
        user_repo = UserRepository()
        user = user_repo.get_by_id(user_id)
        if not user or user.user_type != 'admin':
            return jsonify({'error': 'Access denied'}), 403

    if receipt_service.resend_receipt(receipt_id):
        return jsonify({'message': 'Receipt resent to customer email'}), 200
    else:
        return jsonify({'error': 'Failed to resend receipt'}), 400


@receipt_bp.route("/customer/<email>", methods=["GET"])
@admin_required
def get_customer_receipts(email):
    """Get all receipts for a customer (admin only)"""
    receipts = receipt_service.get_customer_receipts(email)
    return jsonify([receipt.to_dict() for receipt in receipts]), 200
