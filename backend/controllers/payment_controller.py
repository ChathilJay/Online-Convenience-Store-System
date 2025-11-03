from flask import Blueprint, g, jsonify
from middleware.auth_middleware import auth_middleware
from models.payment import Payment
from models.order import Order

payment_bp = Blueprint('payments', __name__, url_prefix='/api/payments')


@payment_bp.route('/orders/<order_id>/payment', methods=['GET'])
@auth_middleware
def get_order_payment(order_id):
    """Get payment details for an order"""
    try:
        user_id = g.user_id

        # Validate order_id is numeric
        try:
            order_id = int(order_id)
        except ValueError:
            return jsonify({'error': 'Invalid order ID'}), 400

        # Verify order belongs to user
        order = Order.query.filter_by(id=order_id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        if order.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        payment = Payment.query.filter_by(order_id=order_id).first()
        if not payment:
            return jsonify({'error': 'Payment not found'}), 404

        return jsonify(payment.to_dict()), 200

    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
