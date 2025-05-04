import { useState } from "react";
import type { PayUser } from "../../models/User";
import { Paths } from "../../utils/paths";
import Header from "../Header";
import PaymentsList from "./Payments/PaymentsList";
import PaymentsAdd from "./Payments/PaymentsAdd";
import PaymentsEdit from "./Payments/PaymentsEdit";

export type PaymentsProps = {
    payUser: PayUser | null;
    setPayUser: React.Dispatch<React.SetStateAction<PayUser | null>>;
    page: Pages;
    setPage: React.Dispatch<React.SetStateAction<Pages>>;
}

export enum Pages {
    LIST,
    ADD,
    EDIT
}

export default function Payments({ payUser, setPayUser }: PaymentsProps) {
    const [page, setPage] = useState<Pages>(Pages.LIST);
    return (
        <div>
            {Header(Paths.INDEX, "Pagos")}
            <div style={{ paddingTop: "95px", paddingBottom: "20px" }}>
                {(page == Pages.LIST) ?
                    (<PaymentsList setPayUser={setPayUser} payUser={payUser} page={page} setPage={setPage} />) :
                    (page == Pages.ADD) ?
                        (<PaymentsAdd setPayUser={setPayUser} payUser={payUser} page={page} setPage={setPage} />) :
                        (page == Pages.EDIT) ?
                        (<PaymentsEdit setPayUser={setPayUser} payUser={payUser} page={page} setPage={setPage} />)
                            : (<></>)}
            </div>

        </div>
    )
}