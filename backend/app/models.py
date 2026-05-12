import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base, now_utc


class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"


def _uuid() -> str:
    return str(uuid.uuid4())


class Physician(Base):
    __tablename__ = "physicians"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    specialty: Mapped[str] = mapped_column(String, nullable=False)
    bio: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str] = mapped_column(String, nullable=False)

    slots: Mapped[list["TimeSlot"]] = relationship(
        back_populates="physician", cascade="all, delete-orphan"
    )
    bookings: Mapped[list["Booking"]] = relationship(back_populates="physician")


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    physician_id: Mapped[str] = mapped_column(ForeignKey("physicians.id"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    physician: Mapped[Physician] = relationship(back_populates="slots")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="time_slot")


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    time_slot_id: Mapped[str] = mapped_column(ForeignKey("time_slots.id"), nullable=False)
    physician_id: Mapped[str] = mapped_column(ForeignKey("physicians.id"), nullable=False)

    patient_name: Mapped[str] = mapped_column(String, nullable=False)
    patient_email: Mapped[str] = mapped_column(String, nullable=False)
    patient_phone: Mapped[str] = mapped_column(String, nullable=False)
    patient_dob: Mapped[date] = mapped_column(Date, nullable=False)
    reason_for_visit: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=now_utc, onupdate=now_utc, nullable=False
    )

    time_slot: Mapped[TimeSlot] = relationship(back_populates="bookings")
    physician: Mapped[Physician] = relationship(back_populates="bookings")
