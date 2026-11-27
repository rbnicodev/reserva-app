import { authorizedFetch } from "../../auth/lib/session.ts";
import { getSession } from "../../auth/lib/authStorage.ts";

export type Parametro = {
    clave: string;
    valor: string;
    tipo: string;
    tooltip: string | null;
};

export type Perfil = {
    id: number;
    nombre: string;
    descripcion: string | null;
};

export type Usuario = {
    id: number;
    nombre: string;
    email: string;
    perfilId: number | null;
    activo: boolean;
};

export type ParametroInput = {
    clave?: string;
    valor: string;
    tipo: string;
    tooltip: string;
};

export type UsuarioInput = {
    nombre: string;
    email: string;
    perfilId: number | null;
    activo?: boolean;
};

/** El backend resuelve el local del usuario; solo el god necesita indicarlo explícitamente. */
function conLocal(path: string): string {
    const localId = getSession()?.localId;
    if (localId == null) return path;
    return `${path}${path.includes("?") ? "&" : "?"}localId=${localId}`;
}

async function extraerData<T>(response: Response): Promise<T> {
    const body = await response.json().catch(() => null);
    if (!response.ok || body?.success === false) {
        throw new Error(body?.message ?? `Error ${response.status}`);
    }
    return body?.data as T;
}

const jsonInit = (method: string, body?: unknown): RequestInit => ({
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
});

export const parametrosApi = {
    listar: async () => extraerData<Parametro[]>(await authorizedFetch(conLocal("/api/parametros"))),
    crear: async (dto: ParametroInput) =>
        extraerData<Parametro>(await authorizedFetch(conLocal("/api/parametros"), jsonInit("POST", dto))),
    actualizar: async (clave: string, dto: ParametroInput) =>
        extraerData<Parametro>(
            await authorizedFetch(conLocal(`/api/parametros/${encodeURIComponent(clave)}`), jsonInit("PUT", dto))
        ),
    eliminar: async (clave: string) =>
        extraerData<null>(
            await authorizedFetch(conLocal(`/api/parametros/${encodeURIComponent(clave)}`), { method: "DELETE" })
        ),
};

export const usuariosApi = {
    listar: async () => extraerData<Usuario[]>(await authorizedFetch("/api/users")),
    perfiles: async () => extraerData<Perfil[]>(await authorizedFetch(conLocal("/api/perfiles"))),
    crear: async (dto: UsuarioInput & { password: string }) => {
        const localId = getSession()?.localId ?? null;
        return extraerData<Usuario>(await authorizedFetch("/api/users", jsonInit("POST", { ...dto, localId })));
    },
    actualizar: async (id: number, dto: UsuarioInput) =>
        extraerData<Usuario>(await authorizedFetch(`/api/users/${id}`, jsonInit("PUT", dto))),
    desactivar: async (id: number) =>
        extraerData<null>(await authorizedFetch(`/api/users/${id}`, { method: "DELETE" })),
};
