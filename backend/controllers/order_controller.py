from flask import Blueprint, g, jsonify, request

from middleware.auth_middleware import auth_middleware
from middleware.admin_middleware import admin_required
from repositories.order_repository import OrderRepository
from repositories.product_repository import ProductRepository
from repositories.invoice_repository import InvoiceRepository
from services.order_service import OrderService
from services.checkout_service import CheckoutService
from services.inventory_service import InventoryService
from services.payment_service import PaymentService
from services.invoice_service import InvoiceService
from services.receipt_service import ReceiptService
from services.notification_service import NotificationService

order_bp = Blueprint("order", __name__, url_prefix="/api/orders")
order_service = OrderService(OrderRepository())


@order_bp.route("", methods=["POST"])
@auth_middleware
def create_order():
    """Create a new order from the current user's cart"""
    user_id = g.user_id

    # Get user's cart
    from repositories.cart_repository import CartRepository
    cart_repo = CartRepository()
    cart = cart_repo.get_cart(user_id)

    if not cart or not cart.items:
        return jsonify({"error": "Cart is empty"}), 400

    # Get user details
    from repositories.user_repository import UserRepository
    user_repo = UserRepository()
    user = user_repo.get_by_id(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        order = order_service.create_order_from_cart(cart, user)

        # Clear the cart after successful order creation
        cart_repo.clear_cart(user_id)

        return jsonify({
            "message": "Order created successfully",
            "order": order.to_dict()
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@order_bp.route("/<int:order_id>", methods=["GET"])
@auth_middleware
def get_order(order_id):
    """Get a specific order"""
    user_id = g.user_id
    order = order_service.get_order(order_id)

    if not order:
        return jsonify({"error": "Order not found"}), 404

    # Check if user owns this order or is an admin
    from repositories.user_repository import UserRepository
    user_repo = UserRepository()
    user = user_repo.get_by_id(user_id)

    if order.user_id != user_id and user.user_type != 'admin':
        return jsonify({"error": "Access denied"}), 403

    return jsonify(order.to_dict())


@order_bp.route("", methods=["GET"])
@auth_middleware
def get_user_orders():
    """Get all orders for the current user"""
    user_id = g.user_id
    orders = order_service.get_customer_orders(user_id)

    return jsonify([order.to_dict() for order in orders])


@order_bp.route("/all", methods=["GET"])
@admin_required
def get_all_orders():
    """Get all orders (admin only)"""
    # Get query parameters for filtering
    status = request.args.get('status')
    limit = request.args.get('limit', type=int)

    if status:
        from domain.order_lifecycle import OrderStatus
        try:
            order_status = OrderStatus[status.upper()]
            orders = order_service.get_orders_by_status(order_status)
        except KeyError:
            return jsonify({"error": "Invalid status"}), 400
    elif limit:
        orders = order_service.get_recent_orders(limit)
    else:
        # Get all orders
        orders = order_service.get_all_orders()

    return jsonify([order.to_dict() for order in orders])


@order_bp.route("/<int:order_id>/dispatch", methods=["POST"])
@admin_required
def dispatch_order(order_id):
    """Mark an order as dispatched (admin only)"""
    order = order_service.get_order(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    try:
        if order_service.dispatch_order(order_id):
            return jsonify({"message": "Order marked as dispatched"})
        else:
            return jsonify({"error": "Could not dispatch order"}), 400
    except Exception as e:
        # Handle InvalidOrderStateTransitionError and other state transition
        # errors
        return jsonify({"error": str(e)}), 400


@order_bp.route("/<int:order_id>/deliver", methods=["POST"])
@admin_required
def deliver_order(order_id):
    """Mark an order as delivered (admin only)"""
    order = order_service.get_order(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    try:
        if order_service.deliver_order(order_id):
            return jsonify({"message": "Order marked as delivered"})
        else:
            return jsonify({"error": "Could not deliver order"}), 400
    except Exception as e:
        # Handle InvalidOrderStateTransitionError and other state transition
        # errors
        return jsonify({"error": str(e)}), 400


@order_bp.route("/<int:order_id>/cancel", methods=["POST"])
@auth_middleware
def cancel_order(order_id):
    """Cancel an order"""
    user_id = g.user_id
    order = order_service.get_order(order_id)

    if not order:
        return jsonify({"error": "Order not found"}), 404

    # Check if user owns this order
    if order.user_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    try:
        if order_service.cancel_order(order_id):
            return jsonify({"message": "Order cancelled"})
        else:
            return jsonify({"error": "Could not cancel order"}), 400
    except Exception as e:
        # Handle InvalidOrderStateTransitionError and other state transition
        # errors
        return jsonify({"error": str(e)}), 400
    else:
        return jsonify({"error": "Could not cancel order"}), 400


@order_bp.route('/checkout', methods=['POST'])
@auth_middleware
def checkout():
    try:
        current_user_id = g.user_id
        data = request.get_json()

        # Validate idempotency key
        idempotency_key = request.headers.get('Idempotency-Key')
        if not idempotency_key or len(idempotency_key) < 10:
            return jsonify({
                'error': 'Valid Idempotency-Key header required (10-255 characters)'
            }), 400

        # Get user's cart
        from repositories.cart_repository import CartRepository
        cart_repo = CartRepository()
        cart = cart_repo.get_cart(current_user_id)

        if not cart:
            return jsonify({'error': 'Cart not found'}), 404

        # Extract checkout data
        shipping_address = data.get('shipping_address', {})
        billing_address = data.get('billing_address', {})
        payment_details = data.get('payment_details', {})

        # Validate addresses
        address_errors = validate_addresses(shipping_address, billing_address)
        if address_errors:
            return jsonify({'errors': address_errors}), 400

        # Initialize services
        checkout_service = CheckoutService(
            inventory_service=InventoryService(ProductRepository()),
            payment_service=PaymentService(),
            invoice_service=InvoiceService(
                InvoiceRepository(), NotificationService()),
            receipt_service=ReceiptService(NotificationService()),
            notification_service=NotificationService(),
            order_repository=OrderRepository(),
            payment_repository=None  # Not needed for now
        )

        # Process checkout
        result = checkout_service.process_checkout(
            cart, shipping_address, billing_address,
            payment_details, current_user_id, idempotency_key
        )

        if result['success']:
            return jsonify({
                'success': True,
                'order_id': result['order'].id,
                'payment_id': result['payment'].id,
                'invoice_number': result['invoice'].invoice_number,
                'receipt_number': result['receipt'].receipt_number,
                'status': result['order'].status
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': result['error'],
                'order_id': result.get('order_id')
            }), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def validate_addresses(shipping_address, billing_address):
    """Validate shipping and billing addresses"""
    errors = []
    required_fields = ['street', 'city', 'state', 'postal_code', 'country']

    for field in required_fields:
        if not shipping_address.get(field):
            errors.append(f'Shipping address {field} is required')
        if not billing_address.get(field):
            errors.append(f'Billing address {field} is required')

    return errors
