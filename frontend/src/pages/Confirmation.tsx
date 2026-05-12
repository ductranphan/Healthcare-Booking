import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { api } from "@/api/client";
import StatusBadge from "@/components/StatusBadge";
import { formatSlot } from "@/lib/utils";

export default function Confirmation() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => api.getBooking(id!),
    enabled: !!id,
  });

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      {isLoading && <div className="h-40 bg-stone-100 rounded animate-pulse" />}

      {isError && (
        <div className="card p-6 text-sm text-red-700 bg-red-50 border-red-200">
          We couldn't load this booking.
        </div>
      )}

      {data && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="size-9 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
              <Check className="size-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Booking received
            </h1>
          </div>
          <p className="text-stone-600 mb-8">
            We've sent the details to{" "}
            <span className="font-medium text-stone-900">
              {data.patient_email}
            </span>
            . A clinic team member will confirm shortly.
          </p>

          <div className="card overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <div className="text-xs text-stone-500">
                Reference ·{" "}
                <span className="font-mono text-stone-700">
                  {data.id.slice(0, 8)}
                </span>
              </div>
              <StatusBadge status={data.status} />
            </div>
            <dl className="p-5 grid sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <Row label="Physician" value={data.physician.name} />
              <Row label="Specialty" value={data.physician.specialty} />
              <Row
                label="Appointment"
                value={formatSlot(data.time_slot.start_time)}
              />
              <Row label="Patient" value={data.patient_name} />
              <Row label="Email" value={data.patient_email} />
              <Row label="Phone" value={data.patient_phone} />
              <Row
                label="Reason"
                value={data.reason_for_visit}
                className="sm:col-span-2"
              />
            </dl>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/" className="btn btn-secondary">
              Back to home
            </Link>
            <Link to="/physicians" className="btn btn-primary">
              Book another
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

function Row({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-stone-500 text-xs uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-stone-900 mt-1">{value}</dd>
    </div>
  );
}
