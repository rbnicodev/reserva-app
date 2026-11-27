import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es"; // Importa el idioma español
import { format } from "date-fns";
import { Paths } from "../../utils/paths";
import Header from "../Header";


export default function ReservationsDay() {

  registerLocale("es", es);
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const location = useLocation();

  // Obtener `userId` de la URL
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("userId");

  // Pendiente de conectar con el backend (reservas por día del usuario y de todos los usuarios).
  const [reservations, setReservations] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [createReservation, setCreateReservation] = useState(null);
  const [newReservation, setNewReservation] = useState(null);
  const [minimDate, setMinimDate] = useState(null)

  const [selectedDate, setSelectedDate] = useState(null);
  const [allreservations, setallreservations] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const setMinDate = new Date();
    setMinDate.setDate(setMinDate.getDate() + 1);
    setMinimDate(setMinDate);
  }, [userId]);

  // Función para eliminar una reserva.
  // Pendiente de backend: de momento no se borra nada.
  const deleteReservation = async () => {
    setConfirmDeleteId(null);
  };


  // Pendiente de backend: de momento no se crea nada.
  const saveReservation = async (date) => {
    if (!date) return;
    setCreateReservation(null);
  };



  return (

    <div>
      {Header(Paths.INDEX, "Días reservados")}

      {/* Lista de reservas */}
      <div style={{ paddingTop: "120px" }}>
        {reservations.length === 0 ? (
          <p className="text-secondary text-center">No hay reservas todavía.</p>
        ) : (
          <div className="w-100 d-grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {reservations.map((reservation) => {
              const reservationDate = reservation.reservationDate ? new Date(reservation.reservationDate) : null;
              const flagPastDate = new Date();
              const isPastDate = reservationDate && reservationDate <= flagPastDate;

              const formattedDate = reservationDate
                ? format(reservationDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
                  .toLowerCase()
                  .replace(/^\w/, (char) => char.toUpperCase())
                : "Fecha desconocida";

              return (
                <div
                  className={`card shadow-sm p-3 d-flex flex-row align-items-center justify-content-between ${isPastDate ? 'opacity-50 pointer-events-none' : ''}`}
                  key={reservation.id}
                >
                  <div
                    className="cursor-pointer flex-grow-1"
                    onClick={!isPastDate ? () => navigate(`${Paths.DAY_USER_SELECTION}?reservationId=${reservation.id}&userId=${userId}`) : undefined}
                  >
                    <h5 className="card-title text-dark">{formattedDate}</h5>
                  </div>

                  {/* Botón de eliminar */}
                  {!isPastDate ? (<button
                    className="btn btn-sm"
                    onClick={() => setConfirmDeleteId(reservation.id)}
                    disabled={isPastDate}
                  >
                    🗑️
                  </button>) : (<></>)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón para agregar nueva reserva */}
      <div className="mt-1 text-center">
        <button className="btn btn-dark rounded-circle shadow" style={{ width: "60px", height: "60px", fontSize: "28px" }} onClick={() => setCreateReservation(true)}>
          +
        </button>
      </div>

      {/* Modal de confirmación de eliminación */}
      {confirmDeleteId && (
        <div className="modal d-block" style={{ background: "rgba(0, 0, 0, 0.5)", marginTop: "66px" }}>
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
        <div className="modal d-block" style={{ background: "rgba(0, 0, 0, 0.5)", marginTop: "66px" }}>
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
                  excludeDates={allreservations}
                  minDate={minimDate}

                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setCreateReservation(null)}>
                  Cancelar
                </button>
                <button className="btn btn-dark" onClick={() => saveReservation(selectedDate)}>
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
