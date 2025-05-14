import { useEffect, useState } from "react";
import type { User } from "../../../models/User";
import {
    PaymentForUser,
    type Payment,
    type PaymentForUserProps,
} from "../../../models/Payment";
import {
    allUsers,
    findPaymentsForUserByPayment,
    userReservations,
    allMenus,
    allPrices,
    allShifts,
    savePaymentForUser,
} from "../../../utils/firebaseUtils";
import type { PaymentsProps } from "../Payments";
import type { Menu } from "../../../models/Menu";
import type { Price } from "../../../models/Price";

export default function PaymentUsersList(props: PaymentsProps) {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [paymentForUsers, setPaymentForUsers] = useState<PaymentForUser[]>([]);
    const [collapsedStates, setCollapsedStates] = useState<{ [key: number]: boolean }>([]);
    const [inputValues, setInputValues] = useState<string[]>([]);

    useEffect(() => {
        setInputValues(paymentForUsers.map((p) => p.paid.toFixed(2)));
    }, [paymentForUsers]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allUsersState, existingPayments, menus, prices, shiftsMap] =
                    await Promise.all([
                        allUsers(),
                        findPaymentsForUserByPayment(props.payment?.id!),
                        allMenus(),
                        allPrices(),
                        allShifts(),
                    ]);

                setUsers(allUsersState);

                const calculatedPayments: PaymentForUser[] = await Promise.all(
                    allUsersState.map(async (user: User) => {
                        const existing = existingPayments.find(
                            (p: PaymentForUser) => p.idUser === user.id
                        );

                        if (existing) return new PaymentForUser(existing);

                        let amount = 0;

                        if (props.payment?.isMC) {
                            const reservations = await userReservations(user.id!);

                            amount =
                                reservations?.reduce((acc, reservation) => {
                                    const menu = menus?.find(
                                        (m: Menu) => m.shiftId === reservation.shiftId
                                    );
                                    const price = prices?.find(
                                        (p: Price) => p.id === menu?.priceId
                                    );
                                    return (
                                        acc + (price?.amount || 0) * (reservation?.guests ?? 0)
                                    );
                                }, 0) ?? 0;
                        }

                        return new PaymentForUser({
                            idUser: user.id,
                            idPayment: props.payment?.id,
                            amount,
                            paid: 0,
                        });
                    })
                );

                setPaymentForUsers(calculatedPayments);
                setCollapsedStates(() =>
                    calculatedPayments.reduce((acc: { [key: number]: boolean }, _, idx) => {
                        acc[idx] = true;
                        return acc;
                    }, {})
                );
            } catch (error) {
                console.error("Error al cargar datos de pagos", error);
            } finally {
                setLoading(false);
            }
        };

        if (props.payment?.id) {
            fetchData();
        }
    }, [props.payment]);

    const handlePaidChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        idx: number
    ) => {
        let rawValue = e.target.value.replace(",", "."); // Convertir coma a punto

        if (/^0\d+/.test(rawValue)) {
            rawValue = String(parseFloat(rawValue));
        }
        // Solo permitir formato numérico válido
        if (!/^(\d+)?([.]\d{0,2})?$/.test(rawValue) && rawValue !== "") return;

        setInputValues((prev) => {
            const updated = [...prev];
            updated[idx] = rawValue;
            return updated;
        });
    };

    const handlePaidBlur = async (p: PaymentForUser, idx: number) => {
        const rawInput = inputValues[idx]?.replace(",", ".").trim() || "0";
        let parsed = parseFloat(rawInput);

        if (isNaN(parsed)) parsed = 0;

        if (parsed > p.amount) {
            alert("La cantidad pagada no puede ser superior al monto del pago");
            parsed = 0;
        }

        p.paid = parsed;

        setPaymentForUsers((prev) => {
            const updated = [...prev];
            updated[idx].paid = parsed;
            return updated;
        });

        setInputValues((prev) => {
            const updated = [...prev];
            updated[idx] = parsed.toFixed(2);
            return updated;
        });

        try {
            await savePaymentForUser(p);
        } catch (error) {
            console.error("Error al guardar el pago:", error);
        }
    };




    const toggleCollapse = (idx: number) => {
        setCollapsedStates((prevStates) => ({
            ...prevStates,
            [idx]: !prevStates[idx], // Alternar el estado de colapso para la tarjeta correspondiente
        }));
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                {paymentForUsers.filter((p, idx) => p.amount > 0).map((p, idx) => {
                    const user = users.find((u) => u.id === p.idUser);
                    const isPaidEnough = p.paid >= p.amount;
                    const remainingAmount = (p.amount - p.paid).toFixed(2);
                    return (
                        <div className="col-md-4 col-sm-6 col-12 mb-4" key={p.id || idx}>
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title d-flex justify-content-between">
                                        <span>{user?.name || "Usuario desconocido"}</span>
                                        <button
                                            className="btn p-0 border-0 bg-transparent"
                                            onClick={() => toggleCollapse(idx)}
                                            aria-expanded={!collapsedStates[idx]}
                                            aria-controls={`collapseCard-${idx}`}
                                            style={{ color: "#6c757d" }}                                        >
                                            {collapsedStates[idx] ? "▼" : "▲"}
                                        </button>


                                    </h5>

                                    {!collapsedStates[idx] && (<p className="card-text mb-1">
                                        <strong>Monto:</strong> {p.amount.toFixed(2)}€
                                    </p>)}

                                    <div className={`collapse ${collapsedStates[idx] ? "" : "show"}`} id={`collapseCard-${idx}`}>
                                        <div className="mb-2">
                                            <label className="form-label fw-bold">Pagado:</label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={inputValues[idx] ?? p.paid.toFixed(2)}
                                                    onChange={(e) => handlePaidChange(e, idx)}
                                                    onBlur={() => handlePaidBlur(p, idx)}
                                                    onFocus={(e) => {
                                                        const value = paymentForUsers[idx].paid;
                                                        const isWhole = value % 1 === 0;

                                                        setInputValues((prev) => {
                                                            const updated = [...prev];
                                                            updated[idx] = isWhole ? value.toString() : value.toFixed(2);
                                                            return updated;
                                                        });
                                                    }}

                                                    inputMode="decimal"
                                                />
                                                <span className="input-group-text">€</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="card-text mt-2">
                                        <strong>Estado:</strong>{" "}
                                        <span className={isPaidEnough ? "text-success" : "text-danger"}>
                                            {isPaidEnough ? "Pagado" : `- ${remainingAmount}€`}
                                        </span>
                                    </p>

                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
