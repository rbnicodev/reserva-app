import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Para redirección
import ListUsers from "../ListUsers";
import { Paths } from "../../utils/paths";
import Header from "../Header";

export default function UserSelection() {
  // Pendiente de conectar con el backend (GET /api/users).
  const [users] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div>
      {Header(null, "Reserva M&C")}
      <div style={{ paddingTop: "120px", paddingBottom: "20px" }}>
        {ListUsers(users, Paths.TABLE_RESERVATION)}
      </div>
    </div>
  );
}
