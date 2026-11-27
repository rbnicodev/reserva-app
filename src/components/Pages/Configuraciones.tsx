import { useEffect, useState, type FormEvent } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../Header";
import { Paths } from "../../utils/paths";
import { parametrosApi, type Parametro, type ParametroInput } from "../../features/admin/api/adminApi.ts";

const TIPOS = ["string", "integer", "boolean", "decimal"];

const FORM_VACIO: ParametroInput = { clave: "", valor: "", tipo: "string", tooltip: "" };

export default function Configuraciones() {
    const [parametros, setParametros] = useState<Parametro[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    // null = formulario cerrado; clave original = editando; "" = creando
    const [editando, setEditando] = useState<string | null>(null);
    const [form, setForm] = useState<ParametroInput>(FORM_VACIO);

    const cargar = async () => {
        setCargando(true);
        try {
            setParametros(await parametrosApi.listar());
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

    const abrirCrear = () => {
        setEditando("");
        setForm(FORM_VACIO);
        setMensaje(null);
    };

    const abrirEditar = (p: Parametro) => {
        setEditando(p.clave);
        setForm({ clave: p.clave, valor: p.valor, tipo: p.tipo, tooltip: p.tooltip ?? "" });
        setMensaje(null);
    };

    const guardar = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (editando === "") {
                await parametrosApi.crear({ ...form, clave: form.clave?.trim().toUpperCase() });
                setMensaje("Configuración creada");
            } else {
                await parametrosApi.actualizar(editando!, form);
                setMensaje("Configuración actualizada");
            }
            setEditando(null);
            await cargar();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const eliminar = async (p: Parametro) => {
        if (!window.confirm(`¿Eliminar la configuración ${p.clave}?`)) return;
        setError(null);
        try {
            await parametrosApi.eliminar(p.clave);
            setMensaje("Configuración eliminada");
            await cargar();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const headerComponent = Header(Paths.INDEX, "Configuraciones");

    return (
        <div className="d-flex flex-column" style={{ paddingBottom: "1em" }}>
            {headerComponent}

            <div style={{ paddingTop: "95px", paddingLeft: "5vw", paddingRight: "5vw" }}>
                <div className="card shadow-sm p-4 border-0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <p className="text-muted mb-0">Parámetros de configuración de tu local.</p>
                        <button type="button" className="btn btn-dark" onClick={abrirCrear}>
                            Nueva configuración
                        </button>
                    </div>

                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    {mensaje && <div className="alert alert-success py-2">{mensaje}</div>}

                    {editando !== null && (
                        <form className="border rounded p-3 mb-3 bg-light" onSubmit={guardar}>
                            <div className="row g-2">
                                <div className="col-md-4">
                                    <label className="form-label">Clave</label>
                                    <input
                                        className="form-control"
                                        required
                                        disabled={editando !== ""}
                                        maxLength={100}
                                        value={form.clave ?? ""}
                                        onChange={(e) => setForm({ ...form, clave: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Valor</label>
                                    <input
                                        className="form-control"
                                        required
                                        value={form.valor}
                                        onChange={(e) => setForm({ ...form, valor: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Tipo</label>
                                    <select
                                        className="form-select"
                                        value={form.tipo}
                                        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                                    >
                                        {TIPOS.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Descripción (tooltip)</label>
                                    <textarea
                                        className="form-control"
                                        rows={2}
                                        value={form.tooltip}
                                        onChange={(e) => setForm({ ...form, tooltip: e.target.value })}
                                    />
                                </div>
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
                                        <th>Clave</th>
                                        <th>Valor</th>
                                        <th>Tipo</th>
                                        <th>Descripción</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parametros.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted">Sin configuraciones</td>
                                        </tr>
                                    )}
                                    {parametros.map((p) => (
                                        <tr key={p.clave}>
                                            <td className="font-monospace small">{p.clave}</td>
                                            <td>{p.valor}</td>
                                            <td>{p.tipo}</td>
                                            <td className="small text-muted">{p.tooltip}</td>
                                            <td className="text-end text-nowrap">
                                                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => abrirEditar(p)}>
                                                    Editar
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => eliminar(p)}>
                                                    Eliminar
                                                </button>
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
