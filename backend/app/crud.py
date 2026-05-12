from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status as http_status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from . import models, schemas
from .database import now_utc

ACTIVE_STATUSES = [models.BookingStatus.PENDING, models.BookingStatus.CONFIRMED]


async def list_physicians(db: AsyncSession) -> list[models.Physician]:
    result = await db.execute(select(models.Physician).order_by(models.Physician.name))
    return list(result.scalars().all())


async def get_physician(db: AsyncSession, physician_id: str) -> models.Physician:
    physician = await db.get(models.Physician, physician_id)
    if not physician:
        raise HTTPException(status_code=404, detail="Physician not found")
    return physician


async def list_available_slots(db: AsyncSession, physician_id: str) -> list[models.TimeSlot]:
    await get_physician(db, physician_id)
    booked_slot_ids = select(models.Booking.time_slot_id).where(
        models.Booking.status.in_(ACTIVE_STATUSES)
    )
    result = await db.execute(
        select(models.TimeSlot)
        .where(models.TimeSlot.physician_id == physician_id)
        .where(models.TimeSlot.start_time >= now_utc())
        .where(~models.TimeSlot.id.in_(booked_slot_ids))
        .order_by(models.TimeSlot.start_time)
    )
    return list(result.scalars().all())


async def get_slot(db: AsyncSession, slot_id: str) -> models.TimeSlot:
    slot = await db.get(models.TimeSlot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    return slot


async def create_booking(
    db: AsyncSession, data: schemas.BookingCreate
) -> models.Booking:
    slot = await get_slot(db, data.time_slot_id)

    if slot.start_time < now_utc():
        raise HTTPException(status_code=400, detail="Cannot book a slot in the past")

    existing = await db.execute(
        select(models.Booking).where(
            models.Booking.time_slot_id == slot.id,
            models.Booking.status.in_(ACTIVE_STATUSES),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=http_status.HTTP_409_CONFLICT,
            detail="This time slot is already booked",
        )

    booking = models.Booking(
        time_slot_id=slot.id,
        physician_id=slot.physician_id,
        patient_name=data.patient_name,
        patient_email=data.patient_email,
        patient_phone=data.patient_phone,
        patient_dob=data.patient_dob,
        reason_for_visit=data.reason_for_visit,
        status=models.BookingStatus.PENDING,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return booking


async def get_booking(db: AsyncSession, booking_id: str) -> models.Booking:
    result = await db.execute(
        select(models.Booking)
        .where(models.Booking.id == booking_id)
        .options(
            selectinload(models.Booking.physician),
            selectinload(models.Booking.time_slot),
        )
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


async def list_bookings(
    db: AsyncSession,
    status: Optional[models.BookingStatus] = None,
    physician_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
) -> list[models.Booking]:
    query = (
        select(models.Booking)
        .options(
            selectinload(models.Booking.physician),
            selectinload(models.Booking.time_slot),
        )
        .join(models.TimeSlot, models.Booking.time_slot_id == models.TimeSlot.id)
    )
    if status is not None:
        query = query.where(models.Booking.status == status)
    if physician_id:
        query = query.where(models.Booking.physician_id == physician_id)
    if date_from:
        query = query.where(models.TimeSlot.start_time >= date_from)
    if date_to:
        query = query.where(models.TimeSlot.start_time <= date_to)
    query = query.order_by(models.TimeSlot.start_time)
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_booking_status(
    db: AsyncSession, booking_id: str, new_status: models.BookingStatus
) -> models.Booking:
    booking = await get_booking(db, booking_id)
    booking.status = new_status
    await db.commit()
    await db.refresh(booking)
    return booking
