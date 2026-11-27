export type OAuthProvider = "google" | "facebook" | "apple";

export interface OAuthLoginUrlResponse {
    login_url: string;
    state: string;
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
}

export interface Session {
    accessToken: string;
    refreshToken: string;
    usuarioId: number;
    nombre: string;
    email: string;
    localId: number | null;
    esGod: boolean;
}
