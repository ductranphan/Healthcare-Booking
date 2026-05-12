# Healthcare Booking — Patient Appointment Flow

A small full-stack demo of a clinic-style booking flow. Patients pick a
physician, choose an open time slot, fill out a short form, and submit a
request. Staff manage incoming bookings from a separate admin view.

Built as a take-home exercise — the goal was a focused MVP, not a
production-ready system.


## How to run the project

Open two terminals — one for the backend, one for the frontend.

### 1. Backend (FastAPI + SQLite)

```
cd backend
python -m venv .venv
.venv\Scripts\activate         # Windows
# source .venv/bin/activate    # macOS / Linux

pip install -r requirements.txt
copy .env.example .env         # or: cp .env.example .env

python -m app.seed             # creates the DB and loads mock data
uvicorn app.main:app --reload --port 8000
```

The API runs at http://localhost:8000. FastAPI's interactive Swagger UI
is at http://localhost:8000/docs.

The seed script is safe to re-run — it drops and recreates everything,
so you can always get back to a clean state.

### 2. Frontend (Vite + React)

```
cd frontend
npm install
copy .env.example .env

npm run dev
```

App opens at http://localhost:5173. Both servers need to be running.


## What you built

### Patient flow
- **Home** — landing page with a single CTA into the flow.
- **Find a doctor** — grid of physicians with photo, specialty, and a
  short bio.
- **Pick a time** — slots are grouped by day. Click a day, then a time.
  Only future, un-booked slots show up.
- **Your details** — name, email, phone, DOB, and reason for visit.
  Validation runs both client-side (Zod) and server-side (Pydantic).
- **Confirmation** — booking summary, status badge, and a short
  reference ID the patient can quote.

### Admin flow (`/admin`)
- KPI row: total / pending / confirmed / cancelled.
- Filters for status and physician.
- Table with inline Confirm / Cancel / Reopen buttons.

### Statuses
Bookings start as `PENDING`. Staff confirm them from the admin view.
Either side can cancel — and a cancelled booking releases its time slot
so someone else can book it.

### Tech stack
- **Backend:** FastAPI, SQLAlchemy 2.0 (async), Pydantic v2,
  SQLite via aiosqlite.
- **Frontend:** React + Vite + TypeScript, React Router,
  React, Tailwind CSS.


## Key technical and product decisions

- **No authentication.** The brief explicitly excluded full auth, so
  `/admin` is just a separate route. In a real build I'd add JWT-based
  auth with role gating through FastAPI's dependency injection.

- **SQLite over Postgres.** The brief asked for something lightweight,
  and SQLite lets anyone clone and run this in a minute. Switching to
  Postgres later is a one-line `DATABASE_URL` change plus Alembic
  migrations.

- **Slot-based availability instead of free-form time picking.** The
  backend pre-generates 30-minute slots; the frontend only ever shows
  the open ones. This mirrors how real clinics schedule and makes
  double-booking structurally impossible.

- **Uniqueness enforced in app code, not a DB constraint.** This was a
  trade-off. A `UNIQUE` constraint on `time_slot_id` would let the DB
  enforce no-double-booking, but it would also block re-booking a slot
  after a cancellation. Checking `status in (PENDING, CONFIRMED)` inside
  `create_booking` keeps cancelled rows around for auditability while
  still preventing collisions. In a production codebase I'd reach for a
  partial unique index.

- **Bookings default to `PENDING`.** Patient requests aren't the same as
  confirmed appointments. Letting staff confirm matches real clinic
  flow and avoids overpromising to the patient.

- **PATCH endpoints return the full updated record.** The frontend can
  trust the response and skip a redundant refetch.

- **TanStack Query for client data.** Admin filters feed directly into
  the query key, so changing a filter triggers an automatic refetch.
  Mutations invalidate the same key to keep the table in sync after
  Confirm / Cancel actions.

- **Slot + physician passed via React Router state, not refetched.**
  When the patient clicks a slot, the booking form receives the slot
  and physician via navigation state — avoids an extra API round-trip.
  Trade-off: on a hard refresh of the form, the summary card hides
  (the form itself still works fine).

- **Naive datetimes throughout.** Fine for a single-machine demo. In
  production I'd switch to timezone-aware UTC and convert to local on
  the client.

- **No UI component library.** A small set of `@layer components`
  classes in `index.css` (`.btn`, `.card`, `.input`, etc.) keep the
  styling consistent without dragging in a theme system. The component
  count is small enough that bespoke felt cleaner than shadcn.

- **One typed `api` object on the frontend.** Single place to look for
  every endpoint, fully typed, easy to swap the transport later.


## What I would improve with more time

- A `GET /api/slots/:id` endpoint so the booking form survives a hard
  refresh with full slot + physician context.
- Real authentication and role-based access (patient / physician /
  admin), with the admin view actually gated.
- Email and SMS confirmations to the patient, plus a heads-up to the
  physician when a booking comes in.
- Patient self-service cancel and reschedule — the API already supports
  the underlying state transitions.
- Recurring physician availability rules ("Mon–Fri 9–5, except
  holidays") instead of pre-seeded slot rows.
- An audit log on booking state transitions: who confirmed or cancelled
  and when.
- A `Dockerfile` and `docker-compose.yml` so the whole thing comes up
  with one command.


Created by DucTranPhan — https://github.com/ductranphan
