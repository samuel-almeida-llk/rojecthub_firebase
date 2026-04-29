// =============================================
// AUTH.JS — Login, Registro, Google OAuth, Reset
// =============================================
import { auth, db } from '../config/firebase.js';
import { showToast } from '../utils/toast.js';
import * as store from './store.js';

export function showAuthForm(f) {
    document.getElementById('login-form').style.display = f === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = f === 'register' ? 'block' : 'none';
    document.getElementById('reset-form').style.display = f === 'reset' ? 'block' : 'none';
    document.querySelectorAll('.auth-error,.auth-success').forEach(e => e.classList.remove('visible'));
}

export function togglePassword(id, btn) {
    const i = document.getElementById(id);
    i.type = i.type === 'password' ? 'text' : 'password';
    btn.textContent = i.type === 'password' ? '👁' : '🙈';
}

function showAuthError(id, m) {
    const e = document.getElementById(id);
    e.textContent = m;
    e.classList.add('visible');
}

function setBtnLoad(b, s, on) {
    document.getElementById(b).disabled = on;
    const sp = document.getElementById(s);
    if (sp) sp.style.display = on ? 'block' : 'none';
}

export async function handleLogin() {
    const e = document.getElementById('login-email').value.trim();
    const p = document.getElementById('login-password').value;
    if (!e || !p) return showAuthError('login-error', 'Preencha todos');
    setBtnLoad('login-btn', 'login-spinner', true);
    document.getElementById('login-error').classList.remove('visible');
    try {
        await auth.signInWithEmailAndPassword(e, p);
    } catch (er) {
        showAuthError('login-error', {
            'auth/invalid-credential': 'E-mail ou senha incorretos',
            'auth/too-many-requests': 'Muitas tentativas'
        }[er.code] || er.message);
    }
    setBtnLoad('login-btn', 'login-spinner', false);
}

export async function handleRegister() {
    const n = document.getElementById('register-name').value.trim();
    const e = document.getElementById('register-email').value.trim();
    const p = document.getElementById('register-password').value;
    if (!n || !e || !p) return showAuthError('register-error', 'Preencha todos');
    if (p.length < 6) return showAuthError('register-error', 'Senha: mín. 6');
    setBtnLoad('register-btn', 'register-spinner', true);
    document.getElementById('register-error').classList.remove('visible');
    try {
        const c = await auth.createUserWithEmailAndPassword(e, p);
        await c.user.updateProfile({ displayName: n });
        await db.collection('users').doc(c.user.uid).set({
            name: n, email: e, photoURL: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('userData').doc(c.user.uid).set({ clients: [], activities: [] });
        showToast('Conta criada! 🎉');
    } catch (er) {
        showAuthError('register-error', {
            'auth/email-already-in-use': 'E-mail já cadastrado'
        }[er.code] || er.message);
    }
    setBtnLoad('register-btn', 'register-spinner', false);
}

export async function handleGoogleLogin() {
    try {
        const r = await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        const d = await db.collection('userData').doc(r.user.uid).get();
        if (!d.exists) {
            await db.collection('users').doc(r.user.uid).set({
                name: r.user.displayName || 'Usuário', email: r.user.email,
                photoURL: r.user.photoURL || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            await db.collection('userData').doc(r.user.uid).set({ clients: [], activities: [] });
        }
    } catch (e) {
        if (e.code !== 'auth/popup-closed-by-user') showAuthError('login-error', e.message);
    }
}

export async function handleResetPassword() {
    const e = document.getElementById('reset-email').value.trim();
    if (!e) return showAuthError('reset-error', 'Informe e-mail');
    try {
        await auth.sendPasswordResetEmail(e);
        const el = document.getElementById('reset-success');
        el.textContent = 'Link enviado!'; el.classList.add('visible');
        document.getElementById('reset-error').classList.remove('visible');
    } catch (er) { showAuthError('reset-error', 'Verifique o e-mail'); }
}

export async function handleLogout() {
    const unsub = store.getUnsubSnap();
    if (unsub) { unsub(); store.setUnsubSnap(null); }
    await auth.signOut();
    store.setData({ clients: [], activities: [] });
    store.setUserProfile({ photoURL: null });
    showAuthForm('login');
}
