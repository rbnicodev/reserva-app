import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Para redirección
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ListUsers from "./ListUsers";
import { Paths } from "../utils/paths";

export default function UserSelection() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const userDocs = await getDocs(usersCollection);
      setUsers(userDocs.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name ?? "Sin nombre"
      })));
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-center mb-4">Selecciona tu usuario</h1>

      {ListUsers(users, Paths.TABLE_RESERVATION)}

      {/* Botón de acceso a la pantalla de resumen */}
      <button
        className="btn btn-dark w-100 mt-4 py-3"
        onClick={() => navigate(`/user_selection_day`)}
      >
        📊 Ver Resumen de Reservas
      </button>
    </div>
  );
}
