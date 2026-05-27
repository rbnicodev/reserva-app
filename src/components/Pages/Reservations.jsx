import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Paths } from "../../utils/paths";
import { allPrices, allMenus, userReservations, fetchGlobalSettings } from "../../utils/firebaseUtils";
import Header from "../Header";

export default function Reservations() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const location = useLocation();

  // Obtener `userId` de la URL
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("userId");

  const [reservations, setReservations] = useState([]);
  const [shifts, setShifts] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [menus, setMenus] = useState([]);
  const [prices, setPrices] = useState([]);
  const [limitDelete, setLimitDelete] = useState(null);
  const countPlates = (elemento, array) => {
    return array.reduce((contador, actual) => actual === elemento ? contador + 1 : contador, 0);
  }

  const allowDelete = () => {
    return !limitDelete || (new Date()).getTime() < limitDelete.getTime();
  }

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

      // Cargar precios
      const pricesData = await allPrices();
      setPrices(pricesData);

      // Cargar menus
      const menusData = await allMenus();
      setMenus(menusData);

      const constants = await fetchGlobalSettings();
      setLimitDelete(constants.limit_delete);


      // Cargar reservas del usuario
      // Guardamos las reservas ordenadas por `shift.order`
      const sortedReservations = (await userReservations(userId)).sort((a, b) => (shiftsData[a.shiftId]?.order ?? 0) - (shiftsData[b.shiftId]?.order ?? 0));

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
    <div >

      {Header(Paths.INDEX, "Tus Reservas")}
      <div style={{ width: "auto", paddingTop: "120px", paddingBottom: "40px" }}>
        {reservations && reservations.length > 0 && (
          <p className="text-secondary">
            Total: {reservations.reduce((acc, reservation) => {
              const menu = menus.find(m => m.shiftId === reservation.shiftId);
              const price = prices.find(p => p.id === menu?.priceId);
              return acc + (price?.amount || 0) * reservation.menus ||0;
            }, 0).toFixed(2)}
            €
          </p>
        )}


        {/* Lista de reservas */}
        <div className="w-100 d-flex flex-column align-items-center">
          {reservations.length === 0 ? (
            <p className="text-secondary text-center">No hay reservas todavía.</p>
          ) : (
            <div className="w-100 d-grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
              {reservations.map((reservation) => (
                <div className="card shadow-sm p-3">
                  <div className="d-flex flex-row align-items-center justify-content-between" key={reservation.id}>
                    <div className="cursor-pointer flex-grow-1" onClick={() => {
                      if (!shifts[reservation.shiftId]?.limit_edit || (new Date()).getTime() < shifts[reservation.shiftId]?.limit_edit.toDate().getTime())
                        navigate(`${Paths.TABLE_RESERVATION_FORM}?reservationId=${reservation.id}&userId=${userId}`);
                    }}>
                      <h5 className="card-title text-dark">{shifts[reservation.shiftId]?.name || "Turno desconocido"}</h5>
                      <p className="card-text">
                          {`🪑 ${reservation.guests || 0} `}
                          {!!reservation.menus && `| 🍽️ ${reservation.menus || 0} `}
                          {!!reservation.kids && `| 🧒 ${reservation.kids || 0}`}
                      </p>                      <p className="card-text text-secondary">
                        {(() => {
                            // 1. Buscamos el menú asociado al turno de la reserva
                            const menuAsociado = menus.find(m => m.shiftId === reservation.shiftId);
                            
                            // 2. Buscamos el precio de ese menú
                            const precioAsociado = menuAsociado ? prices.find(p => p.id === menuAsociado.priceId) : null;
                            
                            // 3. Si encontramos el precio, calculamos el total; si no, el total es 0
                            const total = precioAsociado ? (precioAsociado.amount * reservation.menus) : 0;

                            // 4. Pintamos el resultado siempre con dos decimales
                            return `${total.toFixed(2)}€`;
                          })()}
                      </p>
                    </div>

                    {/* Botón de eliminar */}
                    <button className={`btn btn-sm ${allowDelete() ? '' : 'd-none'}`} onClick={() => setConfirmDeleteId(reservation.id)}>
                      🗑️
                    </button>

                  </div>
                  {!!reservation.mainPlates && reservation.mainPlates.length > 0 ? (
                    <div className="card-footer text-center mt-4">
                      {!!reservation.mainPlates ? [...new Set(reservation.mainPlates)].map(p => (
                        <div className="d-flex flex-row justify-content-between mb-0 mt-0">
                          <div className="text-muted">{p}</div><div className="text-muted">{countPlates(p, reservation.mainPlates)}</div>
                        </div>
                      )) : <></>
                      }
                    </div>
                  ) : <></>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón para agregar nueva reserva */}
        <div className={`mt-1 mb-4 text-center`}>
          <button className="btn btn-dark rounded-circle shadow mb-4" style={{ width: "60px", height: "60px", fontSize: "28px" }} onClick={() => navigate(`${Paths.TABLE_RESERVATION_FORM}?userId=${userId}`)}>
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
      </div>
    </div>
  );
}
