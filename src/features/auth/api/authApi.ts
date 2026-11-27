import type { LoginResponse, OAuthLoginUrlResponse, OAuthProvider, PasswordLoginRequest } from "../models/auth";

const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...init?.headers },
    });

    if (!response.ok) {
        throw new Error(`Error ${response.status} en ${path}`);
    }

    return response.json() as Promise<T>;
}

export function loginWithPassword(body: PasswordLoginRequest): Promise<LoginResponse> {
    return request<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: body.email,
            password: body.password,
            dispositivo_id: body.dispositivoId,
        }),
    });
}

export function getOAuthLoginUrl(provider: OAuthProvider): Promise<OAuthLoginUrlResponse> {
    return request<OAuthLoginUrlResponse>(`/api/auth/oauth/${provider}/login`);
}

export function exchangeOAuthCode(
    provider: OAuthProvider,
    code: string,
    state: string,
    dispositivoId: string,
): Promise<LoginResponse> {
    return request<LoginResponse>(`/api/auth/oauth/${provider}/callback`, {
        method: "POST",
        body: JSON.stringify({ code, state, dispositivo_id: dispositivoId }),
    });
}
