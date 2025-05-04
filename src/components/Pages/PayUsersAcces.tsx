import React, { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Paths } from "../../utils/paths";
import Header from "../Header";
import { canPayAccess, hasPayAccess, setPassword, loggin, resetPassword } from "../../utils/firebaseUtils";
import type { PayUser } from "../../models/User";

type Props = {
    setPayUser: React.Dispatch<React.SetStateAction<PayUser | null>>;
}

export default function PayUserAccess({setPayUser}: Props) {
    const [users, setUsers] = useState<PayUser[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedUserName, setSelectedUserName] = useState("");
    const [password, setPasswordInput] = useState("");
    const [needsPassword, setNeedsPassword] = useState<boolean | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmError, setConfirmError] = useState("");
    const [showResetModal, setShowResetModal] = useState(false);
    const [modalError, setModalError] = useState("");


    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchPayUsers = async () => {
            const usersCollection = collection(db, "payUsers");
            const userDocs = await getDocs(usersCollection);
            const allUsers = userDocs.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name ?? "Sin nombre"
            }));

            const usersWithAccess = [];
            for (const user of allUsers) {
                if (await canPayAccess(user.id)) {
                    usersWithAccess.push(user);
                }
            }
            setUsers(usersWithAccess);
        };

        fetchPayUsers();
    }, []);

    const handleUserChange = async (e: ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        setSelectedUserId(userId);
        setPasswordInput("");
        setNeedsPassword(null);

        // Verifica que userId no sea undefined o vacío
        if (!userId) {
            console.error("ID de usuario no válido.");
            return;
        }

        const selected = users.find(u => u.id === userId);
        if (selected?.id && selected?.name) {
            setSelectedUserName(selected.id);

            const hasPassword = await hasPayAccess(selected.id);
            setNeedsPassword(!hasPassword);
        }
    };

    const handleSetPassword = async () => {
        if (!password || !confirmPassword || !selectedUserName) return;

        if (password !== confirmPassword) {
            setConfirmError("Las contraseñas no coinciden.");
            return;
        }

        const success = await setPassword(selectedUserName, password);
        if (success) {
            await handleLoggin(); // login automático tras establecer
        } else {
            setConfirmError("Hubo un error al establecer la contraseña.");
        }
    };


    const handleLoggin = async () => {
        if (!password || !selectedUserName) return;

        const success = await loggin(selectedUserName, password);
        if (success) {
            setPayUser({name: selectedUserName});
        } else {
            setError("Contraseña incorrecta.");
        }
    };

    return (
        <div>
            {Header(Paths.INDEX, "Acceso a Pagos")}
            <div style={{ paddingTop: "95px", paddingBottom: "20px" }}>
                <div className="card shadow-sm d-flex flex-column justify-content-between" style={{ minHeight: "30vh" }}>
                    {users.length === 0 ? (
                        <p className="text-secondary text-center mt-5">Cargando usuarios...</p>
                    ) : (
                        <>
                            <div className="text-center px-3 mt-3">
                                <h5 className="mb-4">Elige un usuario de pago:</h5>

                                <select
                                    className="form-select mb-3"
                                    value={selectedUserId}
                                    onChange={handleUserChange}
                                >
                                    <option value="">-- Selecciona --</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>

                                {selectedUserId && (
                                    <div className="mt-4">
                                        <div className="input-group mb-3">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className={`form-control ${error || confirmError ? "is-invalid" : ""}`}
                                                placeholder="Introduce contraseña"
                                                value={password}
                                                onChange={(e) => {
                                                    setPasswordInput(e.target.value);
                                                    setError("");
                                                    setConfirmError("");
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => setShowPassword(!showPassword)}
                                                title={showPassword ? "Ocultar" : "Mostrar"}
                                            >
                                                {showPassword ? "🙈" : "👁️"}
                                            </button>
                                        </div>

                                        {needsPassword && (
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className={`form-control mb-3 ${confirmError ? "is-invalid" : ""}`}
                                                placeholder="Repite la contraseña"
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    setConfirmPassword(e.target.value);
                                                    setConfirmError("");
                                                }}
                                            />
                                        )}

                                        {(error || confirmError) && (
                                            <div className="invalid-feedback d-block">
                                                {error || confirmError}
                                            </div>
                                        )}

                                        {needsPassword === null ? (
                                            <p>Cargando información...</p>
                                        ) : needsPassword ? (
                                            <button
                                                className="btn btn-primary w-100"
                                                onClick={handleSetPassword}
                                                disabled={!password || !confirmPassword}
                                            >
                                                Establecer contraseña
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn btn-success w-100 mb-2"
                                                    onClick={handleLoggin}
                                                    disabled={!password}
                                                >
                                                    Ingresar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-link w-100 text-decoration-underline text-danger"
                                                    onClick={() => setShowResetModal(true)}
                                                >
                                                    ¿Olvidaste tu contraseña?
                                                </button>

                                            </>
                                        )}
                                    </div>
                                )}

                            </div>

                            <div className="px-3 mt-4 mb-4">
                                <button
                                    className="btn btn-secondary w-100"
                                    onClick={() => navigate(Paths.INDEX)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {showResetModal && (
                <div className="modal d-block" style={{ background: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Restablecer contraseña</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowResetModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>¿Estás seguro de que quieres restablecer la contraseña? Tendrás que establecer una nueva.</p>
                                {modalError && <div className="alert alert-danger mt-2">{modalError}</div>}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowResetModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={async () => {
                                        if (!selectedUserName) return;

                                        const success = await resetPassword(selectedUserName);
                                        if (success) {
                                            setShowResetModal(false);
                                            setPasswordInput("");
                                            setNeedsPassword(true); // como si no tuviera contraseña
                                            setError("");
                                            setShowResetModal(false);
                                            setModalError("");

                                        } else {
                                            setModalError("Hubo un error al intentar restablecer la contraseña.");
                                        }
                                    }}
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>


    );
}
