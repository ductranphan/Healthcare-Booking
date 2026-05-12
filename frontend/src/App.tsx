import { Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Physicians from "@/pages/Physicians";
import SlotPicker from "@/pages/SlotPicker";
import BookingForm from "@/pages/BookingForm";
import Confirmation from "@/pages/Confirmation";
import Admin from "@/pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/physicians" element={<Physicians />} />
        <Route path="/physicians/:id" element={<SlotPicker />} />
        <Route path="/book/:slotId" element={<BookingForm />} />
        <Route path="/booking/:id" element={<Confirmation />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
