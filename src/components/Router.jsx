import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserSelection from "./Pages/UserSelection.jsx";
import Reservations from "./Pages/Reservations.jsx";
import ReservationForm from "./Pages/ReservationForm.jsx";
import ReservationsSummary from "./Pages/ReservationsSummary.jsx";
import UserSelectionDay from "./Pages/UserSelectionDay.jsx";
import Index from "./Pages/Index.jsx";
import Layout from "./Layout.jsx";
import { Paths } from "../utils/paths.js";
import ReservationCalendar from "./Pages/ReservationCalendar.jsx";
import ReservationsDay from "./Pages/ReservationsDay.jsx";
import ReservationsDetail from "./Pages/ReservationsDetail.jsx";
import Board from "./Pages/Board.tsx";
import ProgramacionMoros from "./Pages/ProgramacionMoros.tsx";
import PayUserAccess from "./Pages/PayUsersAcces.tsx";
import Payments from "./Pages/Payments.tsx";
import { useState } from "react";

export default function Router() {

  const [payUser, setPayUser] = useState(null);
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
          <Route path={Paths.RESERVATION_CALENDAR} element={<ReservationCalendar />} />
          <Route path={Paths.TABLE_RESERVATIONS_DETAIL} element={<ReservationsDetail />} />
          <Route path={Paths.BULLETIN_BOARD} element={<Board />} />
          <Route path={Paths.PROGRAMACION_MOROS} element={<ProgramacionMoros />} />
          <Route path={Paths.PAYMENTS_ACCESS} element={!!payUser ? (<Payments payUser={payUser} setPayUser={setPayUser}/>): (<PayUserAccess setPayUser={setPayUser}/>)}/>
          <Route path={Paths.PAYMENTS} element={!!payUser ? (<Payments payUser={payUser} setPayUser={setPayUser}/>): (<PayUserAccess setPayUser={setPayUser}/>)}/>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
