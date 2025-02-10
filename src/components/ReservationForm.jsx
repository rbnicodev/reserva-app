import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { collection, doc, getDoc, getDocs, setDoc, addDoc, query, where } from "firebase/firestore";

export default function ReservationForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener `userId` y `reservationId` de la URL
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("userId");
  const reservationId = searchParams.get("reservationId");

  const [reservation, setReservation] = useState({
    guests: 0,
    kids: 0,
    shiftId: "",
    userId: userId || "",
  });

  const [availableShifts, setAvailableShifts] = useState([]);
  const [currentShiftName, setCurrentShiftName] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
        
      // Obtener turnos reservados por el usuario
      const reservationsQuery = query(collection(db, "reservations"), where("userId", "==", userId));
      const reservationsSnapshot = await getDocs(reservationsQuery);
      const reservedShifts = new Set(reservationsSnapshot.docs.map((doc) => doc.data().shiftId));

      // Obtener todos los turnos disponibles
      const shiftsSnapshot = await getDocs(collection(db, "shifts"));
      const allShifts = shiftsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        order: doc.data().order ?? 9999, // Si no tiene 'order', ponerlo al final
      }));

      // Si estamos editando, buscamos el nombre del turno actual
      if (reservationId) {
        const docRef = doc(db, "reservations", reservationId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReservation(docSnap.data());
          const shift = allShifts.find((s) => s.id === docSnap.data().shiftId);
          if (shift) {
            setCurrentShiftName(shift.name);
          }
        }
      }

      // Filtrar y ordenar los turnos disponibles solo para nueva reserva
      setAvailableShifts(allShifts.filter((shift) => !reservedShifts.has(shift.id)).sort((a, b) => a.order - b.order));
    };

    fetchData();
  }, [userId, reservationId]);

  const saveReservation = async () => {
    if (!userId) return alert("Error: No se encontró el usuario.");
    if (!reservation.shiftId) return alert("Por favor, selecciona un turno.");

    if (reservationId) {
      await setDoc(doc(db, "reservations", reservationId), reservation);
    } else {
      await addDoc(collection(db, "reservations"), reservation);
    }
    navigate(`/reservations?userId=${userId}`);
  };

  return (
    <div className="container py-4 position-relative">
      {/* Botón de volver */}
      <button className="btn btn-link position-absolute top-0 start-0 mt-3 ms-3" onClick={() => navigate(`/reservations?userId=${userId}`)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708.708L2.707 7.5H14.5a.5.5 0 0 1 .5.5" />
        </svg>
      </button>

      <h1 className="text-center mb-4">{reservationId ? "Editar Reserva" : "Nueva Reserva"}</h1>

      <div className="mb-3">
        <label className="form-label">Invitados</label>
        <input
          type="number"
          className="form-control"
          value={reservation.guests}
          onChange={(e) => setReservation({ ...reservation, guests: Number(e.target.value) })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Niños</label>
        <input
          type="number"
          className="form-control"
          value={reservation.kids}
          onChange={(e) => setReservation({ ...reservation, kids: Number(e.target.value) })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Turno</label>
        {reservationId ? (
          <p className="form-control-plaintext">{currentShiftName || "Turno no encontrado"}</p>
        ) : (
          <select className="form-select" value={reservation.shiftId} onChange={(e) => setReservation({ ...reservation, shiftId: e.target.value })}>
            <option value="">Selecciona un turno</option>
            {availableShifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <button className="btn btn-primary w-100" onClick={saveReservation}>
        Guardar
      </button>
    </div>
  );
}
