import { useNavigate } from "react-router-dom";
import { Paths } from "../../utils/paths";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import Header from "../Header";
import { fetchGlobalSettings } from "../../utils/firebaseUtils";

export default function Index() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const getSettings = async () => {
            try {
                const data = await fetchGlobalSettings();
                setSettings(data);
            } catch (error) {
                console.error("Error recuperando settings:", error);
            } finally {
                setLoading(false);
            }
        };
        getSettings();
    }, []);

    // IMPORTANTE: El Header se ejecuta AQUÍ, fuera de cualquier IF,
    // para que React siempre vea los mismos Hooks en cada render.
    const headerComponent = Header(null, "INICIO");

    return (
        <div className="text-center d-flex flex-column justify-content-around" style={{ paddingBottom: "1em" }}>
            {headerComponent}
            
            <div style={{ paddingTop: "95px", width: "auto", paddingBottom: "1em", paddingLeft: "5vw", paddingRight: "5vw" }}>
                {loading ? (
                    // Si está cargando, mostramos el spinner AQUÍ dentro del flujo normal
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                        <div className="spinner-border text-secondary" role="status"></div>
                    </div>
                ) : (
                    // Si no está cargando, mostramos la card con los botones
                    <div className="card shadow-sm p-3 d-flex flex-column justify-content-around border-0">
                        
                        <button type="button" className="btn btn-light py-4 my-2 border shadow-sm" onClick={() => navigate(Paths.DAY_USER_SELECTION)}>
                            Reservar día
                        </button>
                        <button type="button" className="btn btn-light py-4 my-2 border shadow-sm" onClick={() => navigate(Paths.RESERVATION_CALENDAR)}>
                            Calendario reservas
                        </button>

                        {/* Bloque condicional M&C */}
                        {settings?.mc_function_active && (
                            <>
                                <button type="button" className="btn btn-light py-4 my-2 border shadow-sm" onClick={() => navigate(Paths.BULLETIN_BOARD)}>
                                    Tablón
                                </button>
                                <button type="button" className="btn btn-light py-4 my-2 border shadow-sm" onClick={() => navigate(Paths.TABLE_USER_SELECTION)}>
                                    Reservar Mesa M&C
                                </button>
                                <button type="button" className="btn btn-light py-4 my-2 border shadow-sm" onClick={() => navigate(Paths.TABLE_RESERVATIONS_SUMMARY)}>
                                    Resumen Mesas M&C
                                </button>
                                <button type="button" className="btn btn-light py-4 my-2 border shadow-sm" onClick={() => navigate(Paths.MENUS)}>
                                    Menús de M&C
                                </button>
                            </>
                        )}

                        <button type="button" className="btn btn-light py-4 my-2 border shadow-sm" onClick={() => navigate(Paths.PAYMENTS_ACCESS)}>
                            Pagos
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}