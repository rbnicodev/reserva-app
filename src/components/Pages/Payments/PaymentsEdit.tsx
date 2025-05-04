import { Pages, type PaymentsProps } from "../Payments";

export default function PaymentsEdit(props: PaymentsProps) {
    return (<div>
        <h1 className="text-center" >{"<"}Edit{"/>"}</h1>
        <button onClick={() => props.setPage(Pages.LIST)}>Cancelar</button>
    </div>)
}