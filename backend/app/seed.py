import asyncio
from datetime import date, datetime, timedelta

from .database import Base, SessionLocal, engine, now_utc
from .models import Booking, BookingStatus, Physician, TimeSlot


PHYSICIANS = [
    {
        "name": "Dr. Sarah Chen",
        "specialty": "Family Medicine",
        "bio": "Board-certified family physician with 12 years of experience providing comprehensive primary care for patients of all ages.",
        "image_url": "https://i.pravatar.cc/300?img=47",
    },
    {
        "name": "Dr. Marcus Patel",
        "specialty": "Cardiology",
        "bio": "Interventional cardiologist focused on preventive heart care and managing chronic cardiovascular conditions.",
        "image_url": "https://i.pravatar.cc/300?img=12",
    },
    {
        "name": "Dr. Elena Rodriguez",
        "specialty": "Pediatrics",
        "bio": "Pediatrician passionate about child wellness, development, and supporting families through every stage.",
        "image_url": "https://i.pravatar.cc/300?img=45",
    },
    {
        "name": "Dr. James O'Connor",
        "specialty": "Dermatology",
        "bio": "Dermatologist specializing in skin cancer screening, acne treatment, and cosmetic dermatology.",
        "image_url": "https://i.pravatar.cc/300?img=33",
    },
    {
        "name": "Dr. Aisha Williams",
        "specialty": "Internal Medicine",
        "bio": "Internist providing thorough adult primary care with a focus on chronic disease management.",
        "image_url": "https://i.pravatar.cc/300?img=49",
    },
]


def generate_slots(physician_id: str, days: int = 14) -> list[TimeSlot]:
    slots: list[TimeSlot] = []
    today = now_utc().replace(hour=0, minute=0, second=0, microsecond=0)
    current = now_utc()
    for day_offset in range(days):
        day = today + timedelta(days=day_offset)
        if day.weekday() >= 5:
            continue
        for hour in range(9, 17):
            for minute in (0, 30):
                start = day.replace(hour=hour, minute=minute)
                if start < current:
                    continue
                end = start + timedelta(minutes=30)
                slots.append(
                    TimeSlot(
                        physician_id=physician_id,
                        start_time=start,
                        end_time=end,
                    )
                )
    return slots


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    total_slots = 0
    async with SessionLocal() as db:
        physicians: list[Physician] = []
        for data in PHYSICIANS:
            physician = Physician(**data)
            db.add(physician)
            physicians.append(physician)
        await db.flush()

        all_slots: list[TimeSlot] = []
        for physician in physicians:
            slots = generate_slots(physician.id)
            for s in slots:
                db.add(s)
            all_slots.extend(slots)
        await db.flush()
        total_slots = len(all_slots)

        sample_bookings = [
            (5, BookingStatus.CONFIRMED, "Jordan Miller", "jordan@example.com", "555-0101"),
            (12, BookingStatus.PENDING, "Riley Thompson", "riley@example.com", "555-0102"),
            (40, BookingStatus.PENDING, "Casey Nguyen", "casey@example.com", "555-0103"),
            (80, BookingStatus.CONFIRMED, "Sam Patel", "sam@example.com", "555-0104"),
            (120, BookingStatus.CANCELLED, "Avery Brown", "avery@example.com", "555-0105"),
        ]

        created = 0
        for idx, status, name, email, phone in sample_bookings:
            if idx >= total_slots:
                continue
            slot = all_slots[idx]
            db.add(
                Booking(
                    time_slot_id=slot.id,
                    physician_id=slot.physician_id,
                    patient_name=name,
                    patient_email=email,
                    patient_phone=phone,
                    patient_dob=date(1990, 1, 15),
                    reason_for_visit="Annual check-up",
                    status=status,
                )
            )
            created += 1

        await db.commit()

    await engine.dispose()
    print(
        f"Seeded {len(PHYSICIANS)} physicians, "
        f"{total_slots} time slots, "
        f"and {created} sample bookings."
    )


if __name__ == "__main__":
    asyncio.run(seed())
