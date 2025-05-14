import { addDoc, collection, deleteField, doc, getDoc, getDocs, or, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import type { GlobalSettings } from "../models/GlobalSettings";
import type { Shift } from "../models/Shift";
import type { Menu } from "../models/Menu";
import type { Price } from "../models/Price";
import type { Reservation } from "../models/Reservation";
import type { BoardEntry } from "../models/BoardEntry";
import { encrypt } from "./cryptoUtils";
import type { PayUser, User } from "../models/User";
import type { Payment, PaymentForUser } from "../models/Payment";

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

export const userReservations = async (userId: string) : Promise<Reservation[] | null> => {
  const reservationsCollection = collection(db, "reservations");
      const reservationsQuery = query(reservationsCollection, where("userId", "==", userId));
      const reservationsDocs = await getDocs(reservationsQuery);

      return (reservationsDocs.docs.map(doc => {
        const result: Reservation = {id: doc.id};
        return {...result, ...doc.data()}
      }))
}

export const allPrices = async (): Promise<Price[] | null> => {
  const menuRef = collection(db, "prices");
  const menuQuery = query(menuRef);
  const snapShot = await getDocs(menuQuery);

  return (snapShot.docs.map(doc => {
    const result: Price = {id: doc.id};
    return {...result, ...doc.data()};
  }));
}

export const allEntries = async (): Promise<BoardEntry[]> => {
  const menuRef = collection(db, "boardEntries");
  const menuQuery = query(menuRef);
  const snapShot = await getDocs(menuQuery);

  return snapShot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "",
      subtitle: data.subtitle || "",
      content: data.content || "",
      order: data.order || 0,
      footer: data.footer,
      imageUrl: data.imageUrl,
    } as BoardEntry;
  });
};

export const setPassword = async (payUser: string, pass: string): Promise<boolean> => {
  try {
    const encryptedPass = encrypt(pass);

    const userRef = doc(db, "payUsers", payUser);
    const snapShot = await getDoc(userRef);
    if (!snapShot) {
      console.error("Usuario no encontrado");
      return false;
    }

    await setDoc(doc(db, "payUsers", snapShot.id), {
      ...snapShot.data(),
      password: encryptedPass
    });

    return true;
  } catch (error) {
    console.error("Error en setPassword:", error);
    return false;
  }
};

export const resetPassword = async (userId: string): Promise<boolean> => {
  try {
      await updateDoc(doc(db, "payUsers", userId), {
          password: deleteField()
      });
      return true;
  } catch (error) {
      console.error("Error reseteando la contraseña:", error);
      return false;
  }
};

export const findPassByUser = async (payUser: string): Promise<string | null> => {
  try {
    const userRef = doc(db, "payUsers", payUser);
    const snapShot = await getDoc(userRef);

    if (!snapShot) {
      console.error("Usuario no encontrado");
      return null;
    }

    const data: PayUser = {
      ...snapShot.data()
    };
    return data.password || null;
  } catch (error) {
    console.error("Error en findPassByUser:", error);
    return null;
  }
};

export const loggin = async (payUser: string, pass: string): Promise<boolean> => {
  try {

    const encryptedPass = encrypt(pass);
    const storedPass = await findPassByUser(payUser);

    if (!storedPass) {
      console.error("Contraseña no encontrada");
      return false;
    }

    return storedPass === encryptedPass;
  } catch (error) {
    console.error("Error en loggin:", error);
    return false;
  }
};
export const hasPayAccess = async (payUser: string): Promise<boolean> => {
  try {
    const userRef = doc(db, "payUsers", payUser);
    const snapShot = await getDoc(userRef);

    if (!snapShot) {
      console.error("Usuario no encontrado en payUsers");
      return false;
    }

    const data = snapShot.data();
    
    return !!data?.password;
  } catch (error) {
    console.error("Error en hasAccess:", error);
    return false;
  }
};

export const canPayAccess = async (userId: string): Promise<boolean> => {


  if (!userId) {
    console.error("Error: El userId es undefined o vacío");
    return false;
  }

  try {
    const payAccessRef = collection(db, "payAcces");
    const q = query(payAccessRef, where("payUser", "==", userId));

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error en canPayAccess:", error);
    return false;
  }
};


export const findPaymentsByUser = async (user: string): Promise<Payment[]> => {
  try {
    const paymentsRef = collection(db, "payments");

    const creatorQuery = query(paymentsRef, where("payUserCreator", "==", user));
    const allowedQuery = query(paymentsRef, where("payUsersAllowed", "array-contains", user));

    const [creatorSnapshot, allowedSnapshot] = await Promise.all([
      getDocs(creatorQuery),
      getDocs(allowedQuery)
    ]);

    const paymentsMap = new Map<string, Payment>();

    creatorSnapshot.forEach(doc => {
      paymentsMap.set(doc.id, { id: doc.id, ...(doc.data() as Payment) });
    });

    allowedSnapshot.forEach(doc => {
      if (!paymentsMap.has(doc.id)) {
        paymentsMap.set(doc.id, { id: doc.id, ...(doc.data() as Payment) });
      }
    });

    return Array.from(paymentsMap.values());
  } catch (error) {
    console.error("Error en findPaymentsByUser:", error);
    return [];
  }
};

 export const findPaymentsForUserByPayment = async (payment: string): Promise<PaymentForUser[]> => {
  const paymentsForUserRef = collection(db, "paymentsForUser");
  const queryRef = query(paymentsForUserRef, where("idPayment", "==", payment));

  const snapshot = await getDocs(queryRef);

  return snapshot.docs.map( doc => ({
    id: doc.id,
    ...doc.data()
  } as PaymentForUser));
 }

 export const allUsers = async(): Promise<User[]> => {
  const usersRef = collection(db, "users");

  const snapshot = await getDocs(usersRef);

  return snapshot.docs.map( doc => ({
    id: doc.id,
    ...doc.data()
  } as User));
 }

 export const allPayUsers = async(): Promise<User[]> => {
  const usersRef = collection(db, "payUsers");

  const snapshot = await getDocs(usersRef);

  return snapshot.docs.map( doc => ({
    id: doc.id,
    ...doc.data()
  } as User));
 }

 export const saveAllPaymentsForUsers = async (items: PaymentForUser[]): Promise<void> => {
    const colRef = collection(db, "paymentsForUser");

    const savePromises = items.map(async (item) => {
        const dataToSave = {
            idPayment: item.idPayment,
            idUser: item.idUser,
            amount: item.amount,
            paid: item.paid
        };

        if (item.id) {
            // Actualiza documento existente
            const docRef = doc(db, "paymentsForUser", item.id);
            await setDoc(docRef, dataToSave, { merge: true });
        } else {
            // Crea nuevo documento
            const docRef = await addDoc(colRef, dataToSave);
            item.id = docRef.id; // opcional: asignar el id al objeto original
        }
    });

    await Promise.all(savePromises);
};

export const savePaymentForUser = async (item: PaymentForUser): Promise<void> => {
    const dataToSave = {
        idPayment: item.idPayment,
        idUser: item.idUser,
        amount: item.amount,
        paid: item.paid
    };

    if (item.id) {
        // Actualizar documento existente
        const docRef = doc(db, "paymentsForUser", item.id);
        await setDoc(docRef, dataToSave, { merge: true });
    } else {
        // Crear nuevo documento
        const colRef = collection(db, "paymentsForUser");
        const docRef = await addDoc(colRef, dataToSave);
        item.id = docRef.id; // opcional: asignar ID generado
    }
};