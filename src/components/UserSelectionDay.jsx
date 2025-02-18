import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Para redirección
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function UserSelectionDay() {
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
    <div className="container w-100 min-vh-100 d-flex flex-column align-items-center justify-content-center">
      
  
      {/* Botón de acceso a la pantalla de resumen */}
      <button
        className="btn btn-dark w-100 mt-4 py-3"
        onClick={() => navigate(`/user_selection_day`)}
      >
        📊 Ver Resumen de Reservas
      </button>
      <h1 className="text-center mb-4">Selecciona tu usuario</h1>
  
      {users.length === 0 ? (
        <p className="text-secondary">Cargando usuarios...</p>
      ) : (
        <div className="row row-cols-2 row-cols-sm-3 g-3 w-100" style={{ maxWidth: "600px" }}>
          {users.map(user => (
            <div className="col" key={user.id}>
              <button
                className="btn btn-primary w-100 py-3"
                onClick={() => navigate(`/reservationsDay?userId=${user.id}`)}
              >
                {user.name}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );  
}
