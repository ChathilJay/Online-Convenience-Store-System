from datetime import datetime
from enum import Enum
from dataclasses import dataclass


class ReservationStatus(Enum):
    RESERVED = "reserved"
    COMMITTED = "committed"
    RELEASED = "released"
    EXPIRED = "expired"


@dataclass
class InventoryReservation:
    id: str
    product_id: str
    quantity: int
    order_id: str
    status: ReservationStatus
    expires_at: datetime
    created_at: datetime

    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at

    def can_commit(self) -> bool:
        return self.status == ReservationStatus.RESERVED and not self.is_expired()
