import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../firebase";
import { collection, doc, getDoc, getDocs, setDoc, addDoc, query, where } from "firebase/firestore";
import { allMenus, allShifts, restReservations } from "../../utils/firebaseUtils";
import { Paths } from "../../utils/paths";
import Header from ".././Header";

export default function ReservationForm() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("userId");
  const reservationId = searchParams.get("reservationId");

  const [reservation, setReservation] = useState({});

  const [availableShifts, setAvailableShifts] = useState([]);
  const [currentShiftName, setCurrentShiftName] = useState("");

  // Estado para controlar el cuadro de diálogo
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [originalGuests, setOriginalGuests] = useState(0);
  const [menus, setMenus] = useState([]);
  const [menu, setMenu] = useState({});

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const tempMenus = await allMenus();
        setMenus(tempMenus);
        const reservationsQuery = query(collection(db, "reservations"), where("userId", "==", userId));
        const reservationsSnapshot = await getDocs(reservationsQuery);
        const reservedShifts = new Set(reservationsSnapshot.docs.map((doc) => doc.data().shiftId));

        const shiftsSnapshot = await getDocs(collection(db, "shifts"));
        const allShifts = await Promise.all(
          shiftsSnapshot.docs.map(async (doc) => {
            const shiftId = doc.id;
            let remainingSeats = (await restReservations(shiftId)) ?? 0; // Manejo de error
            if (reservationId) remainingSeats += reservation.guests;
            return {
              id: shiftId,
              name: doc.data().name,
              order: doc.data().order ?? 9999,
              remainingSeats,
            };
          })
        );

        if (reservationId) {
          setIsEdit(true);
          const docRef = doc(db, "reservations", reservationId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const reservationData = docSnap.data();
            setReservation(reservationData);
            const tempMenu = tempMenus?.find(m => m.shiftId === reservationData.shiftId);
            setMenu(tempMenu);
            setOriginalGuests(reservationData.guests || 0);

            const shift = allShifts.find((s) => s.id === reservationData.shiftId);
            if (shift) {
              setCurrentShiftName(shift.name);
            }

            // 🔥 Asegurar que shiftId no sea vacío
            if (!reservationData.shiftId && shift) {
              setReservation((prev) => ({ ...prev, shiftId: shift.id }));
            }
          }
        } else {
          setReservation({
            guests: 1,
            kids: 0,
            shiftId: "",
            userId: userId || "",
          });
        }

        setAvailableShifts(allShifts.filter((shift) => !reservedShifts.has(shift.id)).sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [userId, reservationId]);

  const saveReservation = async () => {
    if (!userId) {
      console.error("Sin userId");
      return;
    }
    if (!reservation.shiftId) {
      console.error("Sin shiftId");
      setErrorMessage("Debe indicarse un turno");
      setErrorDialogOpen(true);
      return;
    }

    const shifts = await allShifts();
    const selectedShift = shifts?.find((shift) => shift.id === reservation.shiftId);
    if (!selectedShift) {
      console.error("Sin shift seleccionado");
      return;
    };

    let remainingSeats = await restReservations(reservation.shiftId);
    if (isEdit) remainingSeats += (originalGuests || 0);

    const totalPeople = reservation.guests;

    if (isNaN(reservation.guests) || reservation.guests < 1) {
      setErrorMessage("Debe indicarse al menos una persona");
      setErrorDialogOpen(true);
      return;
    }
    if (reservation.guests > remainingSeats) {
      setErrorMessage("No hay suficientes plazas disponibles para esta reserva. Quedan " + remainingSeats + " plazas");
      setErrorDialogOpen(true);
      return;
    }

    try {
      if (reservationId) {
        await setDoc(doc(db, "reservations", reservationId), reservation);
      } else {
        await addDoc(collection(db, "reservations"), reservation);
      }
      navigate(`${Paths.TABLE_RESERVATION}?userId=${userId}`);
    } catch (error) {
      console.error("Error al guardar la reserva:", error);
      setErrorMessage("Hubo un error al guardar la reserva. Inténtalo de nuevo.");
      setErrorDialogOpen(true);
    }
  };

  return (
    <div className="w-100 d-flex flex-column align-items-center">

      {Header(`${Paths.TABLE_RESERVATION}?userId=${userId}`, reservationId ? "Editar Reserva" : "Nueva Reserva")}
      {/* Botón de volver */}

      <div style={{ paddingTop: "95px", paddingBottom: "20px", width: "90vw" }}>
        {!!reservation && reservation.userId ?
          <div className="w-100">
            <div className="mb-3">
              <label className="form-label"><strong>Adultos</strong></label>
              <input
                type="number"
                className="form-control"
                value={reservation.guests === null ? "" : reservation.guests} // Permite temporalmente vacío
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || isNaN(value)) {
                    setReservation({ ...reservation, guests: null }); // Permitir vacío temporalmente
                  } else {
                    setReservation({ ...reservation, guests: Number(value) });
                  }
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  setReservation({ ...reservation, guests: isNaN(value) || value < 1 ? 1 : value });
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label"><strong>Niños</strong></label>
              <input
                type="number"
                className="form-control"
                value={reservation.kids === null ? "" : reservation.kids}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || isNaN(value)) {
                    setReservation({ ...reservation, kids: null });
                  } else {
                    setReservation({ ...reservation, kids: Number(value) });
                  }
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  setReservation({ ...reservation, kids: isNaN(value) || value < 0 ? 0 : value });
                }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label"><strong>Turno</strong></label>
              {reservationId ? (
                <p className="form-control-plaintext">{currentShiftName || "Turno no encontrado"}</p>
              ) : (
                <select className="form-select" value={reservation.shiftId} onChange={(e) => {
                  setReservation({ ...reservation, shiftId: e.target.value });
                  setMenu(menus?.find(m => m.shiftId === e.target.value));
                }}>
                  <option value="">Selecciona un turno</option>
                  {availableShifts.map((shift) => (
                    <option key={shift.id} value={shift.id} disabled={shift.remainingSeats <= 0}>
                      {shift.name} {shift.remainingSeats <= 0 ? "(Sin plazas)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button className="btn btn-primary w-100" onClick={saveReservation}>
              Guardar
            </button>

            {!!menu && !!menu.incomings && !!menu.mainPlate && !!menu.dessert ? (
              <div className="card shadow-sm p-3 mt-3" >
                <div className="card-title text-secondary">
                  <h5><strong>Menú</strong></h5>
                </div>
                <div className="mb-1 card-text">
                  <label className="form-label text-secondary mb-1"><strong>Entrantes</strong></label>
                  <p className="form-control-plaintext text-secondary mt-0">{menu.incomings.join(", ")}</p>
                </div>

                <div className="mb-1 card-text">
                  <label className="form-label text-secondary mb-1"><strong>Plato principal</strong></label>
                  <p className="form-control-plaintext text-secondary mt-0">{menu.mainPlate}</p>
                </div>

                <div className="mb-1 card-text">
                  <label className="form-label text-secondary mb-1"><strong>Postre</strong></label>
                  <p className="form-control-plaintext text-secondary mt-0">{menu.dessert}</p>
                </div>
              </div>
            ) : (<div></div>)}
          </div>
          : <p className="text-secondary text-center" style={{ paddingTop: "70px" }}>Cargando datos...</p>
        }
      </div>

      {/* Modal de error */}
      {errorDialogOpen && (
        <div className="modal d-block" style={{ background: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Error</h5>
                <button type="button" className="btn-close" onClick={() => setErrorDialogOpen(false)}></button>
              </div>
              <div className="modal-body">
                <p>{errorMessage}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setErrorDialogOpen(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
