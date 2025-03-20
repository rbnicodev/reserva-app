import { useNavigate } from "react-router-dom";
import { Paths } from "../../utils/paths";
import "bootstrap/dist/css/bootstrap.min.css";


export default function Index() {
    const navigate = useNavigate();
    return (
        <div className="text-center d-flex flex-column justify-content-around">
            <h1 className="mt-4">ALJAWAS</h1>
            <div className="card shadow-sm p-3 mt-4 d-flex flex-column justify-content-around" >
                <button type="button" className="btn btn-light py-4 my-2" onClick={() => navigate(Paths.DAY_USER_SELECTION)}>Reservar día</button>
                <button type="button" className="btn btn-light py-4 my-2" onClick={() => navigate(Paths.RESERVATION_CALENDAR)}>Calendario reservas</button>
                <button type="button" className="btn btn-light py-4 my-2" onClick={() => navigate(Paths.TABLE_USER_SELECTION)}>Reservar Mesa M&C</button>
                <button type="button" className="btn btn-light py-4 my-2" onClick={() => navigate(Paths.TABLE_RESERVATIONS_SUMMARY)}>Resumen Mesas M&C</button>
            </div>
            
        </div>
    )
}