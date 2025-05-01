import { Paths } from "../../utils/paths";
import Header from "../Header";

export default function Payments() {
    return (
        <div>
            {Header(Paths.INDEX, "Pagos")}
            <h1 className="text-center" style={{ paddingTop: "95px", paddingBottom: "20px" }}>{"<"}IN DEVELOPMENT{"/>"}</h1>
        </div>
    )
}