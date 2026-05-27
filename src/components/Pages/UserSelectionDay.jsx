import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Para redirección
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import ListUsers from "../ListUsers";
import { Paths } from "../../utils/paths";
import Header from "../Header";

export default function UserSelectionDay() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

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
      {Header(null, "Reservar Día")}
      <div style={{ paddingTop: "120px", paddingBottom: "20px" }}>
        {ListUsers(users, Paths.DAY_RESERVATION)}
      </div>
    </div>
  );
}
