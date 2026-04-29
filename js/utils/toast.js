// =============================================
// TOAST.JS — Notificações
// =============================================
export function showToast(m, t = 'success') {
    const c = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${t}`;
    el.innerHTML = `<span>${icons[t]}</span> ${m}`;
    c.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(40px)';
        setTimeout(() => el.remove(), 300);
    }, 3000);
}
