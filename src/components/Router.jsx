import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserSelection from "./UserSelection.jsx"; // Página principal
import Reservations from "./Reservations.jsx"; // Página de reservas
import ReservationForm from "./ReservationForm.jsx";
import ReservationsSummary from "./ReservationsSummary.jsx";
import UserSelectionDay from "./UserSelectionDay.jsx";
import ReservationsDay from "./ReservationsDay.jsx";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserSelection />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/reservations/edit" element={<ReservationForm />} />
        <Route path="/summary" element={<ReservationsSummary/>}/>
        <Route path="/user_selection_day" element={<UserSelectionDay/>}/>
        <Route path="/reservationsDay" element={<ReservationsDay />} />
      </Routes>
    </BrowserRouter>
  );
}
