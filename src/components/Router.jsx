import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
import MenuView from "./Pages/MenuView.tsx";
import LoginPage from "../features/auth/pages/LoginPage.tsx";
import OAuthCallbackPage from "../features/auth/pages/OAuthCallbackPage.tsx";
import { getSession } from "../features/auth/lib/authStorage.ts";
import { ensureFreshSession } from "../features/auth/lib/session.ts";

/** Sin sesión recuperable (ni token vigente ni refresh válido) se redirige a la pantalla de login. */
function RequireAuth() {
  const location = useLocation();
  const [authorized, setAuthorized] = useState(() => (getSession() ? null : false));

  useEffect(() => {
    let active = true;
    ensureFreshSession().then((session) => {
      if (active) setAuthorized(!!session);
    });
    return () => {
      active = false;
    };
  }, [location.pathname]);

  if (authorized === null) return null;
  return authorized ? <Outlet /> : <Navigate to={Paths.LOGIN} replace />;
}

export default function Router() {

  const [payUser, setPayUser] = useState(null);
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path={Paths.LOGIN} element={<LoginPage />} />
          <Route path={Paths.LOGIN_CALLBACK} element={<OAuthCallbackPage />} />
          <Route element={<RequireAuth />}>
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
            <Route path={Paths.PAYMENTS_ACCESS} element={!!payUser ? (<Navigate to={Paths.PAYMENTS}/>): (<PayUserAccess setPayUser={setPayUser}/>)}/>
            <Route path={Paths.PAYMENTS} element={!!payUser ? (<Payments payUser={payUser} setPayUser={setPayUser}/>): (<Navigate to={Paths.PAYMENTS_ACCESS}/>)}/>
            <Route path={Paths.MENUS} element={<MenuView />} />
            <Route path="*" element={<Navigate to={Paths.INDEX} replace />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
