import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { db } from "~/firebase";
import { collection, getDocs } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css"; // 👈 Importamos Bootstrap

export default component$(() => {
  const users = useSignal<{ id: string; name: string }[]>([]);
  const navigate = useNavigate(); // 👈 Para redirigir al usuario seleccionado

  useTask$(async () => {
    const usersCollection = collection(db, "users");
    const userDocs = await getDocs(usersCollection);
    
    users.value = userDocs.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name ?? "Sin nombre" // Evita error si falta 'name'
    }));
  });

  return (
    <div class="container d-flex flex-column align-items-center min-vh-100 bg-light py-4">
      <h1 class="text-center mb-4">Selecciona tu usuario</h1>

      {users.value.length === 0 ? (
        <p class="text-secondary">Cargando usuarios...</p>
      ) : (
        <div class="row row-cols-2 row-cols-sm-3 g-3 w-100" style={{ maxWidth: "400px" }}>
          {users.value.map(user => (
            <div class="col" key={user.id}>
              <button
                class="btn btn-primary w-100 py-3"
                onClick$={() => navigate(`/reservations?userId=${user.id}`)} // 👈 Redirige con el userId
              >
                {user.name}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});