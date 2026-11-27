import { useEffect, useState, type FormEvent } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../Header";
import { Paths } from "../../utils/paths";
import { usuariosApi, type Perfil, type Usuario } from "../../features/admin/api/adminApi.ts";

type FormUsuario = { nombre: string; email: string; password: string; perfilId: number | null; activo: boolean };

const FORM_VACIO: FormUsuario = { nombre: "", email: "", password: "", perfilId: null, activo: true };

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [perfiles, setPerfiles] = useState<Perfil[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    // null = formulario cerrado; "nuevo" = alta; id = edición
    const [editando, setEditando] = useState<number | "nuevo" | null>(null);
    const [form, setForm] = useState<FormUsuario>(FORM_VACIO);

    const cargar = async () => {
        setCargando(true);
        try {
            const [listaUsuarios, listaPerfiles] = await Promise.all([usuariosApi.listar(), usuariosApi.perfiles()]);
            setUsuarios(listaUsuarios);
            setPerfiles(listaPerfiles);
            setError(null);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        cargar();
    }, []);

    const nombrePerfil = (perfilId: number | null) =>
        perfiles.find((p) => p.id === perfilId)?.nombre ?? "—";

    const abrirCrear = () => {
        setEditando("nuevo");
        setForm({ ...FORM_VACIO, perfilId: perfiles[0]?.id ?? null });
        setMensaje(null);
    };

    const abrirEditar = (u: Usuario) => {
        setEditando(u.id);
        setForm({ nombre: u.nombre, email: u.email, password: "", perfilId: u.perfilId, activo: u.activo });
        setMensaje(null);
    };

    const guardar = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (editando === "nuevo") {
                await usuariosApi.crear({
                    nombre: form.nombre,
                    email: form.email,
                    password: form.password,
                    perfilId: form.perfilId,
                });
                setMensaje("Usuario creado. Deberá cambiar la contraseña en su primer inicio de sesión.");
            } else if (editando !== null) {
                await usuariosApi.actualizar(editando, {
                    nombre: form.nombre,
                    email: form.email,
                    perfilId: form.perfilId,
                    activo: form.activo,
                });
                setMensaje("Usuario actualizado");
            }
            setEditando(null);
            await cargar();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const desactivar = async (u: Usuario) => {
        if (!window.confirm(`¿Desactivar al usuario ${u.nombre}?`)) return;
        setError(null);
        try {
            await usuariosApi.desactivar(u.id);
            setMensaje("Usuario desactivado");
            await cargar();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const headerComponent = Header(Paths.INDEX, "Usuarios");

    return (
        <div className="d-flex flex-column" style={{ paddingBottom: "1em" }}>
            {headerComponent}

            <div style={{ paddingTop: "95px", paddingLeft: "5vw", paddingRight: "5vw" }}>
                <div className="card shadow-sm p-4 border-0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <p className="text-muted mb-0">Usuarios de tu local.</p>
                        <button type="button" className="btn btn-dark" onClick={abrirCrear}>
                            Nuevo usuario
                        </button>
                    </div>

                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    {mensaje && <div className="alert alert-success py-2">{mensaje}</div>}

                    {editando !== null && (
                        <form className="border rounded p-3 mb-3 bg-light" onSubmit={guardar}>
                            <div className="row g-2">
                                <div className="col-md-6">
                                    <label className="form-label">Nombre</label>
                                    <input
                                        className="form-control"
                                        required
                                        maxLength={100}
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Perfil</label>
                                    <select
                                        className="form-select"
                                        required
                                        value={form.perfilId ?? ""}
                                        onChange={(e) => setForm({ ...form, perfilId: Number(e.target.value) })}
                                    >
                                        <option value="" disabled>Selecciona un perfil</option>
                                        {perfiles.map((p) => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                {editando === "nuevo" ? (
                                    <div className="col-md-6">
                                        <label className="form-label">Contraseña inicial</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <div className="col-md-6 d-flex align-items-end">
                                        <div className="form-check">
                                            <input
                                                id="usuario-activo"
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={form.activo}
                                                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                                            />
                                            <label htmlFor="usuario-activo" className="form-check-label">Activo</label>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="d-flex gap-2 justify-content-end mt-3">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setEditando(null)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-dark">Guardar</button>
                            </div>
                        </form>
                    )}

                    {cargando ? (
                        <div className="d-flex justify-content-center py-4">
                            <div className="spinner-border text-secondary" role="status"></div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Perfil</th>
                                        <th>Estado</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted">Sin usuarios</td>
                                        </tr>
                                    )}
                                    {usuarios.map((u) => (
                                        <tr key={u.id}>
                                            <td>{u.nombre}</td>
                                            <td>{u.email}</td>
                                            <td>{nombrePerfil(u.perfilId)}</td>
                                            <td>
                                                <span className={`badge ${u.activo ? "bg-success" : "bg-secondary"}`}>
                                                    {u.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="text-end text-nowrap">
                                                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => abrirEditar(u)}>
                                                    Editar
                                                </button>
                                                {u.activo && (
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => desactivar(u)}>
                                                        Desactivar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
