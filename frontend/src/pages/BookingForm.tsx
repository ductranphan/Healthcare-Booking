import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { formatSlot } from "@/lib/utils";
import type { Physician, TimeSlot } from "@/types";

const schema = z.object({
  patient_name: z.string().min(1, "Required").max(120),
  patient_email: z.string().email("Enter a valid email"),
  patient_phone: z.string().min(7, "Enter a valid phone").max(30),
  patient_dob: z
    .string()
    .min(1, "Required")
    .refine((v) => new Date(v) < new Date(), "Must be in the past"),
  reason_for_visit: z.string().min(1, "Required").max(1000),
});

type FormValues = z.infer<typeof schema>;

export default function BookingForm() {
  const { slotId } = useParams<{ slotId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as
    | { slot?: TimeSlot; physician?: Physician }
    | null;
  const slot = navState?.slot;
  const physician = navState?.physician;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_name: "",
      patient_email: "",
      patient_phone: "",
      patient_dob: "",
      reason_for_visit: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: api.createBooking,
    onSuccess: (booking) => {
      toast.success("Booking request submitted");
      navigate(`/booking/${booking.id}`);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Something went wrong. Please try again.";
      toast.error(message);
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!slotId) return;
    createMutation.mutate({ ...values, time_slot_id: slotId });
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 mb-6"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      <h1 className="text-2xl font-semibold tracking-tight">Your details</h1>
      <p className="mt-1 text-stone-600">
        We'll use this to confirm your appointment.
      </p>

      {slot && physician && (
        <div className="card mt-6 p-4 bg-stone-50 border-stone-200">
          <div className="flex items-center gap-3">
            <img
              src={physician.image_url}
              alt=""
              className="size-10 rounded-full object-cover bg-stone-100"
            />
            <div className="text-sm">
              <div className="font-medium">{physician.name}</div>
              <div className="text-stone-600">
                {physician.specialty} · {formatSlot(slot.start_time)}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <Field
          label="Full name"
          error={form.formState.errors.patient_name?.message}
        >
          <input
            type="text"
            autoComplete="name"
            placeholder="Alex Morgan"
            {...form.register("patient_name")}
            className="input"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            label="Email"
            error={form.formState.errors.patient_email?.message}
          >
            <input
              type="email"
              autoComplete="email"
              placeholder="alex@example.com"
              {...form.register("patient_email")}
              className="input"
            />
          </Field>
          <Field
            label="Phone"
            error={form.formState.errors.patient_phone?.message}
          >
            <input
              type="tel"
              autoComplete="tel"
              placeholder="(555) 123-4567"
              {...form.register("patient_phone")}
              className="input"
            />
          </Field>
        </div>

        <Field
          label="Date of birth"
          error={form.formState.errors.patient_dob?.message}
        >
          <input
            type="date"
            {...form.register("patient_dob")}
            className="input"
            max={new Date().toISOString().slice(0, 10)}
          />
        </Field>

        <Field
          label="Reason for visit"
          error={form.formState.errors.reason_for_visit?.message}
        >
          <textarea
            rows={4}
            placeholder="A short description helps your physician prepare."
            {...form.register("reason_for_visit")}
            className="input resize-none"
          />
        </Field>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn btn-primary"
          >
            {createMutation.isPending ? "Submitting…" : "Request appointment"}
          </button>
          <Link
            to="/physicians"
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
