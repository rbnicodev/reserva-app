import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Para redirección
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ListUsers from "./ListUsers";
import { Paths } from "../utils/paths";

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
    <div>
      <button className="btn btn-link position-absolute start-0 ms-3" onClick={() => navigate(Paths.INDEX)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="gray" className="bi bi-arrow-left" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708.708L2.707 7.5H14.5a.5.5 0 0 1 .5.5" />
        </svg>
      </button>
      <h1 className="text-center mb-4">Reservar Día</h1>

      {ListUsers(users, Paths.DAY_RESERVATION)}
    </div>
  );
}
