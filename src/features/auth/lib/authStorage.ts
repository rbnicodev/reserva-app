import type { LoginResponse, OAuthProvider, Session } from "../models/auth";

const DEVICE_ID_KEY = "aljawas.dispositivoId";
const SESSION_KEY = "aljawas.session";
const OAUTH_STATE_KEY = "aljawas.oauthState";

export function getDeviceId(): string {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
}

export function saveSession(login: LoginResponse): void {
    persistSession({
        accessToken: login.access_token,
        expiresAt: Date.now() + login.expires_in * 1000,
        refreshToken: login.refresh_token,
        usuarioId: login.usuario_id,
        nombre: login.nombre,
        email: login.email,
        localId: login.local_id,
        esGod: login.es_god,
        permisos: login.permisos ?? [],
    });
}

export function persistSession(session: Session): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
}

export function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}

export function saveOAuthState(provider: OAuthProvider, state: string): void {
    sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify({ provider, state }));
}

/** Devuelve el state guardado y lo elimina para que solo se pueda usar una vez. */
export function consumeOAuthState(): { provider: OAuthProvider; state: string } | null {
    const raw = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    return raw ? (JSON.parse(raw) as { provider: OAuthProvider; state: string }) : null;
}
