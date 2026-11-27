import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithPassword } from "../api/authApi";
import { getDeviceId, saveSession } from "../lib/authStorage";
import { Paths } from "../../../utils/paths";

const PROVIDERS: { id: string; label: string; className: string }[] = [
    { id: "google", label: "Google", className: "btn-outline-dark" },
    { id: "facebook", label: "Facebook", className: "btn-primary" },
    { id: "apple", label: "Apple", className: "btn-dark" },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const login = await loginWithPassword({ email, password, dispositivoId: getDeviceId() });
            saveSession(login);
            navigate(Paths.INDEX, { replace: true });
        } catch {
            setError("Email o contraseña incorrectos, o cuenta bloqueada.");
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center main-layout">
            <div className="card shadow-sm p-4" style={{ maxWidth: "400px", width: "100%" }}>
                <h4 className="text-center mb-4">Iniciar sesión</h4>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <form className="d-grid gap-3" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="login-email" className="form-label">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div>
                        <label htmlFor="login-password" className="form-label">Contraseña</label>
                        <input
                            id="login-password"
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <hr className="my-4" />

                <div className="d-grid gap-2">
                    {PROVIDERS.map(({ id, label, className }) => (
                        <button key={id} type="button" className={`btn ${className}`} disabled>
                            {label} (no disponible)
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
