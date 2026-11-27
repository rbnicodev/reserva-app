import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Paths } from "../../utils/paths";
import Header from ".././Header";

export default function ReservationForm() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("userId");
  const reservationId = searchParams.get("reservationId");

  const [reservation, setReservation] = useState({});
  const [availableShifts, setAvailableShifts] = useState([]);
  const [currentShiftName, setCurrentShiftName] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [menus, setMenus] = useState([]);
  const [menu, setMenu] = useState({});
  const [mainPlatesSelection, setMainPlatesSelection] = useState([]);

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

  useEffect(() => { window.scrollTo(0, 0); }, []);

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

  const saveReservation = () => {
    // Pendiente de backend: el guardado de reservas aún no está disponible.
    setErrorMessage("Guardar reservas no está disponible todavía.");
    setErrorDialogOpen(true);
  };

  return (
    <div className="w-100 d-flex flex-column align-items-center">

      {Header(`${Paths.TABLE_RESERVATION}?userId=${userId}`, reservationId ? "Editar Reserva" : "Nueva Reserva")}
      {/* Botón de volver */}

      <div style={{ paddingTop: "120px", paddingBottom: "20px", width: "90vw" }}>
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
