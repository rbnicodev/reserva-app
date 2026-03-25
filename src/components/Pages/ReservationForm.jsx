import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../firebase";
import { collection, doc, getDoc, getDocs, setDoc, addDoc, query, where } from "firebase/firestore";
import { allMenus, allShifts, fetchGlobalSettings, restReservations } from "../../utils/firebaseUtils";
import { Paths } from "../../utils/paths";
import Header from ".././Header";

export default function ReservationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("userId");
  const reservationId = searchParams.get("reservationId");

  const [reservation, setReservation] = useState({});
  const [availableShifts, setAvailableShifts] = useState([]);
  const [currentShiftName, setCurrentShiftName] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [originalGuests, setOriginalGuests] = useState(0);
  const [menus, setMenus] = useState([]);
  const [menu, setMenu] = useState({});
  const [mainPlatesSelection, setMainPlatesSelection] = useState([]);
  const [limitDelete, setLimitDelete] = useState(null);

  const totalSelectedPlates = mainPlatesSelection.reduce((a, b) => a + b, 0);

  const updatePlateCount = (index, delta) => {
    setMainPlatesSelection((prev) => {
      const newCounts = [...prev];
      const newTotal = newCounts.reduce((sum, val, i) => sum + (i === index ? val + delta : val), 0);
      if (newTotal >= 0 && newTotal <= (reservation.guests || 0)) {
        newCounts[index] = Math.max(0, newCounts[index] + delta);
      }
      return newCounts;
    });
  };

  const allowRest = () => {
    return !limitDelete || limitDelete.getTime() > (new Date()).getTime();
  }

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const tempMenus = await allMenus();
        setMenus(tempMenus);

        let reservationData = null;
        if (reservationId) {
          const docSnap = await getDoc(doc(db, "reservations", reservationId));
          if (docSnap.exists()) {
            reservationData = docSnap.data();
            setIsEdit(true);
            setReservation(reservationData);
            setOriginalGuests(reservationData.menus || 0);

            const menuForShift = tempMenus?.find(m => m.shiftId === reservationData.shiftId);
            if (menuForShift) setMenu(menuForShift);
          }
        } else {
          reservationData = {
            guests: 1,
            menus: 0,
            kids: 0,
            shiftId: "",
            userId: userId || "",
          };
          setReservation(reservationData);
        }

        const reservationsQuery = query(collection(db, "reservations"), where("userId", "==", userId));
        const reservationsSnapshot = await getDocs(reservationsQuery);
        const reservedShifts = new Set(reservationsSnapshot.docs.map((doc) => doc.data().shiftId));

        const shiftsSnapshot = await getDocs(collection(db, "shifts"));
        const shifts = await Promise.all(
          shiftsSnapshot.docs.map(async (doc) => {
            const shiftId = doc.id;
            let remainingSeats = (await restReservations(shiftId)) ?? 0;
            if (reservationId && reservationData?.shiftId === shiftId) {
              remainingSeats += reservationData.guests;
            }
            return {
              id: shiftId,
              name: doc.data().name,
              order: doc.data().order ?? 9999,
              remainingSeats,
            };
          })
        );

        setAvailableShifts(
          shifts.filter((shift) => !reservedShifts.has(shift.id) || (reservationData?.shiftId === shift.id))
            .sort((a, b) => a.order - b.order)
        );

        if (reservationId && reservationData) {
          const shift = shifts.find((s) => s.id === reservationData.shiftId);
          if (shift) setCurrentShiftName(shift.name);
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }

      const limitDelete = (await fetchGlobalSettings()).limit_delete;
      setLimitDelete(limitDelete);
    };

    fetchData();
  }, [userId, reservationId]);

  useEffect(() => {
    if (menu?.mainPlate && menu.mainPlate.includes("|")) {
      const options = menu.mainPlate.split("|").map(p => p.trim());
      const counts = Array(options.length).fill(0);

      if (reservation.mainPlates && Array.isArray(reservation.mainPlates)) {
        reservation.mainPlates.forEach((p) => {
          const idx = options.indexOf(p);
          if (idx >= 0) counts[idx]++;
        });
      }

      setMainPlatesSelection(counts);
    } else {
      setMainPlatesSelection([]);
    }
  }, [menu, reservation.mainPlates]);

  const saveReservation = async () => {
    if (!userId) {
      console.error("Sin userId");
      return;
    }
    if (!reservation.shiftId) {
      setErrorMessage("Debe indicarse un turno");
      setErrorDialogOpen(true);
      return;
    }

    if(reservation.menus > reservation.guests) {
      setErrorMessage("El número de adultos no puede ser menor que el número de menús");
      setErrorDialogOpen(true);
      return;
    }
    
    if (!allowRest() && originalGuests > reservation.menus) {
      setErrorMessage("¡Ya no es posible eliminar menús!");
      setErrorDialogOpen(true);
      return;
    }

    if (reservation.guests+reservation.menus < 1) {
      setErrorMessage("¡La reserva está vacía!");
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

    if (reservation.guests > remainingSeats) {
      setErrorMessage(`No hay suficientes plazas disponibles. Quedan ${remainingSeats}`);
      setErrorDialogOpen(true);
      return;
    }

    try {
      if (mainPlatesSelection.length > 0 && menu.mainPlate.includes("|")) {
        const options = menu.mainPlate.split("|").map(p => p.trim());
        reservation.mainPlates = [];
        mainPlatesSelection.forEach((count, idx) => {
          for (let i = 0; i < count; i++) {
            reservation.mainPlates.push(options[idx]);
          }
        });
        
        
        if (reservation.mainPlates.length < reservation.menus) {
          setErrorMessage("Deben indicarse los platos principales");
          setErrorDialogOpen(true);
          return;
        }
      }

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
                  setReservation({ ...reservation, guests: isNaN(value) || value < 0 ? 0 : value });
                }}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label"><strong>Menús de adulto</strong></label>
              <input
                type="number"
                className="form-control"
                value={reservation.menus === null ? "" : reservation.menus} // Permite temporalmente vacío
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || isNaN(value)) {
                    setReservation({ ...reservation, menus: null }); // Permitir vacío temporalmente
                  } else {
                    setReservation({ ...reservation, menus: Number(value) });
                  }
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  setReservation({ ...reservation, menus: isNaN(value) || value < 0 ? 0 : value });
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


            {menu?.mainPlate?.includes("|") && mainPlatesSelection.length > 0 && (
              <div className="card shadow-sm p-3 mt-0 mb-3">
                <div className="card-title text-secondary">
                  <h5><strong>Selecciona los platos principales</strong></h5>
                  <p className="text-secondary">Platos seleccionados: {totalSelectedPlates} / {reservation.menus}</p>
                </div>
                {menu.mainPlate.split("|").map((plate, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{plate.trim()}</span>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => updatePlateCount(index, -1)}>-</button>
                      <span className="mx-2">{mainPlatesSelection[index]}</span>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => updatePlateCount(index, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
