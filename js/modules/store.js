// =============================================
// STORE.JS — Estado global centralizado
// =============================================
import { db } from '../config/firebase.js';
import { showToast } from '../utils/toast.js';

// --- Estado ---
export let currentUser = null;
export let data = { clients: [], activities: [] };
export let currentClientId = null;
export let currentProjectId = null;
export let currentCalendarDate = new Date();
export let selectedClientColor = '#6c5ce7';
export let userProfile = { photoURL: null };
let unsubSnap = null;
export let draggedProjectId = null;
export let dragSourceStatus = null;

// --- Setters ---
export function setCurrentUser(u) { currentUser = u; }
export function setData(d) { data = d; }
export function setCurrentClientId(id) { currentClientId = id; }
export function setCurrentProjectId(id) { currentProjectId = id; }
export function setSelectedClientColor(c) { selectedClientColor = c; }
export function setDraggedProjectId(id) { draggedProjectId = id; }
export function setDragSourceStatus(s) { dragSourceStatus = s; }
export function setUserProfile(p) { userProfile = p; }
export function getUnsubSnap() { return unsubSnap; }
export function setUnsubSnap(fn) { unsubSnap = fn; }

// --- Sync UI ---
export function setSync(s) {
    const d = document.getElementById('sync-dot');
    const t = document.getElementById('sync-text');
    if (!d || !t) return;
    d.className = 'sync-dot';
    if (s === 'syncing') { d.classList.add('syncing'); t.textContent = 'Sincronizando...'; }
    else if (s === 'error') { d.classList.add('error'); t.textContent = 'Erro'; }
    else t.textContent = 'Sincronizado';
}

// --- Firestore ---
export async function loadData() {
    if (!currentUser) return;
    setSync('syncing');
    try {
        const d = await db.collection('userData').doc(currentUser.uid).get();
        if (d.exists) {
            data = d.data();
            if (!data.clients) data.clients = [];
            if (!data.activities) data.activities = [];
        } else {
            data = { clients: [], activities: [] };
            await db.collection('userData').doc(currentUser.uid).set(data);
        }
        setSync('ok');
    } catch (e) {
        setSync('error');
        const c = localStorage.getItem('ph_' + currentUser.uid);
        if (c) { data = JSON.parse(c); showToast('Cache offline', 'info'); }
    }
}

export async function saveData() {
    if (!currentUser) return;
    setSync('syncing');
    try {
        await db.collection('userData').doc(currentUser.uid).set(data);
        localStorage.setItem('ph_' + currentUser.uid, JSON.stringify(data));
        setSync('ok');
    } catch (e) {
        setSync('error');
        localStorage.setItem('ph_' + currentUser.uid, JSON.stringify(data));
    }
}

export function logActivity(t) {
    data.activities.unshift({ text: t, time: new Date().toISOString() });
    if (data.activities.length > 50) data.activities = data.activities.slice(0, 50);
}
