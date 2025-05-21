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
    allPayUsers,
    deletePaymentForUser,
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
    const [tempValue, setTempValue] = useState<string | undefined>();
    const [oldValue, setOldValue] = useState<string | undefined>();
    const [confirmeSave, setConfirmeSave] = useState<PaymentForUser | null>(null);
    const [touched, setTouched] = useState<{ [userId: string]: boolean }>({});
    const [disabledButtons, setDisabled] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allUsersState, existingPayments, menus, prices, shiftsMap] =
                    await Promise.all([
                        (props?.payment?.isMC ? allUsers() : allPayUsers()),
                        findPaymentsForUserByPayment(props.payment?.id!),
                        (props?.payment?.isMC ? allMenus() : []),
                        (props?.payment?.isMC ? allPrices() : []),
                        (props?.payment?.isMC ? allShifts() : [])
                    ]);

                setUsers(allUsersState);

                const calculatedPayments: PaymentForUser[] = await Promise.all(
                    allUsersState.map(async (user: User) => {
                        const existing = existingPayments.find(
                            (p: PaymentForUser) => p.idUser === user.id
                        );

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
                        } else {
                            amount = props.payment?.amount ?? 0;
                        }

                        if (existing) {
                            if (props.payment?.isMC) existing.amount = amount;
                            return new PaymentForUser(existing);
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

                setTouched(
                    paymentForUsers.reduce((acc, p) => {
                        acc[p.idUser!] = false;
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

    const restoreValue = (userId: string) => {
        if (!tempValue) return;
        let parsed: number = parseFloat(tempValue);
        setTempValue(undefined);

        setInputValues((prev) => ({
            ...prev,
            [userId]: parsed.toFixed(2)
        }))
    }

    const handlePaidBlur = async (p: PaymentForUser, userId: string) => {
        console.log("onblur");
        setDisabled(true);
        const temporalValue = parseFloat(tempValue ?? "0");

        const rawInput = inputValues[userId]?.replace(",", ".").trim() || "0";
        let parsed = parseFloat(rawInput);
        if (isNaN(parsed)) parsed = 0;
        const toSave = parsed <= p.amount && temporalValue !== parseFloat(rawInput);
        if (parsed > p.amount) {
            alert("La cantidad pagada no puede ser superior al monto del pago");
            restoreValue(userId);
            setTouched((prev) => ({ ...prev, [userId]: false }));
            setTimeout(() => { setDisabled(false) }, 300);
            return;
        }

        setTempValue(parsed.toFixed(2));
        if (toSave) {
            p.paid = parsed;
            setConfirmeSave(p);
        } else {
            setInputValues((prev) => ({
                ...prev,
                [userId]: p.paid.toFixed(2)
            }))
        }
        setTouched((prev) => ({ ...prev, [userId]: false }));
        setTimeout(() => { setDisabled(false) }, 300);
    };

    const save = async (p: PaymentForUser) => {
        setLoading(true);
        try {
            setConfirmeSave(null);
            if (p.paid > 0) {
                p = await savePaymentForUser(p);
            } else if (!!p.id) {
                await deletePaymentForUser(p.id!);
                p.id = undefined;
            }

            setTempValue(undefined);
            setPaymentForUsers((prev) =>
                prev.map((item) => {
                    if (item.idUser === p.idUser) {
                        item.paid = p.paid;
                        item.id = p.id;
                    }
                    return item;
                })
            );

            const userId: string = p.idUser ?? '';
            setInputValues((prev) => ({
                ...prev,
                [userId]: p.paid.toFixed(2),
            }));
            setTimeout(() => { setLoading(false) }, 300);

        } catch (error) {
            console.error("Error al guardar el pago:", error);
        }
    }

    const toggleCollapse = (userId: string) => {
        setCollapsedStates((prev) => {
            const isOpen = !prev[userId]; // Si no está colapsado, está abierto

            if (isOpen) {
                // Si ya estaba abierta, colapsar todo
                const newStates: Record<string, boolean> = {};
                Object.keys(prev).forEach((id) => {
                    newStates[id] = true;
                });
                return newStates;
            } else {
                // Si estaba cerrada, colapsar todo excepto esta
                const newStates: Record<string, boolean> = {};
                Object.keys(prev).forEach((id) => {
                    newStates[id] = true;
                });
                newStates[userId] = false; // Abrir solo esta
                return newStates;
            }
        });
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
                {!props?.payment?.isMC ? <div>
                    <div className="mt-0 mb-2 text-center text-secondary">{props?.payment?.amount}€/px</div>
                    <hr className="hr mt-0 mb-4"></hr>
                </div> : <div>
                    <div className="mt-0 mb-2 text-center text-secondary">Cobrado: {paymentForUsers.map(p => p.paid).reduce((acc, curr) => acc+=curr, 0).toFixed(2)}€ de {paymentForUsers.map(p => p.amount).reduce((acc, curr) => acc+=curr, 0).toFixed(2)}€</div>
                    <hr className="hr mt-0 mb-4"></hr>
                </div>}
                <div className="row">
                    {paymentForUsers.filter(p => p.amount > 0).sort((a, b) => (b.isPaid() ? 0 : 1) - (a.isPaid() ? 0 : 1)).map((p, idx) => {
                        const user = users.find((u) => u.id === p.idUser);
                        const userId = p.idUser!;
                        const isPaidEnough = p.paid >= p.amount;
                        const remainingAmount = (p.amount - p.paid).toFixed(2);

                        return (
                            <div className="col-md-4 col-sm-6 col-12 mb-2" key={userId}>
                                <div className="card h-100" style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : props?.payment?.isMC ? '#f1f1f1' : '#g0g0g0' }}>
                                    <div className="card-body">
                                        {props?.payment?.isMC ? (<h5 className="card-title d-flex justify-content-between"
                                            onClick={() => toggleCollapse(userId)}>
                                            <span>{user?.name || "Usuario desconocido"}</span>
                                            {(props?.payment?.isMC) ? (<button
                                                className="btn p-0 border-0 bg-transparent"
                                                aria-expanded={!collapsedStates[userId]}
                                                aria-controls={`collapseCard-${userId}`}
                                                style={{ color: "#6c757d" }}
                                            >
                                                {collapsedStates[userId] ? "➕" : "➖"}
                                            </button>) : <></>}
                                        </h5>) : (
                                            <h5 className="card-title d-flex justify-content-between">
                                                <span>{user?.name || "Usuario desconocido"}</span>
                                                <div className={`${isPaidEnough ? "text-success" : "text-danger"} col text-end`}>{isPaidEnough ? "Pagado" : "Pendiente"}</div>
                                            </h5>
                                        )}

                                        {!collapsedStates[userId] && props?.payment?.isMC && (
                                            <p className="card-text mb-1">
                                                <strong>Total:</strong> {p.amount.toFixed(2)}€
                                            </p>
                                        )}

                                        <div className={`collapse ${collapsedStates[userId] ? "" : "show"}`} id={`collapseCard-${userId}`}>
                                            {!isPaidEnough ? <>
                                                <div className="mb-2 row">
                                                    <label className="form-label fw-bold">Pagado:</label>
                                                    <div className="input-group">
                                                        <input
                                                            disabled={p.isPaid()}
                                                            type="text"
                                                            className="form-control text-center"
                                                            value={inputValues[userId] ?? p.paid.toFixed(2)}
                                                            onChange={(e) => handlePaidChange(e, userId)}
                                                            onBlur={() => handlePaidBlur(p, userId)}
                                                            onFocus={(e) => {
                                                                setTouched((prev) => ({ ...prev, [userId]: true }))
                                                                setOldValue(e.target.value);
                                                                setTempValue(e.target.value);
                                                                const value = p.paid ?? 0;
                                                                const isWhole = value % 1 === 0;
                                                                setInputValues((prev) => ({
                                                                    ...prev,
                                                                    [userId]: isWhole ? value.toString() === '0' ? '' : value.toString() : value.toFixed(2),
                                                                }));
                                                            }}
                                                            inputMode="decimal"
                                                        />
                                                        <span className="input-group-text">€</span>
                                                    </div>
                                                </div>
                                            </> : <></>}
                                            <div className="w-auto text-center row"><button
                                                className={`btn w-50 mt-3 mb-4 m-auto ${isPaidEnough ? 'btn-danger' : touched[userId] ? 'btn-primary' : 'btn-success'}`}
                                                onClick={() => {
                                                    if (disabledButtons) {
                                                        setTouched((prev) => ({ ...prev, [userId]: false }));
                                                        return;
                                                    }
                                                    const value = isPaidEnough ? 0 : p.amount;
                                                    setOldValue(p.paid.toFixed(2));
                                                    setTempValue(value.toFixed(2));
                                                    setConfirmeSave(new PaymentForUser({ ...p, paid: isPaidEnough ? 0 : p.amount }));
                                                }}>{isPaidEnough ? 'Borrar' : touched[userId] ? 'Guardar' : 'Marcar Pagado'}</button></div>
                                        </div>

                                        {props?.payment?.isMC ? (
                                            <>
                                                <hr className="hr mb-0 mt-0"></hr>
                                                <p className="card-text mt-2 text-end">
                                                    <strong>Deuda:</strong>{" "}
                                                    <span className={isPaidEnough ? "text-success" : "text-danger"}>
                                                        {isPaidEnough ? "Pagado" : `- ${remainingAmount}€`}
                                                    </span>
                                                </p>
                                            </>) : (
                                            <div className="row">
                                                <div className="w-auto text-center col"><button
                                                    className={`btn w-50 mt-1 mb-1 ${isPaidEnough ? 'btn-danger' : 'btn-success'}`}
                                                    onClick={() => setConfirmeSave(new PaymentForUser({ ...p, paid: isPaidEnough ? 0 : p.amount }))}>{isPaidEnough ? 'Borrar' : 'Marcar Pagado'}</button></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>

            {confirmeSave && (
                <div className="modal d-block" style={{ background: "rgba(0, 0, 0, 0.5)", marginTop: "66px" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirmar pago</h5>
                                <button type="button" className="btn-close" onClick={() => setConfirmeSave(null)}></button>
                            </div>
                            <div className="modal-body">
                                <p>{props?.payment?.isMC ? parseFloat(tempValue!) > 0 ? `¿Es correcto el pago que ha indicado de ${tempValue}€?` : "¿Quieres eliminar el pago?" :
                                    confirmeSave.isPaid() ? `¿Confirmas que ${users.find(u => u.id === confirmeSave.idUser)?.name} ha pagado ${props?.payment?.name}?`
                                        : `¿Deseas borrar el pago de ${users.find(u => u.id === confirmeSave.idUser)?.name}, de ${props?.payment?.name}`}</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => {
                                    const userId = confirmeSave.idUser ?? '';
                                    const temporalValue = oldValue ?? '0';
                                    setInputValues((prev) => ({
                                        ...prev,
                                        [userId]: parseFloat(temporalValue).toFixed(2)
                                    }));
                                    setPaymentForUsers(paymentForUsers.map((prev) => new PaymentForUser({ ...prev, paid: prev.idUser === confirmeSave.idUser ? parseFloat(temporalValue) : prev.paid })));
                                    setTempValue(temporalValue);
                                    setConfirmeSave(null);
                                }}>Cancelar</button>
                                <button className="btn btn-primary" onClick={() => save(confirmeSave)}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
