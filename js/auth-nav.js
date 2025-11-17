// js/auth-nav.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // Link del navbar que dice "Iniciar sesión"
  // (puede ser por id o por href)
  const loginLink =
    document.getElementById("nav-login-link") ||
    document.querySelector('.navbar-nav a[href="login.html"]');

  if (!loginLink) return;

  const originalText = loginLink.textContent || "Iniciar sesión";

  onAuthStateChanged(auth, async (user) => {
    // Si NO hay sesión → se queda como "Iniciar sesión"
    if (!user) {
      loginLink.textContent = originalText;
      loginLink.href = "login.html";
      return;
    }

    try {
      // Leer el rol desde Firestore
      const snap = await getDoc(doc(db, "users", user.uid));
      const role = snap.exists() ? (snap.data().role || "cliente") : "cliente";

      // Cambiar texto y destino
      loginLink.textContent = "Mi perfil";
      loginLink.href = role === "admin" ? "admin.html" : "clientas.html";
    } catch (err) {
      console.error("Error obteniendo rol en navbar:", err);
      // Si falla, al menos sigue mandando a algún panel
      loginLink.textContent = "Mi perfil";
      loginLink.href = "clientas.html";
    }
  });
});
