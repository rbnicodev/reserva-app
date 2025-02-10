import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, query, where, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Reservations() {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener `userId` de la URL
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("userId");

  const [reservations, setReservations] = useState([]);
  const [shifts, setShifts] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Cargar reservas y turnos desde Firebase
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      // Cargar turnos
      const shiftsCollection = collection(db, "shifts");
      const shiftsDocs = await getDocs(shiftsCollection);
      const shiftsData = {};
      shiftsDocs.forEach((doc) => {
        shiftsData[doc.id] = { id: doc.id, ...doc.data() };
      });
      setShifts(shiftsData);

      // Cargar reservas del usuario
      const reservationsCollection = collection(db, "reservations");
      const reservationsQuery = query(reservationsCollection, where("userId", "==", userId));
      const reservationsDocs = await getDocs(reservationsQuery);

      // Guardamos las reservas ordenadas por `shift.order`
      const sortedReservations = reservationsDocs.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => (shiftsData[a.shiftId]?.order ?? 0) - (shiftsData[b.shiftId]?.order ?? 0));

      setReservations(sortedReservations);
    };

    fetchData();
  }, [userId]);

  // Función para eliminar una reserva
  const deleteReservation = async () => {
    if (!confirmDeleteId) return;

    try {
      await deleteDoc(doc(db, "reservations", confirmDeleteId));
      setReservations(reservations.filter((r) => r.id !== confirmDeleteId));
    } catch (error) {
      console.error("Error eliminando la reserva:", error);
    }

    setConfirmDeleteId(null);
  };

  return (
    <div className="container d-flex flex-column align-items-center py-4" style={{ minHeight: "100vh" }}>
      {/* Botón de volver */}
      <button className="btn btn-link position-absolute top-0 start-0 mt-3 ms-3" onClick={() => navigate(`/`)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708.708L2.707 7.5H14.5a.5.5 0 0 1 .5.5" />
        </svg>
      </button>

      <h1 className="text-center mb-4">Tus Reservas</h1>

      {/* Lista de reservas */}
      <div className="w-100 d-flex flex-column align-items-center">
        {reservations.length === 0 ? (
          <p className="text-secondary text-center">No hay reservas aún.</p>
        ) : (
          <div className="w-100 d-grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {reservations.map((reservation) => (
              <div className="card shadow-sm p-3 d-flex flex-row align-items-center justify-content-between" key={reservation.id}>
                <div className="cursor-pointer flex-grow-1" onClick={() => navigate(`/reservations/edit?reservationId=${reservation.id}&userId=${userId}`)}>
                  <h5 className="card-title text-primary">{shifts[reservation.shiftId]?.name || "Turno desconocido"}</h5>
                  <p className="card-text">👥 {reservation.guests} Invitados | 🧒 {reservation.kids} Niños</p>
                </div>

                {/* Botón de eliminar */}
                <button className="btn btn-outline-danger btn-sm" onClick={() => setConfirmDeleteId(reservation.id)}>
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón para agregar nueva reserva */}
      <div className="mt-1">
        <button className="btn btn-primary rounded-circle shadow" style={{ width: "60px", height: "60px", fontSize: "28px" }} onClick={() => navigate(`/reservations/edit?userId=${userId}`)}>
          +
        </button>
      </div>

      {/* Modal de confirmación de eliminación */}
      {confirmDeleteId && (
        <div className="modal d-block" style={{ background: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Eliminar reserva</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                <p>¿Seguro que quieres eliminar esta reserva?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setConfirmDeleteId(null)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={deleteReservation}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
