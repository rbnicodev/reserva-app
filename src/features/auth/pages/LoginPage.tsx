import { useState } from "react";
import { getOAuthLoginUrl } from "../api/authApi";
import { saveOAuthState } from "../lib/authStorage";
import type { OAuthProvider } from "../models/auth";

const PROVIDERS: { id: OAuthProvider; label: string; className: string }[] = [
    { id: "google", label: "Continuar con Google", className: "btn-outline-dark" },
    { id: "facebook", label: "Continuar con Facebook", className: "btn-primary" },
    { id: "apple", label: "Continuar con Apple", className: "btn-dark" },
];

export default function LoginPage() {
    const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
    const [error, setError] = useState("");

    const handleLogin = async (provider: OAuthProvider) => {
        setError("");
        setLoadingProvider(provider);
        try {
            const { login_url, state } = await getOAuthLoginUrl(provider);
            saveOAuthState(provider, state);
            window.location.assign(login_url);
        } catch {
            setError("No se pudo iniciar sesión. Inténtalo de nuevo.");
            setLoadingProvider(null);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center main-layout">
            <div className="card shadow-sm p-4" style={{ maxWidth: "400px", width: "100%" }}>
                <h4 className="text-center mb-4">Iniciar sesión</h4>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="d-grid gap-3">
                    {PROVIDERS.map(({ id, label, className }) => (
                        <button
                            key={id}
                            type="button"
                            className={`btn ${className}`}
                            disabled={loadingProvider !== null}
                            onClick={() => handleLogin(id)}
                        >
                            {loadingProvider === id ? "Redirigiendo..." : label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
