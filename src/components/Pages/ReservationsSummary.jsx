import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Paths } from "../../utils/paths";
import { allMenus, allPrices, allShifts } from "../../utils/firebaseUtils";
import Header from "../Header";

export default function ReservationsSummary() {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const [summary, setSummary] = useState([]);
    const [menus, setMenus] = useState([]);
    const [prices, setPrices] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);

    useEffect(() => {
        const fetchSummary = async () => {
            // Obtener todas las reservas
            const reservationsSnapshot = await getDocs(collection(db, "reservations"));
            const reservations = reservationsSnapshot.docs.map(doc => doc.data());

            // Obtener todos los turnos
            const shiftsSnapshot = await getDocs(collection(db, "shifts"));
            const shiftsData = {};
            shiftsSnapshot.docs.forEach(doc => {
                shiftsData[doc.id] = { id: doc.id, name: doc.data().name, order: doc.data().order ?? 999 };
            });

            // Cargar precios
            const pricesData = await allPrices();
            setPrices(pricesData);

            // Cargar menus
            const menusData = await allMenus();
            setMenus(menusData);

            // Procesar la información agrupando por turno
            const shiftSummary = {};
            for (const reservation of reservations) {
                const { shiftId, guests, kids, userId, mainPlates, menus } = reservation;
                if (!shiftSummary[shiftId]) {
                    shiftSummary[shiftId] = {
                        name: shiftsData[shiftId]?.name || "Turno desconocido",
                        order: shiftsData[shiftId]?.order ?? 999,
                        adults: 0,
                        kids: 0,
                        guests: 0,
                        menus: 0,
                        shiftId
                    };
                }
                shiftSummary[shiftId].adults += (guests || 0);
                shiftSummary[shiftId].kids += kids || 0;
                shiftSummary[shiftId].guests += (guests || 0);
                shiftSummary[shiftId].menus += (menus || 0);
                if (!!reservation.mainPlates && reservation.mainPlates.length > 0)
                    reservation.mainPlates.forEach(plate => {
                        if (!shiftSummary[shiftId].mainPlates) shiftSummary[shiftId].mainPlates = {};
                        if (!shiftSummary[shiftId].mainPlates[plate]) shiftSummary[shiftId].mainPlates[plate] = 0;
                        shiftSummary[shiftId].mainPlates[plate] += 1
                    });
            }

            // Convertir a array y ordenar por orden de turno
            const sortedSummary = Object.values(shiftSummary).sort((a, b) => a.order - b.order);
            setSummary(sortedSummary);
        };

        fetchSummary();
    }, []);

    return (
        <div>
            {Header(Paths.INDEX, "Mesas M&C")}
            {summary.length === 0 ? (
                <p style={{ paddingTop: "95px" }} className="text-secondary text-center">No hay reservas...</p>
            ) : (
                <div>
                    <p style={{ paddingTop: "95px", paddingBottom: "0px", marginBottom:"-4em"}} className="text-secondary">
                        Total: {summary.reduce((total, item) => {
                            // 1. Encontrar el menú por shiftId
                            const menu = menus.find(m => m.shiftId === item.shiftId);
                            if (!menu || !menu.priceId) return total;

                            // 2. Encontrar el precio por priceId
                            const price = prices.find(p => p.id === menu.priceId);
                            if (!price || !price.amount) return total;

                            // 3. Sumar
                            return total + (price.amount * item.menus||0);
                        }, 0)||0}€
                        </p>
                    <div className="w-100 d-grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", paddingTop: "95px", paddingBottom: "20px" }}>
                        {summary.map(({ name, adults, kids, shiftId, mainPlates, menus }, index) => (
                            <div className="card shadow-sm p-3">
                                <div className="d-flex flex-row align-items-center justify-content-between" key={index}>
                                    <div className="cursor-pointer flex-grow-1" >
                                        <h5 className="card-title text-dark">{name}</h5>
                                        <p className="card-text">
                                                    {`👥 ${adults || 0} `}
                                                    {!!menus && `| 🍽️ ${menus || 0} `}
                                                    {!!kids && `| 🧒 ${kids || 0}`}
                                                </p>
                                    </div>

                                    <button className="btn btn-sm" onClick={() => navigate(`${Paths.TABLE_RESERVATIONS_DETAIL}?shiftId=${shiftId}`)}>
                                        🔎
                                    </button>
                                </div>
                                {!!mainPlates ? (
                                    <div className="card-footer text-center mt-4">
                                    {Object.keys(mainPlates || {}).map((key) => (
                                        <div className="d-flex flex-row justify-content-between mb-0 mt-0">
                                            <div className="card-text text-muted">{key}</div><div className="card-text">{mainPlates[key]}</div>
                                        </div>
                                    ))}
                                </div>
                                ) : (<></>)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

}
