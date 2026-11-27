import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paths } from "../../utils/paths";
import Header from "../Header";
import type { PayUser } from "../../models/User";

type Props = {
    setPayUser: React.Dispatch<React.SetStateAction<PayUser | null>>;
}

export default function PayUserAccess({setPayUser}: Props) {
    window.scrollTo(0, 0);
    // Pendiente de backend: la lista de usuarios de pago llegará desde la API.
    const [users] = useState<PayUser[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div>
            {Header(Paths.INDEX, "Acceso a Pagos")}
            <div style={{ paddingTop: "120px", paddingBottom: "20px" }}>
                <div className="card shadow-sm d-flex flex-column justify-content-between" style={{ minHeight: "30vh" }}>
                    <div className="text-center px-3 mt-3">
                        <h5 className="mb-4">Elige un usuario de pago:</h5>
                        <p className="text-secondary">
                            {users.length === 0 ? "No hay usuarios de pago disponibles." : ""}
                        </p>
                    </div>

                    <div className="px-3 mt-4 mb-4">
                        <button
                            className="btn btn-secondary w-100"
                            onClick={() => navigate(Paths.INDEX)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
