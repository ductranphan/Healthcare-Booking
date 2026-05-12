import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import BookingTable from "@/components/BookingTable";
import type { BookingStatus } from "@/types";

const STATUSES: { value: BookingStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function Admin() {
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [physicianId, setPhysicianId] = useState<string>("");

  const physiciansQ = useQuery({
    queryKey: ["physicians"],
    queryFn: api.listPhysicians,
  });

  const bookingsQ = useQuery({
    queryKey: ["admin-bookings", status, physicianId],
    queryFn: () =>
      api.listBookings({
        status: status === "ALL" ? undefined : status,
        physician_id: physicianId || undefined,
      }),
  });

  const stats = useMemo(() => {
    const all = bookingsQ.data ?? [];
    return {
      total: all.length,
      pending: all.filter((b) => b.status === "PENDING").length,
      confirmed: all.filter((b) => b.status === "CONFIRMED").length,
      cancelled: all.filter((b) => b.status === "CANCELLED").length,
    };
  }, [bookingsQ.data]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
        <p className="mt-1 text-stone-600">
          Review and manage upcoming appointments.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Total" value={stats.total} />
        <Stat label="Pending" value={stats.pending} />
        <Stat label="Confirmed" value={stats.confirmed} />
        <Stat label="Cancelled" value={stats.cancelled} />
      </div>

      <div className="card p-4 mb-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="label">Status</label>
          <select
            className="input"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as BookingStatus | "ALL")
            }
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="label">Physician</label>
          <select
            className="input"
            value={physicianId}
            onChange={(e) => setPhysicianId(e.target.value)}
          >
            <option value="">All physicians</option>
            {physiciansQ.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {bookingsQ.isLoading && (
        <div className="card p-10 animate-pulse text-stone-400 text-center">
          Loading bookings…
        </div>
      )}
      {bookingsQ.isError && (
        <div className="card p-6 text-sm text-red-700 bg-red-50 border-red-200">
          Couldn't load bookings. Is the API running?
        </div>
      )}
      {bookingsQ.data && <BookingTable bookings={bookingsQ.data} />}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-stone-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
