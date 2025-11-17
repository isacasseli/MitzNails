// js/citas-clientas.js
import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Elementos del HTML
const filtroSelect = document.getElementById("filtroEstado");
const tbody = document.getElementById("citasBody");
const emptyRow = document.getElementById("citasEmptyRow");

let unsubscribe = null;

// Dibuja las filas de la tabla
function renderCitas(snapshot) {
  tbody.innerHTML = "";

  if (snapshot.empty) {
    emptyRow.style.display = "table-row";
    return;
  }

  emptyRow.style.display = "none";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const tr = document.createElement("tr");

    const fecha = data.fecha || "-";
    const hora = data.hora || "-";
    const servicio = data.servicio || "-";
    const precio = data.precio ? `$${data.precio}` : "-";
    const estado = data.estado || "-";
    const notas = data.notas || "";

    tr.innerHTML = `
      <td>${fecha}</td>
      <td>${hora}</td>
      <td>${servicio}</td>
      <td>${precio}</td>
      <td>${estado}</td>
      <td>${notas}</td>
    `;

    tbody.appendChild(tr);
  });
}

// Escuchar citas del usuario según filtro
function escucharCitas(user) {
  const estado = filtroSelect.value;
  const baseRef = collection(db, "citas");

  let q;

  if (estado === "Todas") {
    q = query(
      baseRef,
      where("clienteUid", "==", user.uid),
      orderBy("fecha", "desc")
    );
  } else {
    q = query(
      baseRef,
      where("clienteUid", "==", user.uid),
      where("estado", "==", estado),
      orderBy("fecha", "desc")
    );
  }

  if (unsubscribe) {
    unsubscribe();
  }

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      renderCitas(snapshot);
    },
    (error) => {
      console.error("Error cargando citas:", error);
      tbody.innerHTML = "";
      emptyRow.style.display = "table-row";
      emptyRow.firstElementChild.textContent =
        "Error al cargar tus citas. Intenta de nuevo.";
    }
  );
}

// Cuando sepamos quién está logueado
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  escucharCitas(user);
  filtroSelect.addEventListener("change", () => escucharCitas(user));
});
