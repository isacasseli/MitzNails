// js/firebase.js

// Importa módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC1WWxWsayScdJaUTto3DB6pfMOXVDJvEg",
  authDomain: "mitznails-a3ccd.firebaseapp.com",
  projectId: "mitznails-a3ccd",
  storageBucket: "mitznails-a3ccd.firebasestorage.app",
  messagingSenderId: "214941568619",
  appId: "1:214941568619:web:aeb9f42c08654139ecab2e"
  // measurementId opcional si lo tienes
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa servicios
const auth = getAuth(app);
const db = getFirestore(app);

// ► IMPORTANTE: Mantener sesión aunque cambie de página o reinicie navegador
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Sesión persistente activada en localStorage.");
  })
  .catch((error) => {
    console.error("Error configurando persistencia:", error);
  });

// Exportar para usar en todas las páginas
export { app, auth, db };
