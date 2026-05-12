from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class StatusEnum(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"


class PhysicianRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    specialty: str
    bio: str
    image_url: str


class TimeSlotRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    physician_id: str
    start_time: datetime
    end_time: datetime


class BookingCreate(BaseModel):
    time_slot_id: str
    patient_name: str = Field(min_length=1, max_length=120)
    patient_email: EmailStr
    patient_phone: str = Field(min_length=7, max_length=30)
    patient_dob: date
    reason_for_visit: str = Field(min_length=1, max_length=1000)

    @field_validator("patient_dob")
    @classmethod
    def dob_must_be_in_past(cls, v: date) -> date:
        if v >= date.today():
            raise ValueError("Date of birth must be in the past")
        return v


class BookingUpdate(BaseModel):
    status: StatusEnum


class BookingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    time_slot_id: str
    physician_id: str
    patient_name: str
    patient_email: EmailStr
    patient_phone: str
    patient_dob: date
    reason_for_visit: str
    status: StatusEnum
    created_at: datetime
    updated_at: datetime


class BookingDetailRead(BookingRead):
    physician: PhysicianRead
    time_slot: TimeSlotRead
