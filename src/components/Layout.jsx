import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaBars } from 'react-icons/fa'; // Icono de FontAwesome
import UserSelection from "./UserSelection";
import UserSelectionDay from "./UserSelectionDay";
import { useNavigate } from "react-router-dom";
import { Paths } from "../utils/paths";

export default function Layout({ children }) {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    // Función para alternar la visibilidad del sidebar
    const toggleSidebar = () => {
        setShow(prevShow => !prevShow); // Usar la función de actualización basada en el valor anterior del estado
    };

    return (

        <div className="d-flex flex-column vh-100">
            {/* Navbar */}
            <nav className="navbar navbar-dark bg-dark px-3">
                <button
                    className="btn btn-outline-light"
                    onClick={toggleSidebar} // Función de toggle directamente
                    style={{ fontSize: "1.5rem" }}
                >
                    <FaBars />
                </button>
            </nav>

            {/* Sidebar Offcanvas */}
            <div
                className={`offcanvas offcanvas-start ${show ? "show" : ""}`}
                tabIndex="-1"
                style={{
                    width: "66vw", // Sidebar ocupa 2/3 de la pantalla
                    transform: show ? "translateX(0)" : "translateX(-100%)", // Deslizar el sidebar
                    transition: "transform 0.3s ease-in-out", // Transición suave
                    position: "fixed", // Sidebar se mantiene fijo
                    top: 0,
                    left: 0,
                    zIndex: 1050,
                }}
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Menú</h5>
                    <button type="button" className="btn-close" onClick={() => setShow(false)}></button>
                </div>
                <div className="offcanvas-body">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <button className="nav-link" onClick={() => {
                                setShow(false);
                                navigate(Paths.INDEX);
                            }}>Inicio</button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link" onClick={() => {
                                setShow(false);
                                navigate(Paths.DAY_USER_SELECTION);
                            }}>Reservas Cuartelillo</button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link" onClick={() => {
                                setShow(false);
                                alert("Not implemented...")
                                //navigate(Paths.DAY_USER_SELECTION);
                            }}>Calendario reservas</button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link" onClick={() => {
                                setShow(false);
                                navigate(Paths.TABLE_USER_SELECTION);
                            }}>Reservas Mesa M&C</button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link" onClick={() => {
                                setShow(false);
                                navigate(Paths.TABLE_RESERVATIONS_SUMMARY);
                            }}>Resumen Mesas M&C</button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Contenido principal */}
            <main className="flex-grow-1 p-3" style={{ paddingLeft: show ? "66vw" : "0" }}>
                {children}
            </main>
        </div>

    );
}
