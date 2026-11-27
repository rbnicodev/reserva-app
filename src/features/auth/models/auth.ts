export type OAuthProvider = "google" | "facebook" | "apple";

export interface OAuthLoginUrlResponse {
    login_url: string;
    state: string;
}

export interface PasswordLoginRequest {
    email: string;
    password: string;
    dispositivoId: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    usuario_id: number;
    email: string;
    nombre: string;
    local_id: number | null;
    es_god: boolean;
    permisos: string[];
}

export interface RefreshAccessTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface Session {
    accessToken: string;
    /** Epoch en ms en el que caduca el access token. */
    expiresAt: number;
    refreshToken: string;
    usuarioId: number;
    nombre: string;
    email: string;
    localId: number | null;
    esGod: boolean;
    permisos: string[];
}
