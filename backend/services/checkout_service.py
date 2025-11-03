from typing import Dict
from models.order import Order
from models.order_item import OrderItem
from models.idempotency_key import IdempotencyKey
from services.inventory_service import InventoryService
from services.payment_service import PaymentService
from services.invoice_service import InvoiceService
from services.receipt_service import ReceiptService
from services.notification_service import NotificationService
from database.db import db
import json
import hashlib
from datetime import datetime, timedelta


class CheckoutService:
    def __init__(self,
                 inventory_service: InventoryService,
                 payment_service: PaymentService,
                 invoice_service: InvoiceService,
                 receipt_service: ReceiptService,
                 notification_service: NotificationService,
                 order_repository,
                 payment_repository):

        self.inventory_service = inventory_service
        self.payment_service = payment_service
        self.invoice_service = invoice_service
        self.receipt_service = receipt_service
        self.notification_service = notification_service
        self.order_repository = order_repository
        self.payment_repository = payment_repository

    def process_checkout(self, cart, shipping_address, billing_address,
                         payment_details, customer_id, idempotency_key: str) -> Dict:
        """
        Enhanced checkout with inventory reservation and proper error handling
        """
        try:
            # Check for existing idempotency key
            if idempotency_key:
                existing_key = IdempotencyKey.query.filter_by(
                    key=idempotency_key,
                    user_id=customer_id,
                    endpoint='/api/orders/checkout'
                ).first()

                if existing_key:
                    # Return cached response for duplicate request
                    try:
                        cached_data = json.loads(existing_key.response_data)
                        return cached_data
                    except (json.JSONDecodeError, TypeError):
                        # If cached data is corrupted, continue with processing
                        pass

            # 1. Validate cart and inventory
            if not cart or not cart.items:
                result = {'success': False, 'error': 'Cart is empty'}
                self._store_idempotency_result(
                    idempotency_key, customer_id, result, 400)
                return result

            # 2. Reserve inventory
            reservation_result = self.inventory_service.reserve_items(
                cart.items, f"checkout_{customer_id}"
            )

            if not reservation_result['success']:
                result = {
                    'success': False,
                    'error': reservation_result['error']
                }
                self._store_idempotency_result(
                    idempotency_key, customer_id, result, 400)
                return result

            reservations = reservation_result['reservations']

            try:
                # 3. Create order
                order = self._create_order_from_cart(
                    cart, shipping_address, billing_address, customer_id
                )

                # 4. Process payment
                payment_result = self.payment_service.process_order_payment(
                    order, payment_details, idempotency_key)

                if not payment_result['success']:
                    # Release inventory on payment failure
                    for reservation in reservations:
                        self.inventory_service.release_reservation(reservation)

                    order.status = 'cancelled'
                    db.session.commit()

                    # Send SSE notification for payment failure
                    from services.sse_service import sse_service
                    sse_service.send_payment_failed(
                        customer_id, order.id, payment_result['message']
                    )

                    result = {
                        'success': False,
                        'error': payment_result['message'],
                        'order_id': order.id
                    }
                    self._store_idempotency_result(
                        idempotency_key, customer_id, result, 400)
                    return result

                # 5. Update order status
                order.status = 'paid'
                order.payment_id = payment_result['payment'].id

                # 6. Generate invoice
                invoice = self.invoice_service.generate_invoice(order)

                # 7. Generate receipt (proof of payment)
                receipt = self.receipt_service.generate_receipt(
                    payment_result['payment'],
                    order
                )

                # 8. Clear cart
                self._clear_cart(cart)

                # 9. Send notifications
                self.notification_service.send_order_confirmation(
                    order, invoice)

                # 10. Send SSE notification for payment completion
                from services.sse_service import sse_service
                sse_service.send_order_status_update(
                    customer_id, order.id, 'placed', 'paid'
                )
                sse_service.send_invoice_generated(
                    customer_id, order.id, invoice.invoice_number
                )

                db.session.commit()

                result = {
                    'success': True,
                    'order': order,
                    'payment': payment_result['payment'],
                    'invoice': invoice,
                    'receipt': receipt
                }

                # Store serializable version for idempotency
                serializable_result = {
                    'success': True,
                    'order_id': order.id,
                    'payment_id': payment_result['payment'].id,
                    'invoice_number': invoice.invoice_number,
                    'receipt_number': receipt.receipt_number
                }
                self._store_idempotency_result(
                    idempotency_key, customer_id, serializable_result, 201)
                return result

            except Exception as e:
                # Rollback inventory on any error
                for reservation in reservations:
                    self.inventory_service.release_reservation(reservation)
                raise e

        except Exception as e:
            db.session.rollback()
            result = {
                'success': False,
                'error': f'Checkout failed: {str(e)}'
            }
            self._store_idempotency_result(
                idempotency_key, customer_id, result, 500)
            return result

    def _create_order_from_cart(
            self, cart, shipping_address, billing_address, customer_id):
        """Reuse your existing order creation logic with enhancements"""
        order = Order(
            user_id=customer_id,
            customer_name=cart.user.name if cart.user else "Unknown",
            customer_email=cart.user.email if cart.user else "unknown@example.com",
            total_amount=cart.get_total(),
            status='placed',  # Will be updated after payment
            shipping_street=shipping_address.get('street'),
            shipping_city=shipping_address.get('city'),
            shipping_state=shipping_address.get('state'),
            shipping_postal_code=shipping_address.get('postal_code'),
            shipping_country=shipping_address.get('country'),
            billing_street=billing_address.get('street'),
            billing_city=billing_address.get('city'),
            billing_state=billing_address.get('state'),
            billing_postal_code=billing_address.get('postal_code'),
            billing_country=billing_address.get('country')
        )

        db.session.add(order)
        db.session.flush()  # Get order ID without committing

        # Create order items from cart
        for cart_item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                product_name=cart_item.product.name,
                quantity=cart_item.quantity,
                unit_price=cart_item.product.price,   # Price snapshot
            )
            db.session.add(order_item)

        return order

    def _clear_cart(self, cart):
        """Clear cart after successful order"""
        for item in cart.items:
            db.session.delete(item)

    def _store_idempotency_result(
            self, idempotency_key, user_id, result, status_code):
        """Store the result of a checkout operation for idempotency"""
        if not idempotency_key:
            return

        # Create hash of request data for additional validation (optional)
        request_data = {
            'user_id': user_id,
            'result': result
        }
        request_hash = hashlib.sha256(
            json.dumps(
                request_data,
                sort_keys=True).encode()).hexdigest()

        # Store or update idempotency key
        key_record = IdempotencyKey(
            key=idempotency_key,
            user_id=user_id,
            endpoint='/api/orders/checkout',
            request_hash=request_hash,
            response_data=json.dumps(result),
            status_code=status_code,
            expires_at=datetime.utcnow() + timedelta(days=7)  # Expire after 7 days
        )

        db.session.add(key_record)

    def is_key_processed(self, user_id, idempotency_key):
        """Check if an idempotency key has already been processed"""
        if not idempotency_key:
            return False

        key_record = IdempotencyKey.query.filter_by(
            key=idempotency_key,
            user_id=user_id,
            endpoint='/api/orders/checkout'
        ).first()

        return key_record is not None

    def get_cached_result(self, user_id, idempotency_key):
        """Get cached result for an idempotency key"""
        key_record = IdempotencyKey.query.filter_by(
            key=idempotency_key,
            user_id=user_id,
            endpoint='/api/orders/checkout'
        ).first()

        if key_record and key_record.response_data:
            try:
                return json.loads(key_record.response_data)
            except json.JSONDecodeError:
                return None
        return None
