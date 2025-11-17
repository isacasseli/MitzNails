// js/admin-appointments.js
import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Elementos del HTML
const filtroSelect = document.getElementById("filtroEstado");
const tbody = document.getElementById("appointmentsBody");
const emptyRow = document.getElementById("appointmentsEmptyRow");

/**
 * Abre WhatsApp con mensaje prellenado.
 * numeroSinLada: "8991234567"
 */
function enviarWhatsApp(numeroSinLada, mensaje) {
  const lada = "52"; // 🇲🇽 México

  if (!numeroSinLada) {
    console.warn("No hay teléfono para enviar WhatsApp");
    return;
  }

  let numeroLimpio = numeroSinLada.replace(/\D/g, "");
  const textoCodificado = encodeURIComponent(mensaje);

  const url = `https://wa.me/${lada}${numeroLimpio}?text=${textoCodificado}`;
  window.open(url, "_blank");
}

/**
 * Confirma cita en Firestore y abre WhatsApp si la clienta lo pidió.
 */
async function confirmarCita(id, data) {
  try {
    await updateDoc(doc(db, "appointments", id), {
      status: "confirmed",
      status_updated_at: serverTimestamp()
    });

    console.log("Cita confirmada:", id);

    const quiereWhats = !!data.whatsapp;
    if (quiereWhats) {
      // starts_at viene como "YYYY-MM-DD HH:MM"
      let fecha = "";
      let hora = "";
      if (data.starts_at) {
        const partes = data.starts_at.split(" ");
        fecha = partes[0] || "";
        hora = partes[1] || "";
      }

      const mensaje = `Hola ${data.client_name || ""} 🌸\n\n` +
        `Tu cita en *Mitz Nails* ha sido *CONFIRMADA*.\n\n` +
        `📅 Fecha: ${fecha}\n` +
        `🕒 Hora: ${hora}\n` +
        `💅 Servicio: ${data.service_name || ""}\n\n` +
        `¡Te esperamos! ✨`;

      enviarWhatsApp(data.phone, mensaje);
    }
  } catch (error) {
    console.error("Error al confirmar cita:", error);
    alert("Ocurrió un error al confirmar la cita.");
  }
}

/**
 * Rechaza cita en Firestore y abre WhatsApp si la clienta lo pidió.
 */
async function rechazarCita(id, data) {
  try {
    const motivo = prompt("Motivo de cancelación (opcional):") || "";

    await updateDoc(doc(db, "appointments", id), {
      status: "rejected",
      status_updated_at: serverTimestamp(),
      cancel_reason: motivo
    });

    console.log("Cita rechazada:", id);

    const quiereWhats = !!data.whatsapp;
    if (quiereWhats) {
      let fecha = "";
      let hora = "";
      if (data.starts_at) {
        const partes = data.starts_at.split(" ");
        fecha = partes[0] || "";
        hora = partes[1] || "";
      }

      const mensaje = `Hola ${data.client_name || ""} 🌸\n\n` +
        `Lamentamos informarte que tu cita en *Mitz Nails* del día ${fecha} a las ${hora} ha sido *CANCELADA*.\n` +
        (motivo ? `\nMotivo: ${motivo}\n` : "") +
        `\nPor favor contáctanos para reprogramarla. 💅`;

      enviarWhatsApp(data.phone, mensaje);
    }
  } catch (error) {
    console.error("Error al rechazar cita:", error);
    alert("Ocurrió un error al rechazar la cita.");
  }
}

/**
 * Dibuja las filas de la tabla de citas.
 */
function renderAppointments(snapshot) {
  tbody.innerHTML = "";

  if (snapshot.empty) {
    emptyRow.style.display = "table-row";
    return;
  }

  emptyRow.style.display = "none";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const tr = document.createElement("tr");

    // created_at puede ser Timestamp o puede no existir
    let fechaCreacion = "-";
    if (data.created_at && data.created_at.toDate) {
      const d = data.created_at.toDate();
      fechaCreacion = d.toLocaleString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    let fechaCita = "-";
    let horaCita = "-";
    if (data.starts_at) {
      const partes = data.starts_at.split(" ");
      fechaCita = partes[0] || "-";
      horaCita = partes[1] || "-";
    }

    const estado = data.status || "pending";

    tr.innerHTML = `
      <td>${fechaCreacion}</td>
      <td>${fechaCita}</td>
      <td>${horaCita}</td>
      <td>${data.client_name || "-"}</td>
      <td>${data.phone || "-"}</td>
      <td>${data.service_name || "-"}</td>
      <td>${estado}</td>
      <td>${data.notes || ""}</td>
      <td class="text-nowrap"></td>
    `;

    const actionsTd = tr.lastElementChild;

    // Botón Confirmar
    const btnConfirmar = document.createElement("button");
    btnConfirmar.className = "btn btn-sm btn-outline-success mr-2";
    btnConfirmar.textContent = "Confirmar";
    btnConfirmar.onclick = () => confirmarCita(docSnap.id, data);

    // Botón Rechazar
    const btnRechazar = document.createElement("button");
    btnRechazar.className = "btn btn-sm btn-outline-danger";
    btnRechazar.textContent = "Rechazar";
    btnRechazar.onclick = () => rechazarCita(docSnap.id, data);

    actionsTd.appendChild(btnConfirmar);
    actionsTd.appendChild(btnRechazar);

    tbody.appendChild(tr);
  });
}

/**
 * Empieza a escuchar las citas de la colección "appointments"
 * con filtro opcional por estado.
 */
let unsubscribe = null;

function escucharCitas() {
  const estado = filtroSelect ? filtroSelect.value : "todas";

  const baseRef = collection(db, "appointments");
  let q;

  if (estado === "todas") {
    q = query(baseRef, orderBy("created_at", "desc"));
  } else {
    q = query(
      baseRef,
      where("status", "==", estado),
      orderBy("created_at", "desc")
    );
  }

  if (unsubscribe) {
    unsubscribe();
  }

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      renderAppointments(snapshot);
    },
    (error) => {
      console.error("Error cargando citas:", error);
      tbody.innerHTML = "";
      emptyRow.style.display = "table-row";
      emptyRow.firstElementChild.textContent =
        "Error al cargar las citas. Intenta de nuevo.";
    }
  );
}

// Verifica que haya alguien logueado (idealmente admin)
auth.onAuthStateChanged((user) => {
  if (!user) {
    // Si quieres, mándalo a login
    // window.location.href = "login.html";
    console.warn("No hay usuario logueado, pero se intentó cargar el panel admin.");
  } else {
    escucharCitas();
    if (filtroSelect) {
      filtroSelect.addEventListener("change", () => escucharCitas());
    }
  }
});
