import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { api } from "@/api/client";
import { formatDay, formatTime, cn } from "@/lib/utils";

export default function SlotPicker() {
  const { id } = useParams<{ id: string }>();

  const physicianQ = useQuery({
    queryKey: ["physician", id],
    queryFn: () => api.getPhysician(id!),
    enabled: !!id,
  });

  const slotsQ = useQuery({
    queryKey: ["slots", id],
    queryFn: () => api.listSlots(id!),
    enabled: !!id,
  });

  const days = useMemo(() => {
    const slots = slotsQ.data ?? [];
    const map = new Map<string, typeof slots>();
    for (const slot of slots) {
      const key = slot.start_time.slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(slot);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [slotsQ.data]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const activeDay = selectedDay ?? days[0]?.[0] ?? null;
  const visibleSlots = days.find(([d]) => d === activeDay)?.[1] ?? [];

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Link
        to="/physicians"
        className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 mb-6"
      >
        <ArrowLeft className="size-4" /> All physicians
      </Link>

      {physicianQ.data && (
        <div className="flex items-start gap-4 mb-8">
          <img
            src={physicianQ.data.image_url}
            alt=""
            className="size-16 rounded-full object-cover bg-stone-100"
          />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {physicianQ.data.name}
            </h1>
            <div className="text-stone-600">{physicianQ.data.specialty}</div>
            <p className="text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              {physicianQ.data.bio}
            </p>
          </div>
        </div>
      )}

      <h2 className="text-sm font-medium text-stone-700 mb-3">Pick a day</h2>

      {slotsQ.isLoading ? (
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-14 w-24 bg-stone-100 rounded-md animate-pulse"
            />
          ))}
        </div>
      ) : days.length === 0 ? (
        <div className="card p-10 text-center text-stone-600">
          No upcoming availability for this physician.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-8">
          {days.map(([day, slots]) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm text-left transition-colors",
                day === activeDay
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-800 hover:bg-stone-100"
              )}
            >
              <div className="font-medium">{formatDay(slots[0].start_time)}</div>
              <div
                className={cn(
                  "text-xs",
                  day === activeDay ? "text-stone-300" : "text-stone-500"
                )}
              >
                {slots.length} open
              </div>
            </button>
          ))}
        </div>
      )}

      {visibleSlots.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-stone-700 mb-3">
            Pick a time
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {visibleSlots.map((slot) => (
              <Link
                key={slot.id}
                to={`/book/${slot.id}`}
                state={{ slot, physician: physicianQ.data }}
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-center hover:border-stone-900 hover:bg-stone-50 transition-colors"
              >
                {formatTime(slot.start_time)}
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
