import { useEffect, useState } from "react";
import type { PayUser } from "../../models/User";
import { Paths } from "../../utils/paths";
import Header from "../Header";
import PaymentsList from "./Payments/PaymentsList";
import PaymentsAdd from "./Payments/PaymentsAdd";
import PaymentsEdit from "./Payments/PaymentsEdit";
import type { Payment } from "../../models/Payment";
import { findPaymentsByUser } from "../../utils/firebaseUtils";

export type PaymentsProps = {
    payUser: PayUser | null;
    setPayUser: React.Dispatch<React.SetStateAction<PayUser | null>>;
    page: Pages;
    setPage: React.Dispatch<React.SetStateAction<Pages>>;
    payments: Payment[];
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
    payment: Payment | null;
    setPayment: React.Dispatch<React.SetStateAction<Payment | null>>;
}

export type Props = {
    payUser: PayUser | null;
    setPayUser: React.Dispatch<React.SetStateAction<PayUser | null>>;
}

export enum Pages {
    LIST,
    ADD,
    EDIT
}

export default function Payments({ payUser, setPayUser }: Props) {
    const [page, setPage] = useState<Pages>(Pages.LIST);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [payment, setPayment] = useState<Payment | null>(null);

    useEffect(() => {
        const loadPayments = async () => {
            if (payUser?.name) {
                const result = await findPaymentsByUser(payUser.name);
                setPayments(result);
            }
        };
        loadPayments();
    }, [payUser]);

    return (
        <div>
            {Header(Paths.INDEX, "Pagos")}
            <div style={{ paddingTop: "95px", paddingBottom: "20px" }}>
                {page === Pages.LIST ? (
                    <PaymentsList
                        setPayUser={setPayUser}
                        payUser={payUser}
                        page={page}
                        setPage={setPage}
                        payments={payments}
                        setPayments={setPayments}
                        payment={payment}
                        setPayment={setPayment}
                    />
                ) : page === Pages.ADD ? (
                    <PaymentsAdd
                        setPayUser={setPayUser}
                        payUser={payUser}
                        page={page}
                        setPage={setPage}
                        payments={payments}
                        setPayments={setPayments}
                        payment={payment}
                        setPayment={setPayment}
                    />
                ) : page === Pages.EDIT ? (
                    <PaymentsEdit
                        setPayUser={setPayUser}
                        payUser={payUser}
                        page={page}
                        setPage={setPage}
                        payments={payments}
                        setPayments={setPayments}
                        payment={payment}
                        setPayment={setPayment}
                    />
                ) : null}
            </div>
        </div>
    );
}