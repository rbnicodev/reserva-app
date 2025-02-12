import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { GlobalSettings } from "../models/GlobalSettings";
import type { Shift } from "../models/Shift";
import type { Menu } from "../models/Menu";
import type { Price } from "../models/Price";
import type { Reservation } from "../models/Reservation";

// Función para obtener las configuraciones globales desde Firestore
export const fetchGlobalSettings = async (): Promise<GlobalSettings | null> => {
  try {
    const docRef = doc(db, "constants", "constants");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const result: GlobalSettings = {
        global_name: data.global_name ?? "",
        limit_delete: data.limit_delete?.toDate() ?? new Date(0),
        max_reservations: data.max_reservations ?? 0,
      };

      return result;
    } else {
      console.warn("No se encontró el documento de configuración global.");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo configuraciones globales:", error);
    return null;
  }
};

export const allShifts = async (): Promise<Shift[] | null> => {
  const shiftRef = collection(db, "shifts");
  const shiftQuery = query(shiftRef);
  const snapShot = await getDocs(shiftQuery);

  return (snapShot.docs.map(doc => {
    const result: Shift = {id: doc.id};
    return {...result, ...doc.data()};
  }));
}

export const allMenus = async (): Promise<Menu[] | null> => {
  const menuRef = collection(db, "menus");
  const menuQuery = query(menuRef);
  const snapShot = await getDocs(menuQuery);

  return (snapShot.docs.map(doc => {
    const result: Menu = {id: doc.id};
    return {...result, ...doc.data()};
  }));
}

export const totalReservations = async (shiftId: string): Promise<number> => {
    if (!shiftId) return 0;
    const reservationsRef = collection(db, "reservations");
    const reservationsQuery = query(reservationsRef, where("shiftId", "==", shiftId));
  
    const snapshot = await getDocs(reservationsQuery);
    const result: number = snapshot.docs.map( doc => doc.data()).reduce( (acc, res) => {
      acc = acc + res.guests;
      return acc;
    }, 0);

    return result;
}

export const restReservations = async (shiftId: string): Promise<number> => {
    if (!shiftId) return 0;
    const currentReservations = await totalReservations(shiftId);
    const maxReservations = (await fetchGlobalSettings())?.max_reservations || 0;

    const result = currentReservations <= maxReservations ? maxReservations - currentReservations : 0;
    return result;
}

export const allPrices = async (): Promise<Price[]> => {
  const pricesRef = collection(db, "prices");
  const pricesQuery = query(pricesRef);
  const prices = (await getDocs(pricesQuery)).docs.map( doc => {
    return {
      id: doc.data().id,
      amount: doc.data().amount
    }
  });
  return prices;
}

export const priceByReservation = async (reservationId: string): Promise<Number | undefined> => {
  let docRef = doc(db, "reservations", reservationId);
  let docSnap = await getDoc(docRef);
  const reservation: Reservation = {
    id: docSnap.id,
    ...docSnap.data()
  };

  docRef = doc(db, "shifts", (reservation.shiftId as string));
  docSnap = await getDoc(docRef);
  const shift: Shift = {
    id: docSnap.id,
    ...docSnap.data()
  };

  const menusRef = collection(db, "menus");
  const menusQuery = query(menusRef, where("shiftId", "==", shift.id));

  const menu: Menu | undefined = (await getDocs(menusQuery)).docs.map( doc => {
    return {
      id: doc.id,
    ...doc.data()
    } as Menu
  }).find( m => m.shiftId === shift.id);
  

  let pricesRef = doc(db, "prices", menu? menu.priceId as string : "");
  let pricesSnap = await getDoc(pricesRef);

  return (pricesSnap.data() as Price).amount;
}
