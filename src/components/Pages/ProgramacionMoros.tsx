import { Paths } from "../../utils/paths";
import Header from "../Header";

export default function ProgramacionMoros() {
    
    window.scrollTo(0, 0);
    const imagenes = [
        "/docs/jueves.png",
        "/docs/viernes.png",
        "/docs/sabado.png",
        "/docs/domingo.png",
        "/docs/lunes.png",
        "/docs/orden.png",
    ];

    return (
        <div>
            {Header(Paths.BULLETIN_BOARD, "Programación")}
            <div style={{ paddingTop: "120px", width: "auto", paddingBottom: "1em" }}>
                {imagenes.map((src) => (
                    <div className="mb-4 text-center">
                        <img src={src} className="img-fluid" style={{ maxWidth: "500px;" }} alt="Imagen de /docs/" />
                    </div>
                ))}
            </div>
        </div>
    )
}