import { useEffect, useState } from "react";
import { allEntries } from "../../utils/firebaseUtils";
import BoardEntryComponent from "../BoardEntryComponent";
import type { BoardEntry } from "../../models/BoardEntry";
import Header from "../Header";
import { Paths } from "../../utils/paths";

export default function Board() {
    const [entries, setEntries] = useState<BoardEntry[]>([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchEntries = async () => {
            try {
                const data = await allEntries();
                const dataOrdered = data.sort( (e1, e2) => e2.order - e1.order);
                dataOrdered.length = dataOrdered.length < 5 ? dataOrdered.length : 5;
                setEntries(dataOrdered);
            } catch (error) {
                console.error("Error fetching board entries:", error);
            }
        };

        fetchEntries();
    }, []);

    return (

        <div style={{paddingBottom: "1em"}}>
            {Header(Paths.INDEX, "Tablón")}
            <div style={{ paddingTop: "90px", width: "auto" }}>
                {entries.length === 0 ? (
                    <p>Cargando entradas...</p>
                ) : (
                    entries.map((entry, index) => (
                        <div key={index} className="mb-4">
                            <BoardEntryComponent {...entry} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
