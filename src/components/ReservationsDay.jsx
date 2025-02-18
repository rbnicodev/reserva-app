import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { collection, doc, getDoc, getDocs, setDoc, addDoc, query, where, deleteDoc } from "firebase/firestore";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es"; // Importa el idioma español
import { format } from "date-fns";


export default function ReservationsDay() {

  registerLocale("es", es);
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener `userId` de la URL
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("userId");

  const [reservations, setReservations] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [createReservation, setCreateReservation] = useState(null);
  const [newReservation, setNewReservation] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Cargar reservas y turnos desde Firebase
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      // Cargar reservas del usuario
      const reservationsCollection = collection(db, "reservationsDay");
      const reservationsQuery = query(reservationsCollection, where("userId", "==", userId));
      const reservationsDocs = await getDocs(reservationsQuery);

      // Guardamos las reservas ordenadas por `reservationDate`
      const sortedReservations = reservationsDocs.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => (a.reservationDate - b.reservationDate));

      setReservations(sortedReservations);
    };

    fetchData();
  }, [userId]);

  // Función para eliminar una reserva
  const deleteReservation = async () => {
    if (!confirmDeleteId) return;

    try {
      await deleteDoc(doc(db, "reservationsDay", confirmDeleteId)); // Borra el documento correctamente
      setReservations(reservations.filter((r) => r.id !== confirmDeleteId)); // Elimina del estado
    } catch (error) {
      console.error("Error eliminando la reserva:", error);
    }

    setConfirmDeleteId(null);
  };


  const saveReservation = async (date) => {
    if (!date) return;
  
    const formattedDate = format(date, "yyyy-MM-dd"); // Formatea la fecha en texto
  
    try {
      const docRef = await addDoc(collection(db, "reservationsDay"), {
        userId,
        reservationDate: formattedDate,
      });
  
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        setReservations([...reservations, { id: docSnap.id, ...docSnap.data() }]);
      }
    } catch (error) {
      console.error("Error creando la reserva:", error);
    }
  
    setCreateReservation(null);
  };
  


  return (
    
    <div className="container d-flex flex-column align-items-center py-4" style={{ minHeight: "100vh" }}>
      {/* Botón de volver */}
      <button className="btn btn-link position-absolute top-0 start-0 mt-3 ms-3" onClick={() => navigate(`/user_selection_day`)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708.708L2.707 7.5H14.5a.5.5 0 0 1 .5.5" />
        </svg>
      </button>

      <h1 className="text-center mb-4">Tus Reservas</h1>

      {/* Lista de reservas */}
      <div className="w-100 d-flex flex-column align-items-center">
        {reservations.length === 0 ? (
          <p className="text-secondary text-center">No hay reservas todavía.</p>
        ) : (
          <div className="w-100 d-grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {reservations.map((reservation) => {

              const formattedDate = reservation.reservationDate 
              ? format(new Date(reservation.reservationDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) 
              : "Fecha desconocida";
            

              return (
                <div className="card shadow-sm p-3 d-flex flex-row align-items-center justify-content-between" key={reservation.id}>
                  <div className="cursor-pointer flex-grow-1" onClick={() => navigate(`/reservationsDay/edit?reservationId=${reservation.id}&userId=${userId}`)}>
                    <h5 className="card-title text-primary">{formattedDate}</h5>  
                  </div>
  
                  {/* Botón de eliminar */}
                  <button className="btn btn-sm" onClick={() => setConfirmDeleteId(reservation.id)}>
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón para agregar nueva reserva */}
      <div className="mt-1">
        <button className="btn btn-primary rounded-circle shadow" style={{ width: "60px", height: "60px", fontSize: "28px" }} onClick={() => setCreateReservation(true)}>
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

      {createReservation && (
        <div className="modal d-block" style={{ background: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear reserva</h5>
                <button type="button" className="btn-close" onClick={() => setCreateReservation(null)}></button>
              </div>
              <div className="modal-body">
                <p>Escoge la fecha:</p>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                  locale="es"
                  todayButton="Hoy"
                  calendarStartDay={1}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setCreateReservation(null)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={() => saveReservation(selectedDate)}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
