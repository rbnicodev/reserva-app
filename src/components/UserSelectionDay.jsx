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
      <h1 className="text-center mb-4">Selecciona tu usuario</h1>

      {ListUsers(users, Paths.DAY_RESERVATION)}
    </div>
  );
}
