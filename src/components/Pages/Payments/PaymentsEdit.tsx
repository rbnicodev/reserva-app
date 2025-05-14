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
import { Pages, type PaymentsProps } from "../Payments";
import type { Menu } from "../../../models/Menu";
import type { Price } from "../../../models/Price";
import HeaderPayments from "./HeaderPayments";

export default function PaymentUsersList(props: PaymentsProps) {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [paymentForUsers, setPaymentForUsers] = useState<PaymentForUser[]>([]);
    const [inputValues, setInputValues] = useState<{ [userId: string]: string }>({});
    const [collapsedStates, setCollapsedStates] = useState<{ [userId: string]: boolean }>({});

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
                setInputValues(
                    calculatedPayments.reduce((acc, p) => {
                        acc[p.idUser!] = p.paid.toFixed(2);
                        return acc;
                    }, {} as { [userId: string]: string })
                );

                setCollapsedStates(
                    calculatedPayments.reduce((acc, p) => {
                        acc[p.idUser!] = true;
                        return acc;
                    }, {} as { [userId: string]: boolean })
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

    const handlePaidChange = (e: React.ChangeEvent<HTMLInputElement>, userId: string) => {
        let rawValue = e.target.value.replace(",", ".");
        if (/^0\d+/.test(rawValue)) rawValue = String(parseFloat(rawValue));
        if (!/^(\d+)?([.]\d{0,2})?$/.test(rawValue) && rawValue !== "") return;

        setInputValues((prev) => ({ ...prev, [userId]: rawValue }));
    };

    const handlePaidBlur = async (p: PaymentForUser, userId: string) => {
        const rawInput = inputValues[userId]?.replace(",", ".").trim() || "0";
        let parsed = parseFloat(rawInput);
        if (isNaN(parsed)) parsed = 0;
        if (parsed > p.amount) {
            alert("La cantidad pagada no puede ser superior al monto del pago");
            parsed = 0;
        }

        p.paid = parsed;

        setPaymentForUsers((prev) =>
            prev.map((item) => {
                if (item.idUser === userId) {
                    item.paid = parsed;
                }
                return item;
            })
        );

        setInputValues((prev) => ({
            ...prev,
            [userId]: parsed.toFixed(2),
        }));

        try {
            await savePaymentForUser(p);
        } catch (error) {
            console.error("Error al guardar el pago:", error);
        }
    };

    const toggleCollapse = (userId: string) => {
        setCollapsedStates((prev) => ({
            ...prev,
            [userId]: !prev[userId],
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
        <div>
            {HeaderPayments(props?.payment?.name || "Pago", props.setPage, Pages.LIST)}
            <div style={{ paddingTop: "95px", paddingBottom: "20px" }}>
                <div className="row">
                    {paymentForUsers.filter(p => p.amount > 0).map((p) => {
                        const user = users.find((u) => u.id === p.idUser);
                        const userId = p.idUser!;
                        const isPaidEnough = p.paid >= p.amount;
                        const remainingAmount = (p.amount - p.paid).toFixed(2);

                        return (
                            <div className="col-md-4 col-sm-6 col-12 mb-4" key={userId}>
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title d-flex justify-content-between">
                                            <span>{user?.name || "Usuario desconocido"}</span>
                                            <button
                                                className="btn p-0 border-0 bg-transparent"
                                                onClick={() => toggleCollapse(userId)}
                                                aria-expanded={!collapsedStates[userId]}
                                                aria-controls={`collapseCard-${userId}`}
                                                style={{ color: "#6c757d" }}
                                            >
                                                {collapsedStates[userId] ? "▼" : "▲"}
                                            </button>
                                        </h5>

                                        {!collapsedStates[userId] && (
                                            <p className="card-text mb-1">
                                                <strong>Monto:</strong> {p.amount.toFixed(2)}€
                                            </p>
                                        )}

                                        <div className={`collapse ${collapsedStates[userId] ? "" : "show"}`} id={`collapseCard-${userId}`}>
                                            <div className="mb-2">
                                                <label className="form-label fw-bold">Pagado:</label>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={inputValues[userId] ?? p.paid.toFixed(2)}
                                                        onChange={(e) => handlePaidChange(e, userId)}
                                                        onBlur={() => handlePaidBlur(p, userId)}
                                                        onFocus={() => {
                                                            const value = p.paid ?? 0;
                                                            const isWhole = value % 1 === 0;
                                                            setInputValues((prev) => ({
                                                                ...prev,
                                                                [userId]: isWhole ? value.toString() : value.toFixed(2),
                                                            }));
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
        </div>
    );
}
