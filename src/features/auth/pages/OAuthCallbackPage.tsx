import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { exchangeOAuthCode } from "../api/authApi";
import { consumeOAuthState, getDeviceId, saveSession } from "../lib/authStorage";
import type { OAuthProvider } from "../models/auth";
import { Paths } from "../../../utils/paths";

const VALID_PROVIDERS: OAuthProvider[] = ["google", "facebook", "apple"];

export default function OAuthCallbackPage() {
    const { provider } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const saved = consumeOAuthState();

        if (
            !VALID_PROVIDERS.includes(provider as OAuthProvider) ||
            code === null ||
            state === null ||
            saved === null ||
            saved.provider !== provider ||
            saved.state !== state
        ) {
            setError("La sesión de inicio de sesión no es válida. Vuelve a intentarlo.");
            return;
        }

        exchangeOAuthCode(provider as OAuthProvider, code, state, getDeviceId())
            .then((login) => {
                saveSession(login);
                navigate(Paths.INDEX, { replace: true });
            })
            .catch(() => setError("No se pudo completar el inicio de sesión."));
    }, [provider, searchParams, navigate]);

    return (
        <div className="container d-flex justify-content-center align-items-center main-layout">
            <div className="card shadow-sm p-4 text-center" style={{ maxWidth: "400px", width: "100%" }}>
                {error ? (
                    <>
                        <div className="alert alert-danger">{error}</div>
                        <a className="btn btn-outline-dark" href={Paths.LOGIN}>Volver al login</a>
                    </>
                ) : (
                    <p className="mb-0">Iniciando sesión...</p>
                )}
            </div>
        </div>
    );
}
