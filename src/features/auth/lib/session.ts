import { Paths } from "../../../utils/paths.js";
import { API_URL, refreshAccessToken } from "../api/authApi";
import type { MeResponse, Session } from "../models/auth";
import { clearSession, getDeviceId, getSession, persistSession } from "./authStorage";

/** Se refresca antes de caducar para que una petición en curso no reciba un token ya vencido. */
const REFRESH_MARGIN_MS = 60_000;

let inFlightRefresh: Promise<Session | null> | null = null;

function isFresh(session: Session): boolean {
    return session.expiresAt > Date.now() + REFRESH_MARGIN_MS;
}

/** Comparte un único refresco entre llamadas concurrentes. Si falla, se cierra la sesión. */
function refreshOnce(session: Session): Promise<Session | null> {
    if (!inFlightRefresh) {
        inFlightRefresh = (async () => {
            try {
                const { access_token, expires_in } = await refreshAccessToken(session.refreshToken, getDeviceId());
                const refreshed: Session = {
                    ...session,
                    accessToken: access_token,
                    expiresAt: Date.now() + expires_in * 1000,
                };
                persistSession(refreshed);
                return refreshed;
            } catch {
                clearSession();
                return null;
            }
        })().finally(() => {
            inFlightRefresh = null;
        });
    }
    return inFlightRefresh;
}

/** Devuelve la sesión con un access token válido, refrescándolo si hace falta. Null si no hay sesión recuperable. */
export function ensureFreshSession(): Promise<Session | null> {
    const session = getSession();
    if (!session) return Promise.resolve(null);
    if (isFresh(session)) return Promise.resolve(session);
    return refreshOnce(session);
}

/** Fetch con Bearer. Ante un 401 refresca una vez y reintenta. */
export async function authorizedFetch(path: string, init?: RequestInit): Promise<Response> {
    const send = (accessToken: string) =>
        fetch(`${API_URL}${path}`, {
            ...init,
            headers: { ...init?.headers, Authorization: `Bearer ${accessToken}` },
        });

    const session = await ensureFreshSession();
    if (!session) {
        window.location.assign(Paths.LOGIN);
        throw new Error("Sesión caducada");
    }

    const response = await send(session.accessToken);
    if (response.status !== 401) return response;

    const current = getSession();
    const refreshed = current ? await refreshOnce(current) : null;
    if (!refreshed) {
        window.location.assign(Paths.LOGIN);
        throw new Error("Sesión caducada");
    }
    return send(refreshed.accessToken);
}

/** Usuario autenticado según el backend. Lanza error si el token no es válido para la API. */
export async function fetchCurrentUser(): Promise<MeResponse> {
    const response = await authorizedFetch("/api/auth/me");
    if (!response.ok) throw new Error(`Error ${response.status} en /api/auth/me`);
    return response.json() as Promise<MeResponse>;
}

/** Refresh token de la sesión ya validada contra la API. El refresh no rota, así que identifica la sesión. */
let validatedRefreshToken: string | null = null;

/**
 * Valida la sesión contra /api/auth/me una sola vez por sesión. Las navegaciones posteriores
 * solo comprueban que el token local siga vigente. Si cambia la sesión (logout o nuevo login), se vuelve a validar.
 */
export async function ensureValidatedSession(): Promise<boolean> {
    const session = await ensureFreshSession();
    if (!session) {
        validatedRefreshToken = null;
        return false;
    }
    if (validatedRefreshToken === session.refreshToken) return true;
    try {
        await fetchCurrentUser();
        validatedRefreshToken = session.refreshToken;
        return true;
    } catch {
        validatedRefreshToken = null;
        return false;
    }
}
