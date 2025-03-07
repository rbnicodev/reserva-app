import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserSelection from "./UserSelection.jsx"; // Página principal
import Reservations from "./Reservations.jsx"; // Página de reservas
import ReservationForm from "./ReservationForm.jsx";
import ReservationsSummary from "./ReservationsSummary.jsx";
import UserSelectionDay from "./UserSelectionDay.jsx";
import ReservationsDay from "./ReservationsDay.jsx";
import Index from "./Index.jsx";
import Layout from "./Layout.jsx";
import { Paths } from "../utils/paths.js";

export default function Router() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path={Paths.INDEX} element={<Index />} />
          <Route path={Paths.TABLE_USER_SELECTION} element={<UserSelection />} />
          <Route path={Paths.TABLE_RESERVATION} element={<Reservations />} />
          <Route path={Paths.TABLE_RESERVATION_FORM} element={<ReservationForm />} />
          <Route path={Paths.TABLE_RESERVATIONS_SUMMARY} element={<ReservationsSummary />} />
          <Route path={Paths.DAY_USER_SELECTION} element={<UserSelectionDay />} />
          <Route path={Paths.DAY_RESERVATION} element={<ReservationsDay />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
