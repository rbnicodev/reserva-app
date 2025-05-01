import { useNavigate } from "react-router-dom";
import { Paths } from "../../utils/paths";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect } from "react";
import Header from "../Header";


export default function Index() {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);
    return (
        <div className="text-center d-flex flex-column justify-content-around" style={{ paddingBottom: "1em" }}>
            {Header(null, "INICIO")}
            <div style={{ paddingTop: "95px", width: "auto", paddingBottom: "1em" }}>
                <div className="card shadow-sm p-3 d-flex flex-column justify-content-around" >
                    <button type="button" className="btn btn-light py-4 my-2" onClick={() => navigate(Paths.BULLETIN_BOARD)}>Tablón</button>
                    <button type="button" className="btn btn-light py-4 my-2" onClick={() => navigate(Paths.DAY_USER_SELECTION)}>Reservar día</button>
                    <button type="button" className="btn btn-light py-4 my-2" onClick={() => navigate(Paths.RESERVATION_CALENDAR)}>Calendario reservas</button>
                    <button type="button" className="btn btn-light py-4 my-2" onClick={() => navigate(Paths.TABLE_USER_SELECTION)}>Reservar Mesa M&C</button>
                    <button type="button" className="btn btn-light py-4 my-2" onClick={() => navigate(Paths.TABLE_RESERVATIONS_SUMMARY)}>Resumen Mesas M&C</button>
                    <button type="button" className="btn btn-light py-4 my-2" onClick={() => navigate(Paths.PAYMENTS_ACCESS)}>Pagos</button>
                </div>

            </div>

        </div>
    )
}