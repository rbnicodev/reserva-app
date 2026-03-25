import { collection, getDocs, query, where } from "firebase/firestore";
import { registerLocale } from "react-datepicker";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { allMenus, allPrices, allShifts } from "../../utils/firebaseUtils";
import { Paths } from "../../utils/paths";
import { useEffect, useState } from "react";
import Header from "../Header";

export default function ReservationsDetail() {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const shiftId = searchParams.get("shiftId");

    const [reservations, setReservations] = useState([]);
    const [menus, setMenus] = useState([]);
    const [prices, setPrices] = useState([]);
    const [shift, setShift] = useState([]);
    const [users, setUsers] = useState([]);

    const countPlates = (elemento, array) => {
        return array.reduce((contador, actual) => actual === elemento ? contador + 1 : contador, 0);
    }

    useEffect(() => {
        if (!shiftId) return;

        const fetchData = async () => {
            const reservationsDocs = await getDocs(query(collection(db, "reservations"), where("shiftId", "==", shiftId)));
            setReservations(reservationsDocs.docs.map((doc) => (
                {
                    id: doc.id,
                    ...doc.data()
                })));

            // Cargar precios
            const pricesData = await allPrices();
            setPrices(pricesData);

            // Cargar menus
            const menusData = await allMenus();
            setMenus(menusData);

            // Cargar shift
            const shiftsData = await allShifts();
            setShift(shiftsData.find(s => s.id === shiftId));

            // Cargar usuarios
            const usersCollection = collection(db, "users");
            const userDocs = await getDocs(usersCollection);
            setUsers(userDocs.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name ?? "Sin nombre"
            })));
        }

        fetchData();
    }, [shiftId]);
    return (
        <div >

            {Header(Paths.TABLE_RESERVATIONS_SUMMARY, (shift?.name ?? ""))}
            <div style={{ width: "auto", paddingTop: "95px", paddingBottom: "20px" }}>
                {reservations && reservations.length > 0 && (
                    <p className="text-secondary">
                        Total: {reservations.reduce((acc, reservation) => {
                            const menu = menus.find(m => m.shiftId === shiftId);
                            const price = prices.find(p => p.id === menu?.priceId);
                            return acc + (price?.amount || 0) * reservation.guests;
                        }, 0)}
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
                                    <div className=" d-flex flex-row align-items-center justify-content-between" key={reservation.id}>
                                        <div className="cursor-pointer flex-grow-1">
                                            <h5 className="card-title text-dark">{users.find(u => u.id === reservation.userId)?.name || "Desconocido"}</h5>
                                            <p className="card-text">
                                                {`👥 ${reservation.guests || 0} `}
                                                {!!reservation.menus && `| 🍽️ ${reservation.menus || 0} `}
                                                {!!reservation.kids && `| 🧒 ${reservation.kids || 0}`}
                                            </p>
                                        </div>
                                        <p className="card-text text-secondary">
                                            {prices.find(p => p.id === menus.find(m => m.shiftId === shiftId)?.priceId)?.amount * (reservation.menus||0)}€
                                        </p>
                                    </div>

                                    {!!reservation.mainPlates && reservation.mainPlates.length > 0 ? (
                                        <div className="card-footer text-center mt-4">
                                            {!!reservation.mainPlates ? [...new Set(reservation.mainPlates)].map(p => (
                                                <div className="d-flex flex-row justify-content-between mb-0 mt-0">
                                                    <div className="card-text text-muted">{p}</div><div className=" card-text">{countPlates(p, reservation.mainPlates)}</div>
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
            </div>
        </div>
    );
}