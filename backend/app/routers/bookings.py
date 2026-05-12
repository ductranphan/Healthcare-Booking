from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post(
    "",
    response_model=schemas.BookingDetailRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_booking(
    payload: schemas.BookingCreate, db: AsyncSession = Depends(get_db)
):
    booking = await crud.create_booking(db, payload)
    return await crud.get_booking(db, booking.id)


@router.get("", response_model=list[schemas.BookingDetailRead])
async def list_bookings(
    status_filter: Optional[schemas.StatusEnum] = Query(None, alias="status"),
    physician_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
):
    status_val = models.BookingStatus(status_filter.value) if status_filter else None
    return await crud.list_bookings(
        db,
        status=status_val,
        physician_id=physician_id,
        date_from=date_from,
        date_to=date_to,
    )


@router.get("/{booking_id}", response_model=schemas.BookingDetailRead)
async def get_booking(booking_id: str, db: AsyncSession = Depends(get_db)):
    return await crud.get_booking(db, booking_id)


@router.patch("/{booking_id}", response_model=schemas.BookingDetailRead)
async def update_booking(
    booking_id: str,
    payload: schemas.BookingUpdate,
    db: AsyncSession = Depends(get_db),
):
    new_status = models.BookingStatus(payload.status.value)
    booking = await crud.update_booking_status(db, booking_id, new_status)
    return await crud.get_booking(db, booking.id)
