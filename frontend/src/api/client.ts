import axios from "axios";
import type {
  Booking,
  BookingCreatePayload,
  BookingStatus,
  Physician,
  TimeSlot,
} from "@/types";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const http = axios.create({ baseURL });

export const api = {
  listPhysicians: async (): Promise<Physician[]> => {
    const { data } = await http.get<Physician[]>("/api/physicians");
    return data;
  },
  getPhysician: async (id: string): Promise<Physician> => {
    const { data } = await http.get<Physician>(`/api/physicians/${id}`);
    return data;
  },
  listSlots: async (physicianId: string): Promise<TimeSlot[]> => {
    const { data } = await http.get<TimeSlot[]>(
      `/api/physicians/${physicianId}/slots`
    );
    return data;
  },
  createBooking: async (payload: BookingCreatePayload): Promise<Booking> => {
    const { data } = await http.post<Booking>("/api/bookings", payload);
    return data;
  },
  getBooking: async (id: string): Promise<Booking> => {
    const { data } = await http.get<Booking>(`/api/bookings/${id}`);
    return data;
  },
  listBookings: async (params?: {
    status?: BookingStatus;
    physician_id?: string;
  }): Promise<Booking[]> => {
    const { data } = await http.get<Booking[]>("/api/bookings", { params });
    return data;
  },
  updateBookingStatus: async (
    id: string,
    status: BookingStatus
  ): Promise<Booking> => {
    const { data } = await http.patch<Booking>(`/api/bookings/${id}`, {
      status,
    });
    return data;
  },
};
