export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Physician {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image_url: string;
}

export interface TimeSlot {
  id: string;
  physician_id: string;
  start_time: string;
  end_time: string;
}

export interface BookingCreatePayload {
  time_slot_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_dob: string;
  reason_for_visit: string;
}

export interface Booking {
  id: string;
  time_slot_id: string;
  physician_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_dob: string;
  reason_for_visit: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  physician: Physician;
  time_slot: TimeSlot;
}
