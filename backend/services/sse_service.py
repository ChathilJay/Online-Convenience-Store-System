"""
Server-Sent Events (SSE) service for real-time notifications
"""
from flask import Response, stream_with_context
import json
import time
from queue import Queue
from threading import Lock


class SSENotificationService:
    def __init__(self):
        # Store client connections by user_id
        self.clients = {}  # user_id -> Queue
        self.lock = Lock()

    def add_client(self, user_id: int):
        """Add a new client connection"""
        with self.lock:
            if user_id not in self.clients:
                self.clients[user_id] = Queue()
        return self.clients[user_id]

    def remove_client(self, user_id: int):
        """Remove a client connection"""
        with self.lock:
            if user_id in self.clients:
                del self.clients[user_id]

    def send_to_user(self, user_id: int, event_type: str, data: dict):
        """Send a notification to a specific user"""
        with self.lock:
            if user_id in self.clients:
                message = {
                    'type': event_type,
                    'data': data,
                    'timestamp': time.time()
                }
                self.clients[user_id].put(message)

    def send_order_status_update(
            self, user_id: int, order_id: int, old_status: str, new_status: str):
        """Send order status update notification"""
        self.send_to_user(user_id, 'order_status_update', {
            'order_id': order_id,
            'old_status': old_status,
            'new_status': new_status
        })

    def send_payment_update(
            self, user_id: int, order_id: int, payment_status: str):
        """Send payment update notification"""
        self.send_to_user(user_id, 'payment_update', {
            'order_id': order_id,
            'payment_status': payment_status
        })

    def send_invoice_generated(
            self, user_id: int, order_id: int, invoice_number: str):
        """Send invoice generated notification"""
        self.send_to_user(user_id, 'invoice_generated', {
            'order_id': order_id,
            'invoice_number': invoice_number
        })

    def send_order_created(
            self, user_id: int, order_id: int, total_amount: float):
        """Send order created notification"""
        self.send_to_user(user_id, 'order_created', {
            'order_id': order_id,
            'total_amount': total_amount
        })

    def send_payment_failed(self, user_id: int, order_id: int, reason: str):
        """Send payment failed notification"""
        self.send_to_user(user_id, 'payment_failed', {
            'order_id': order_id,
            'reason': reason
        })

    def send_low_stock_alert(
            self, user_id: int, product_id: int, product_name: str, stock: int):
        """Send low stock alert notification (for admins)"""
        self.send_to_user(user_id, 'low_stock_alert', {
            'product_id': product_id,
            'product_name': product_name,
            'stock': stock
        })

    def stream(self, user_id: int):
        """
        Generate SSE stream for a client
        """
        queue = self.add_client(user_id)

        def generate():
            try:
                # Send initial connection message
                yield f"data: {json.dumps({'type': 'connected', 'message': 'SSE connection established'})}\n\n"

                # Keep connection alive and send messages
                while True:
                    # Check for messages in queue (non-blocking with timeout)
                    try:
                        message = queue.get(timeout=30)  # 30 second timeout
                        yield f"data: {json.dumps(message)}\n\n"
                    except BaseException:
                        # Send keepalive ping every 30 seconds
                        yield f": keepalive\n\n"
            except GeneratorExit:
                # Client disconnected
                self.remove_client(user_id)

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
                'Connection': 'keep-alive'
            }
        )


# Global SSE service instance
sse_service = SSENotificationService()
