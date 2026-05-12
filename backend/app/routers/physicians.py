from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/physicians", tags=["physicians"])


@router.get("", response_model=list[schemas.PhysicianRead])
async def list_physicians(db: AsyncSession = Depends(get_db)):
    return await crud.list_physicians(db)


@router.get("/{physician_id}", response_model=schemas.PhysicianRead)
async def get_physician(physician_id: str, db: AsyncSession = Depends(get_db)):
    return await crud.get_physician(db, physician_id)


@router.get("/{physician_id}/slots", response_model=list[schemas.TimeSlotRead])
async def list_physician_slots(physician_id: str, db: AsyncSession = Depends(get_db)):
    return await crud.list_available_slots(db, physician_id)
