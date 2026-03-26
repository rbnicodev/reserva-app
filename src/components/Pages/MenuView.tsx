import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { allMenus, allShifts, allPrices } from "../../utils/firebaseUtils"; 
import { Paths } from "../../utils/paths";
import Header from ".././Header";
import type { Shift } from "../../models/Shift";
import type { Menu } from "../../models/Menu";
import type { Price } from "../../models/Price";


// Interfaz para el estado combinado
interface MenuCardData {
    shiftName: string;
    menu: Menu;
    price: number | string;
}

export default function MenuView() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get("userId");

    const [loading, setLoading] = useState<boolean>(true);
    const [menuData, setMenuData] = useState<MenuCardData[]>([]);

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchData = async () => {
            try {
                // 1. Obtenemos los datos (permitiendo que sean null temporalmente)
                const [rawShifts, rawMenus, rawPrices] = await Promise.all([
                allShifts(),
                allMenus(),
                allPrices()
                ]);

                // 2. Validamos y convertimos a arrays vacíos si son null
                const shifts: Shift[] = rawShifts ?? [];
                const menus: Menu[] = rawMenus ?? [];
                const prices: Price[] = rawPrices ?? [];

                // 3. Mapeo de datos para la vista
                const combined: MenuCardData[] = shifts
                .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
                .map(shift => {
                    const menu = menus.find(m => m.shiftId === shift.id);
                    const price = prices.find(p => p.id === menu?.priceId);
                    
                    // Solo devolvemos el objeto si existe un menú para este turno
                    if (!menu) return null;

                    return {
                    shiftName: shift.name || "Sin nombre",
                    menu: menu,
                    price: price?.amount ?? "Consultar"
                    };
                })
                .filter((item): item is MenuCardData => item !== null); // Filtro Type Guard para TS

                setMenuData(combined);
            } catch (error) {
                console.error("Error al cargar la carta:", error);
            } finally {
                setLoading(false);
            }
            };

        fetchData();
    }, []);

    const backPath = Paths.INDEX;

    return (
        <div className="w-100 d-flex flex-column align-items-center">
            {/* Invocamos el Header como función según tu código original */}
            {Header(backPath, "Carta de Menús")}

            <div style={{ paddingTop: "95px", paddingBottom: "40px", width: "90vw" }}>
                {loading ? (
                    <p className="text-secondary text-center" style={{ paddingTop: "70px" }}>
                        Cargando carta...
                    </p>
                ) : menuData.length > 0 ? (
                    menuData.map((item, index) => (
                        <div key={index} className="card shadow-sm mb-4 border-0">
                            {/* Header del plato con el nombre del turno y el precio */}
                            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center" style={{ borderRadius: "8px 8px 0 0" }}>
                                <h5 className="mb-0"><strong>{item.shiftName}</strong></h5>
                                <span className="badge bg-dark text-white fs-6 fw-bold">
                                    {typeof item.price === 'number' 
                                    ? `${item.price.toFixed(2)} €` 
                                    : item.price}
                                </span>
                            </div>
                            
                            <div className="card-body bg-white" style={{ borderRadius: "0 0 8px 8px" }}>
                                {/* Entrantes */}
                                <div className="mb-3">
                                    <label className="text-muted small text-uppercase fw-bold">Entrantes</label>
                                    <p className="mb-0">{item.menu.incomings?.join(", ") || "No definidos"}</p>
                                </div>

                                <hr className="my-2 opacity-25" />

                                {/* Plato Principal con lógica de opciones | */}
                                <div className="mb-3">
                                    <label className="text-muted small text-uppercase fw-bold">Plato Principal</label>
                                    <div className="mt-1">
                                        {item.menu.mainPlate?.includes("|") ? (
                                            <ul className="list-unstyled mb-0">
                                                {item.menu.mainPlate.split("|").map((plate, i) => (
                                                    <li key={i} className="text-dark">• {plate.trim()}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="mb-0">{item.menu.mainPlate}</p>
                                        )}
                                    </div>
                                </div>

                                <hr className="my-2 opacity-25" />

                                {/* Postre */}
                                <div>
                                    <label className="text-muted small text-uppercase fw-bold">Postre</label>
                                    <p className="mb-0">{item.menu.dessert || "No definido"}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-5">
                        <p className="text-secondary">No hay menús configurados.</p>
                    </div>
                )}
            </div>
        </div>
    );
}