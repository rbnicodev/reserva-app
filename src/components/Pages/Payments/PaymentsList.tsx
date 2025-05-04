import type { PayUser } from "../../../models/User";
import { Paths } from "../../../utils/paths";
import Header from "../../Header";
import { Pages, type PaymentsProps } from "../Payments";

export default function PaymentsList(props: PaymentsProps) {
    return (
        <div>
            <h1 className="text-center" >{"<"}IN DEVELOPMENT{"/>"}</h1>
            <div className="row"><button onClick={() => (props.setPayUser(null))}>Cerrar sesión</button></div>
            <div className="row"><button onClick={() => (props.setPage(Pages.ADD))}>Crear</button></div>
            <div className="row"><button onClick={() => (props.setPage(Pages.EDIT))}>Editar</button></div>
        </div>
    )
}