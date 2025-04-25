import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Paths } from "../utils/paths";

export default function ListUsers(users, url) {
    const navigate = useNavigate();
    const [selectedUserId, setSelectedUserId] = useState("");

    const handleSubmit = () => {
        if (selectedUserId) {
            navigate(`${url}?userId=${selectedUserId}`);
        }
    };

    return (
        <div className="card shadow-sm d-flex flex-column justify-content-between" style={{ minHeight: "30vh" }}>
            {users.length === 0 ? (
                <p className="text-secondary text-center mt-5">Cargando usuarios...</p>
            ) : (
                <>
                    <div className="text-center px-3 mt-3">
                        <h5 className="mb-4">Elige un usuario:</h5>

                        <select
                            className="form-select mb-3"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">-- Selecciona --</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="px-3 mt-3 mb-5">
                        <div className="row">
                            <div className="col">
                            <button
                            className="btn w-100 btn-secondary"
                            onClick={() => navigate(Paths.INDEX)}
                        >
                            Cancelar
                        </button>
                            </div>
                            <div className="col">
                            <button
                            className={`btn w-100 ${selectedUserId ? "btn-success" : "btn-secondary"}`}
                            disabled={!selectedUserId}
                            onClick={handleSubmit}
                        >
                            Entrar
                        </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
