// =============================================
// PROFILE.JS — Avatar, Nome, Perfil
// =============================================
import { db } from '../config/firebase.js';
import { showToast } from '../utils/toast.js';
import { openModal, closeModal } from './modal.js';
import * as store from './store.js';

export function updateAllAvatars() {
    const cu = store.currentUser;
    if (!cu) return;
    const n = cu.displayName || cu.email?.split('@')[0] || 'Usuário';
    const ini = n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const sa = document.getElementById('sidebar-avatar');
    const ta = document.getElementById('topbar-avatar');
    if (store.userProfile.photoURL) {
        const img = `<img src="${store.userProfile.photoURL}" class="avatar-img">`;
        sa.innerHTML = img; sa.style.background = 'none';
        ta.innerHTML = img; ta.style.background = 'none';
    } else {
        sa.textContent = ini; sa.style.background = 'var(--gradient-1)';
        ta.textContent = ini; ta.style.background = 'var(--gradient-1)';
    }
    document.getElementById('sidebar-name').textContent = n;
    document.getElementById('sidebar-email').textContent = cu.email || '';
}

export async function loadUserProfile() {
    const cu = store.currentUser;
    if (!cu) return;
    try {
        const d = await db.collection('users').doc(cu.uid).get();
        if (d.exists) {
            store.userProfile.photoURL = d.data().photoURL || cu.photoURL || null;
        } else {
            store.userProfile.photoURL = cu.photoURL || null;
        }
    } catch (e) {
        store.userProfile.photoURL = cu.photoURL || null;
    }
    updateAllAvatars();
}

export function openProfileModal() {
    const cu = store.currentUser;
    if (!cu) return;
    const n = cu.displayName || cu.email?.split('@')[0] || 'Usuário';
    document.getElementById('profile-name-disp').textContent = n;
    document.getElementById('profile-email-disp').textContent = cu.email || '';
    const av = document.getElementById('profile-avatar-lg');
    const ct = document.getElementById('profile-av-content');
    if (store.userProfile.photoURL) {
        ct.innerHTML = `<img src="${store.userProfile.photoURL}" class="avatar-img">`;
        av.style.background = 'none';
    } else {
        const ini = n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        ct.textContent = ini; av.style.background = 'var(--gradient-1)';
    }
    openModal('modal-profile');
}

export function triggerAvatarUpload() {
    document.getElementById('avatar-file-input').click();
}

function resizeImg(file, mW, mH, q) {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement('canvas');
                const sz = Math.min(img.width, img.height);
                const sx = (img.width - sz) / 2, sy = (img.height - sz) / 2;
                c.width = mW; c.height = mH;
                const ctx = c.getContext('2d');
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, sx, sy, sz, sz, 0, 0, mW, mH);
                res(c.toDataURL('image/jpeg', q));
            };
            img.onerror = rej; img.src = e.target.result;
        };
        r.onerror = rej; r.readAsDataURL(file);
    });
}

export async function handleAvatarUpload(ev) {
    const f = ev.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { showToast('Selecione uma imagem', 'error'); return; }
    if (f.size > 5 * 1024 * 1024) { showToast('Máx. 5MB', 'error'); return; }
    showToast('Processando...', 'info');
    try {
        const url = await resizeImg(f, 200, 200, .8);
        store.userProfile.photoURL = url;
        await db.collection('users').doc(store.currentUser.uid).update({ photoURL: url });
        updateAllAvatars(); openProfileModal();
        showToast('Foto atualizada! 📸');
    } catch (e) { showToast('Erro', 'error'); }
    ev.target.value = '';
}

export async function removeAvatar() {
    if (!store.userProfile.photoURL) { showToast('Sem foto', 'info'); return; }
    store.userProfile.photoURL = null;
    try { await db.collection('users').doc(store.currentUser.uid).update({ photoURL: null }); } catch (e) {}
    updateAllAvatars(); openProfileModal();
    showToast('Foto removida', 'info');
}

export function openEditNameModal() {
    document.getElementById('edit-name-input').value = store.currentUser.displayName || '';
    openModal('modal-edit-name');
}

export async function saveNewName() {
    const n = document.getElementById('edit-name-input').value.trim();
    if (!n) { showToast('Informe o nome', 'error'); return; }
    try {
        await store.currentUser.updateProfile({ displayName: n });
        await db.collection('users').doc(store.currentUser.uid).update({ name: n });
        updateAllAvatars(); closeModal('modal-edit-name');
        showToast('Nome atualizado! ✅');
    } catch (e) { showToast('Erro', 'error'); }
}
