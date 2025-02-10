import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

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
                shiftSummary[shiftId].adults += (guests || 0) + 1; // +1 porque el usuario también cuenta
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
        <div className="container d-flex flex-column align-items-center py-4" style={{ minHeight: "100vh" }}>
            {/* Botón de volver */}
            <button className="btn btn-link position-absolute top-0 start-0 mt-3 ms-3" onClick={() => navigate('/')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708.708L2.707 7.5H14.5a.5.5 0 0 1 .5.5" />
                </svg>
            </button>

            <h1 className="text-center mb-4">Resumen</h1>

            {summary.length === 0 ? (
                <p className="text-secondary text-center">Cargando datos...</p>
            ) : (
                <div className="w-100 d-grid gap-3" style={{ maxWidth: "600px" }}>
                    {summary.map(({ name, adults, kids, guests }, index) => (
                        <div key={index} className="card shadow-sm p-3 d-flex flex-row align-items-center justify-content-between">
                            <strong className="text-primary">{name}</strong>
                            <span>👨‍👩‍👧‍👦 {adults} adultos ({guests} invitados) | 🧒 {kids} niños</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}
