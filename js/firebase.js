// js/firebase.js

// Importa el núcleo de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// 👉 Usa la misma config que ya tenías en app.js
const firebaseConfig = {
  apiKey: "AIzaSyC1WWxWsayScdJaUTto3DB6pfMOXVDJvEg",
  authDomain: "mitznails-a3ccd.firebaseapp.com",
  projectId: "mitznails-a3ccd",
  storageBucket: "mitznails-a3ccd.firebasestorage.app",
  messagingSenderId: "214941568619",
  appId: "1:214941568619:web:aeb9f42c08654139ecab2e"
  // si en tu Firebase sale measurementId también, lo puedes agregar aquí
  // measurementId: "XXXXX"
};

// Inicializa la app
const app = initializeApp(firebaseConfig);

// Servicios que vas a usar
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta para poder usarlos en login.html y registro.html
export { app, auth, db };
