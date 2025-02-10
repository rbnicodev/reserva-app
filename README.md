# 🌟 **Aljawas - Gestión de Reservas**  

🚀 Aplicación web para gestionar reservas de manera sencilla.  

📍 **URL en producción:** [aljawas-a3504.web.app](https://aljawas-a3504.web.app)  

## 🛠 **Requisitos previos**  
Antes de empezar, asegúrate de tener instalado:  
- [Node.js](https://nodejs.org/) (recomendado v18+)  
- [npm](https://www.npmjs.com/) o [pnpm](https://pnpm.io/) (opcional)  

## 🚀 **Cómo arrancar el proyecto**  

1️⃣ **Clona el repositorio:**  
```bash
git clone https://github.com/tu-usuario/aljawas.git
cd aljawas
```

2️⃣ **Instala las dependencias:**  
```bash
npm install
```
(O usa `pnpm install` si prefieres pnpm)  

3️⃣ **Configura Firebase:**  
El archivo `firebase.ts` contiene la configuración de Firebase. **Para mayor seguridad, no lo subas al repositorio** (`.gitignore`).  

Ejemplo de `firebase.ts`:  
```ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

4️⃣ **Inicia el servidor de desarrollo:**  
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:4321/` (o el puerto que use Astro).  

## 📂 **Estructura del proyecto**  
```
/src
 ├── components/     # Componentes reutilizables
 ├── pages/          # Páginas principales de la app
 ├── styles/         # Archivos de estilos
 ├── firebase.ts     # Configuración de Firebase (ignorar en Git)
 ├── app.tsx         # Entrada principal de la aplicación
```

## 🌍 **Despliegue en Firebase Hosting**  
Si quieres desplegar la app en Firebase Hosting, sigue estos pasos:  

1. Inicia sesión en Firebase CLI:  
   ```bash
   firebase login
   ```
2. Configura el proyecto (si no está configurado aún):  
   ```bash
   firebase init hosting
   ```
3. Genera los archivos de producción:  
   ```bash
   npm run build
   ```
4. Despliega la aplicación:  
   ```bash
   firebase deploy
   ```

## 🛠 **Extras y mejoras**  
- ✅ Soporte para dispositivos móviles  
- ✅ Uso de Bootstrap para un diseño limpio y responsive  
- ✅ Integración con Firebase Firestore  
- ✅ Configuración de constantes globales en Firestore (`constants` collection)  

---

⚡ **Desarrollado con Astro + Firebase** | 🚀 _Happy coding!_
