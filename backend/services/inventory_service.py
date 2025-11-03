from datetime import datetime, timedelta
from typing import List, Dict
from domain.inventory_reservation import InventoryReservation, ReservationStatus


class InventoryService:
    def __init__(self, product_repository):
        self.product_repository = product_repository
        self.reservation_timeout_minutes = 30  # 30 min reservation window

    def reserve_items(self, cart_items: List, order_id: str) -> Dict:
        """Reserve inventory for checkout - Strategy Pattern"""
        reservations = []

        for item in cart_items:
            product = self.product_repository.get_by_id(item.product_id)

            if not product or product.stock < item.quantity:
                return {
                    'success': False,
                    'error': f'Insufficient stock for {product.name}',
                    'reservations': []
                }

            # Create reservation
            reservation = InventoryReservation(
                id=f"res_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{product.id}",
                product_id=product.id,
                quantity=item.quantity,
                order_id=order_id,
                status=ReservationStatus.RESERVED,
                expires_at=datetime.utcnow() + timedelta(minutes=self.reservation_timeout_minutes),
                created_at=datetime.utcnow()
            )
            reservations.append(reservation)

            # Update product stock (reserved)
            product.stock -= item.quantity
            self.product_repository.update(product)

        return {
            'success': True,
            'reservations': reservations,
            'message': 'Inventory reserved successfully'
        }

    def release_reservation(self, reservation: InventoryReservation) -> bool:
        """Release inventory reservation on payment failure - Observer Pattern"""
        product = self.product_repository.get_by_id(reservation.product_id)
        if product and reservation.status == ReservationStatus.RESERVED:
            product.stock += reservation.quantity
            reservation.status = ReservationStatus.RELEASED
            self.product_repository.update(product)
            return True
        return False

    def commit_reservation(self, reservation: InventoryReservation) -> bool:
        """Commit reservation when order is shipped"""
        if reservation.can_commit():
            reservation.status = ReservationStatus.COMMITTED
            # Stock already deducted during reservation
            return True
        return False

    def get_product_availability(self, product_id: str) -> Dict:
        """Check available stock considering reservations"""
        product = self.product_repository.get_by_id(product_id)
        if not product:
            return {'available': 0, 'reserved': 0}

        # Calculate reserved stock (simplified - in real app, query
        # reservations)
        reserved = 0  # Would query active reservations
        available = max(0, product.stock - reserved)

        return {
            'available': available,
            'reserved': reserved,
            'total_stock': product.stock
        }
