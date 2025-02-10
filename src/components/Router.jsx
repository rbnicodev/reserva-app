import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserSelection from "./UserSelection.jsx"; // Página principal
import Reservations from "./Reservations.jsx"; // Página de reservas
import ReservationForm from "./ReservationForm.jsx";
import ReservationsSummary from "./ReservationsSummary.jsx";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserSelection />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/reservations/edit" element={<ReservationForm />} />
        <Route path="/summary" element={<ReservationsSummary/>}/>
      </Routes>
    </BrowserRouter>
  );
}
