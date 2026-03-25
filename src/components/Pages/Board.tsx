import { useEffect, useState } from "react";
import { allEntries, fetchGlobalSettings } from "../../utils/firebaseUtils";
import BoardEntryComponent from "../BoardEntryComponent";
import type { BoardEntry } from "../../models/BoardEntry";
import Header from "../Header";
import { Paths } from "../../utils/paths";
import { useNavigate } from "react-router-dom";

export default function Board() {
    const [entries, setEntries] = useState<BoardEntry[]>([]);
    const [activateTopBoard, setActivateTopBoard] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchEntries = async () => {
            try {
                const data = await allEntries();
                const dataOrdered = [...data].sort((e1, e2) => {
                    const t1 = e1.order.seconds;
                    const t2 = e2.order.seconds;

                    if (t1 > t2) return -1;
                    if (t1 < t2) return 1;
                    return 0;
                    });
                dataOrdered.length = dataOrdered.length < 5 ? dataOrdered.length : 5;
                setEntries(dataOrdered);
            } catch (error) {
                console.error("Error fetching board entries:", error);
            }
            
        const activate_top_board = (await fetchGlobalSettings())?.activate_top_board;    
        setActivateTopBoard(activate_top_board || false); 
        };

        fetchEntries();
    }, []);

    return (

        <div style={{ paddingBottom: "1em" }}>
            {Header(Paths.INDEX, "Tablón")}
            <div style={{ paddingTop: "95px", width: "auto" }}>



                {activateTopBoard ? (
                    <div className="mb-4">
                    <div className="card shadow-sm p-3 d-flex flex-row align-items-center">
                        <div className={`flex-grow-1 `}>
                            <h5 className="card-title text-dark mb-2 text-center">Programación de Moros</h5>
                            <h6 className="card-subtitle mb-2 text-muted text-center">2026</h6>
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
                    <p>Cargando entradas...</p>
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
