// =============================================
// FIREBASE.JS — Configuração e inicialização
// =============================================
firebase.initializeApp({
    apiKey: "AIzaSyCTTZcuVbsMq8_-GFeNtB7izPRrQis6aw4",
    authDomain: "projecthub-ae8e6.firebaseapp.com",
    projectId: "projecthub-ae8e6",
    storageBucket: "projecthub-ae8e6.firebasestorage.app",
    messagingSenderId: "617864726386",
    appId: "1:617864726386:web:a7608344eaeb7abfddffeb"
});

export const auth = firebase.auth();
export const db = firebase.firestore();
db.enablePersistence().catch(e => {});
