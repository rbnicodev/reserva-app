import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { db } from "~/firebase";
import { collection, doc, getDoc, getDocs, setDoc, addDoc, query, where } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

interface Reservation {
  guests: number;
  kids: number;
  shiftId: string;
  userId: string;
}

interface Shift {
  id: string;
  name: string;
  order: number;
}

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = new URLSearchParams(location.url.search).get("userId");
  const reservationId = new URLSearchParams(location.url.search).get("reservationId");

  const reservation = useSignal<Reservation>({
    guests: 0,
    kids: 0,
    shiftId: "",
    userId: userId || "",
  });

  const availableShifts = useSignal<Shift[]>([]);
  const currentShiftName = useSignal<string>("");

  useTask$(async () => {
    if (!userId) return;

    // Obtener turnos reservados por el usuario
    const reservationsQuery = query(collection(db, "reservations"), where("userId", "==", userId));
    const reservationsSnapshot = await getDocs(reservationsQuery);
    const reservedShifts = new Set(reservationsSnapshot.docs.map(doc => doc.data().shiftId));

    // Obtener todos los turnos disponibles
    const shiftsSnapshot = await getDocs(collection(db, "shifts"));
    const allShifts = shiftsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      order: doc.data().order ?? 9999, // Si no tiene 'order', ponerlo al final
    }));

    // Si estamos editando, buscamos el nombre del turno actual
    if (reservationId) {
      const docRef = doc(db, "reservations", reservationId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        reservation.value = docSnap.data() as Reservation;
        const shift = allShifts.find(s => s.id === reservation.value.shiftId);
        if (shift) {
          currentShiftName.value = shift.name; // Guardamos el nombre del turno
        }
      }
    }

    // Filtrar y ordenar los turnos disponibles solo para nueva reserva
    availableShifts.value = allShifts
      .filter(shift => !reservedShifts.has(shift.id))
      .sort((a, b) => a.order - b.order);
  });

  const saveReservation = $(async () => {
    if (!userId) return alert("Error: No se encontró el usuario.");
    if (!reservation.value.shiftId) return alert("Por favor, selecciona un turno.");

    if (reservationId) {
      await setDoc(doc(db, "reservations", reservationId), reservation.value);
    } else {
      await addDoc(collection(db, "reservations"), reservation.value);
    }
    navigate(`/reservations?userId=${userId}`);
  });

  return (
    <div class="container py-4 position-relative">
      {/* Botón estilo iOS en la esquina superior izquierda */}
      <button
        class="btn btn-link position-absolute top-0 start-0 mt-3 ms-3"
        onClick$={() => navigate(`/reservations?userId=${userId}`)}
        style={{ fontSize: "24px" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708.708L2.707 7.5H14.5a.5.5 0 0 1 .5.5"/>
        </svg>
      </button>


      <h1 class="text-center mb-4">{reservationId ? "Editar Reserva" : "Nueva Reserva"}</h1>

      <div class="mb-3">
        <label class="form-label">Invitados</label>
        <input 
          type="number" 
          class="form-control" 
          value={reservation.value.guests}
          onInput$={(e) => (reservation.value.guests = Number((e.target as HTMLInputElement).value))} 
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Niños</label>
        <input 
          type="number" 
          class="form-control" 
          value={reservation.value.kids}
          onInput$={(e) => (reservation.value.kids = Number((e.target as HTMLInputElement).value))} 
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Turno</label>
        {reservationId ? (
          <p class="form-control-plaintext">{currentShiftName.value || "Turno no encontrado"}</p>
        ) : (
          <select 
            class="form-select" 
            value={reservation.value.shiftId}
            onChange$={(e) => (reservation.value.shiftId = (e.target as HTMLSelectElement).value)}
          >
            <option value="">Selecciona un turno</option>
            {availableShifts.value.map(shift => (
              <option key={shift.id} value={shift.id}>
                {shift.name}
              </option>
            ))}
          </select>
        )}
      </div>
      
      <button class="btn btn-primary w-100" onClick$={saveReservation}>
        Guardar
      </button>
    </div>
  );
});
