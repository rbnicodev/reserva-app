import { useEffect, useState } from "react";
import BoardEntryComponent from "../BoardEntryComponent";
import type { BoardEntry } from "../../models/BoardEntry";
import Header from "../Header";
import { Paths } from "../../utils/paths";
import { useNavigate } from "react-router-dom";

export default function Board() {
    // Pendiente de conectar con el backend: de momento no hay entradas ni ajustes.
    const [entries] = useState<BoardEntry[]>([]);
    const [activateTopBoard] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (

        <div style={{ paddingBottom: "1em" }}>
            {Header(Paths.INDEX, "Tablón")}
            <div style={{ paddingTop: "120px", width: "auto" }}>



                {activateTopBoard ? (
                    <div className="mb-4">
                    <div className="card shadow-sm p-3 d-flex flex-row align-items-center">
                        <div className={`flex-grow-1 `}>
                            <h5 className="card-title text-dark mb-2 text-center">Programación de Moros</h5>
                            <h6 className="card-subtitle mb-2 text-muted text-center">2025</h6>
                            <div className="mb-0 w-100">
                                <img src="/docs/cartel.png" className="img-fluid" style={{ maxWidth: "500px;" }} alt="Imagen de /docs/" onClick={() => navigate(Paths.PROGRAMACION_MOROS)}/>
                            </div>
                            <p className="card-text text-center text-break text-muted">
                                Pulsa en el cartel para ver la programación
                            </p>
                        </div>
                    </div>
                </div>
                ): ``}


                
                {entries.length === 0 ? (
                    <p>No hay entradas disponibles.</p>
                ) : (
                    entries.map((entry, index) => (
                        entry.active ? 
                            <div key={index} className="mb-4">
                                <p>{entry.active}</p>
                                <BoardEntryComponent {...entry} />
                            </div>
                            : ''
                    ))
                )}
            </div>
        </div>
    );
}
