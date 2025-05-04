import { Pages, type PaymentsProps } from "../Payments";

export default function PaymentsAdd(props: PaymentsProps) {
    return (<div>
        <h1 className="text-center" >{"<"}ADD{"/>"}</h1>
        <button onClick={() => props.setPage(Pages.LIST)}>Cancelar</button>
    </div>)
}