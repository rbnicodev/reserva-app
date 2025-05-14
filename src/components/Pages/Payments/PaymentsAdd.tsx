import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { Pages, type PaymentsProps } from "../Payments";
import { db } from "../../../firebase";
import type { Payment } from "../../../models/Payment";
import { useEffect, useState } from "react";

export default function PaymentsAdd(props: PaymentsProps) {
    const [name, setName] = useState("");
    const [deadLine, setDeadLine] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [id, setId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null | undefined>(null);

    const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string }[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    const cancel = () => {
        props.setPayment(null);
        props.setPage(Pages.LIST);
    };

    function toInputDateFormat(dateStr: string): string {
        const [day, month, year] = dateStr.split("-");
        if (year?.length === 4)
            return `${year}-${month}-${day}`;
        else return dateStr;
    }

    const deletePayment = async () => {
        if (!confirmDeleteId) return;

        try {
            await deleteDoc(doc(db, "payments", confirmDeleteId));
            props.setPayments(props.payments.filter((r) => r.id !== confirmDeleteId));
            props.setPage(Pages.LIST);
        } catch (error) {
            console.error("Error eliminando el pago:", error);
        }

        setConfirmDeleteId(null);
    };

    const savePayment = async () => {
        if (!props.payUser?.name) return;
    
        if (!name.trim()) {
            alert("El nombre del pago es obligatorio.");
            return;
        }
        if (!deadLine) {
            alert("La fecha límite es obligatoria.");
            return;
        }
        if (!amount || isNaN(amount) || amount <= 0) {
            alert("El monto debe ser mayor que 0.");
            return;
        }
    
        const basePayment = {
            name,
            amount,
            payUserCreator: props.payUser.name,
            payUsersAllowed: selectedUserIds,
            createDate: new Date().toISOString().split("T")[0],
            deadLine
        };
    
        try {
            let savedPayment: Payment;
    
            if (props.payment?.id) {
                const paymentRef = doc(db, "payments", props.payment.id);
                await updateDoc(paymentRef, basePayment);
                savedPayment = { ...basePayment, id: props.payment.id };
    
                props.setPayments(
                    props.payments.map(p => p.id === savedPayment.id ? savedPayment : p)
                );
            } else {
                const docRef = await addDoc(collection(db, "payments"), basePayment);
                savedPayment = { ...basePayment, id: docRef.id };
    
                props.setPayments([...props.payments, savedPayment]);
            }
    
            props.setPayment(null);
            props.setPage(Pages.LIST);
    
        } catch (error) {
            console.error("Error al guardar el pago:", error);
        }
    };
    

    useEffect(() => {
        const fetchAllowedUsers = async () => {
            if (!props.payUser?.name) return;

            try {
                const accessSnap = await getDocs(collection(db, "payAcces"));
                const allowedIds: string[] = [];

                accessSnap.forEach(accessDoc => {
                    allowedIds.push(accessDoc.data().payUser);
                });

                const usersSnap = await getDocs(collection(db, "payUsers"));
                const users = usersSnap.docs
                    .filter(doc => allowedIds.includes(doc.id))
                    .filter(doc => props.payUser?.name != doc.id)
                    .map(doc => {
                        const data = doc.data();
                        return { id: doc.id, name: data.name };
                    });
                setAvailableUsers(users);
            } catch (error) {
                console.error("Error cargando usuarios permitidos:", error);
            }
        };

        fetchAllowedUsers();
    }, [props.payUser]);

    useEffect(() => {
        if (props.payment) {
            setId(props.payment.id ?? "");
            setName(props.payment.name ?? "");
            setDeadLine(props.payment.deadLine ?? "");
            setSelectedUserIds(props.payment.payUsersAllowed ?? []);
            setAmount(props.payment.amount ?? 0);
        }
    }, [props.payment]);

    return (
        <div>
            <h2 className="text-center mb-4">Añadir nuevo pago</h2>
            <div className="card p-4 shadow-sm">
                <div className="form-group mb-3">
                    <label htmlFor="paymentName" className="form-label">Nombre del pago</label>
                    <input
                        id="paymentName"
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ej. Menús M&C 2025"
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="amount" className="form-label">Monto a pagar</label>
                    <div className="input-group">
                        <input
                            id="amount"
                            type="number"
                            step="0.01"
                            className="form-control"
                            value={amount}
                            onFocus={() => amount === 0 && setAmount(NaN)}
                            onChange={e => setAmount(parseFloat(e.target.value))}
                            placeholder="Ej. 120.50"
                        />
                        <span className="input-group-text">€</span>
                    </div>
                </div>


                <div className="form-group mb-4">
                    <label htmlFor="deadline" className="form-label">Fecha límite</label>
                    <input
                        id="deadline"
                        type="date"
                        className="form-control"
                        value={toInputDateFormat(deadLine)}
                        onChange={e => setDeadLine(e.target.value)}
                    />
                </div>

                <div className="form-group mb-4">
                    <label className="form-label">Usuarios con acceso</label>
                    <select
                        multiple
                        className="form-select"
                        value={selectedUserIds}
                        onChange={(e) => {
                            const options = Array.from(e.target.selectedOptions);
                            setSelectedUserIds(options.map(option => option.value));
                        }}
                    >
                        {availableUsers.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                    <small className="form-text text-muted">Usa Ctrl/Cmd + click para seleccionar varios.</small>
                </div>

                <div className="d-flex justify-content-between">
                    <button className="btn btn-secondary" onClick={cancel}>Cancelar</button>
                    <button className="btn btn-danger" onClick={() => setConfirmDeleteId(props.payment?.id)}>Eliminar</button>
                    <button className="btn btn-primary" onClick={savePayment}>Guardar</button>
                </div>

                {confirmDeleteId && (
                    <div className="modal d-block" style={{ background: "rgba(0, 0, 0, 0.5)", marginTop: "66px" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Eliminar pago</h5>
                                    <button type="button" className="btn-close" onClick={() => setConfirmDeleteId(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <p>¿Seguro que quieres eliminar este pago? Los datos serán irrecuperables.</p>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
                                    <button className="btn btn-danger" onClick={deletePayment}>Eliminar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
