import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { db } from "~/firebase";
import { collection, getDocs, query, where, doc, deleteDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

interface Reservation {
  id: string;
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
  const reservations = useSignal<Reservation[]>([]);
  const shifts = useSignal<{ [key: string]: Shift }>({});
  const confirmDeleteId = useSignal<string | null>(null); // ID de la reserva a eliminar

  // Cargar reservas y turnos ordenados
  useTask$(async () => {
    if (!userId) return;

    // Cargar turnos
    const shiftsCollection = collection(db, "shifts");
    const shiftsDocs = await getDocs(shiftsCollection);
    const shiftsData: { [key: string]: Shift } = {};
    shiftsDocs.forEach(doc => {
      shiftsData[doc.id] = { id: doc.id, ...doc.data() } as Shift;
    });
    shifts.value = shiftsData;

    // Cargar reservas del usuario
    const reservationsCollection = collection(db, "reservations");
    const reservationsQuery = query(
      reservationsCollection,
      where("userId", "==", userId)
    );
    const reservationsDocs = await getDocs(reservationsQuery);

    // Guardamos las reservas ordenadas por `shift.order`
    reservations.value = reservationsDocs.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }) as Reservation)
      .sort((a, b) => (shiftsData[a.shiftId]?.order ?? 0) - (shiftsData[b.shiftId]?.order ?? 0));
  });

  // Función para eliminar una reserva
  const deleteReservation = $(async () => {
    if (!confirmDeleteId.value) return;

    console.log(`Eliminando reserva con ID: ${confirmDeleteId.value}`);

    try {
      await deleteDoc(doc(db, "reservations", confirmDeleteId.value));
      reservations.value = reservations.value.filter(reservation => reservation.id !== confirmDeleteId.value);
    } catch (error) {
      console.error("Error eliminando la reserva:", error);
    }

    confirmDeleteId.value = null; // Cerrar diálogo de confirmación
  });

  return (
    <div class="container d-flex flex-column align-items-center py-4" style="min-height: 100vh;">
      <button
        class="btn btn-link position-absolute top-0 start-0 mt-3 ms-3"
        onClick$={() => navigate(`/`)}
        style={{ fontSize: "24px" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708.708L2.707 7.5H14.5a.5.5 0 0 1 .5.5"/>
        </svg>
      </button>
      <h1 class="text-center mb-4">Tus Reservas</h1>

      <div class="w-100 d-flex flex-column align-items-center">
        {reservations.value.length === 0 ? (
          <p class="text-secondary text-center">No hay reservas aún.</p>
        ) : (
          <div class="w-100 d-grid gap-3 mb-5" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
            {reservations.value.map(reservation => (
              <div class="card shadow-sm p-3 d-flex flex-row align-items-center justify-content-between" key={reservation.id}>
                <div 
                  class="cursor-pointer flex-grow-1" 
                  onClick$={() => navigate(`/reservations/edit?reservationId=${reservation.id}&userId=${userId}`)}
                >
                  <h5 class="card-title text-primary">{shifts.value[reservation.shiftId]?.name || "Turno desconocido"}</h5>
                  <p class="card-text">👥 {reservation.guests} Invitados | 🧒 {reservation.kids} Niños</p>
                </div>

                {/* Botón de eliminar */}
                <button 
                  class="btn btn-outline-danger btn-sm" 
                  onClick$={() => confirmDeleteId.value = reservation.id}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón debajo de la última tarjeta */}
      <div class="mt-1">
        <button
          class="btn btn-primary rounded-circle shadow"
          style="width: 60px; height: 60px; font-size: 28px;"
          onClick$={() => navigate(`/reservations/edit?userId=${userId}`)}
        >
          +
        </button>
      </div>

      {/* Diálogo de confirmación de eliminación */}
      {confirmDeleteId.value && (
        <div class="modal d-block" style="background: rgba(0, 0, 0, 0.5);">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Eliminar reserva</h5>
                <button type="button" class="btn-close" onClick$={() => (confirmDeleteId.value = null)}></button>
              </div>
              <div class="modal-body">
                <p>¿Seguro que quieres eliminar esta reserva?</p>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" onClick$={() => (confirmDeleteId.value = null)}>Cancelar</button>
                <button class="btn btn-danger" onClick$={deleteReservation}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
