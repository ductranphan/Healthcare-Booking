import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api/client";
import { formatSlot } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";
import StatusBadge from "./StatusBadge";

export default function BookingTable({ bookings }: { bookings: Booking[] }) {
  const qc = useQueryClient();
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      api.updateBookingStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking updated");
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Couldn't update booking";
      toast.error(message);
    },
  });

  if (bookings.length === 0) {
    return (
      <div className="card p-10 text-center text-stone-600">
        No bookings match these filters.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wide">
          <tr>
            <Th>When</Th>
            <Th>Physician</Th>
            <Th>Patient</Th>
            <Th>Reason</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-stone-50">
              <Td className="whitespace-nowrap">
                {formatSlot(b.time_slot.start_time)}
              </Td>
              <Td>
                <div className="font-medium">{b.physician.name}</div>
                <div className="text-stone-500 text-xs">
                  {b.physician.specialty}
                </div>
              </Td>
              <Td>
                <div>{b.patient_name}</div>
                <div className="text-stone-500 text-xs">{b.patient_email}</div>
              </Td>
              <Td
                className="max-w-xs truncate text-stone-600"
                title={b.reason_for_visit}
              >
                {b.reason_for_visit}
              </Td>
              <Td>
                <StatusBadge status={b.status} />
              </Td>
              <Td className="text-right whitespace-nowrap">
                {b.status === "PENDING" && (
                  <button
                    onClick={() =>
                      update.mutate({ id: b.id, status: "CONFIRMED" })
                    }
                    className="text-emerald-700 hover:text-emerald-900 font-medium text-xs mr-3"
                  >
                    Confirm
                  </button>
                )}
                {b.status !== "CANCELLED" && (
                  <button
                    onClick={() =>
                      update.mutate({ id: b.id, status: "CANCELLED" })
                    }
                    className="text-red-700 hover:text-red-900 font-medium text-xs"
                  >
                    Cancel
                  </button>
                )}
                {b.status === "CANCELLED" && (
                  <button
                    onClick={() =>
                      update.mutate({ id: b.id, status: "PENDING" })
                    }
                    className="text-stone-700 hover:text-stone-900 font-medium text-xs"
                  >
                    Reopen
                  </button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`text-left font-medium px-4 py-3 ${className}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td className={`px-4 py-3 align-top ${className}`} title={title}>
      {children}
    </td>
  );
}
