import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paths } from "../../utils/paths";
import Header from "../Header";

export default function ReservationsSummary() {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);
    // Pendiente de conectar con el backend (reservas, turnos, menús y precios).
    const [summary] = useState([]);
    const [menus] = useState([]);
    const [prices] = useState([]);


    return (
        <div>
            {Header(Paths.INDEX, "Mesas M&C")}
            {summary.length === 0 ? (
                <p style={{ paddingTop: "120px" }} className="text-secondary text-center">No hay reservas...</p>
            ) : (
                <div>
                    <p style={{ paddingTop: "120px", paddingBottom: "0px", marginBottom:"-4em"}} className="text-secondary">
                        Total: {summary.reduce((total, item) => {
                            // 1. Encontrar el menú por shiftId
                            const menu = menus.find(m => m.shiftId === item.shiftId);
                            if (!menu || !menu.priceId) return total;

                            // 2. Encontrar el precio por priceId
                            const price = prices.find(p => p.id === menu.priceId);
                            if (!price || !price.amount) return total;

                            // 3. Sumar
                            return (total + (price.amount * item.menus||0));
                        }, 0).toFixed(2)||(0).toFixed(2)}€
                        </p>
                    <div className="w-100 d-grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", paddingTop: "90px", paddingBottom: "20px" }}>
                        {summary.map(({ name, adults, kids, shiftId, mainPlates, menus }, index) => (
                            <div className="card shadow-sm p-3">
                                <div className="d-flex flex-row align-items-center justify-content-between" key={index}>
                                    <div className="cursor-pointer flex-grow-1" >
                                        <h5 className="card-title text-dark">{name}</h5>
                                        <p className="card-text">
                                                    {`🪑 ${adults || 0} `}
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
