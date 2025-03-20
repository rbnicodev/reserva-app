import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Paths } from "../../utils/paths";
import Header from "../Header";

export default function ReservationsSummary() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState([]);

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

            // Procesar la información agrupando por turno
            const shiftSummary = {};
            for (const reservation of reservations) {
                const { shiftId, guests, kids, userId } = reservation;
                if (!shiftSummary[shiftId]) {
                    shiftSummary[shiftId] = {
                        name: shiftsData[shiftId]?.name || "Turno desconocido",
                        order: shiftsData[shiftId]?.order ?? 999,
                        adults: 0,
                        kids: 0,
                        guests: 0,
                    };
                }
                shiftSummary[shiftId].adults += (guests || 0);
                shiftSummary[shiftId].kids += kids || 0;
                shiftSummary[shiftId].guests += (guests || 0);
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
                <p style={{paddingTop:"90px"}} className="text-secondary text-center">Cargando datos...</p>
            ) : (
                <div className="w-100 d-grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", paddingTop:"90px", paddingBottom:"20px" }}>
                    {summary.map(({ name, adults, kids }, index) => (
                        <div className="card shadow-sm p-3 d-flex flex-row align-items-center justify-content-between" key={index}>
                            <div className="cursor-pointer flex-grow-1" >
                                <h5 className="card-title text-primary">{name}</h5>
                                <p className="card-text">👥 {adults} Adulto{adults > 1 ? "s" : ""} | 🧒 {kids} Niño{kids !== 1 ? "s" : ""}</p>
                            </div>

                            <button className="btn btn-sm" onClick={() => alert("Detail: NOT IMPLEMENTED")}>
                                🔎
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}
