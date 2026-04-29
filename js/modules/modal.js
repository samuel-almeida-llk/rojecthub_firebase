// =============================================
// MODAL.JS — Controle de modais
// =============================================
export function openModal(id) {
    document.getElementById(id).classList.add('active');
}

export function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

export function initModalOverlays() {
    document.querySelectorAll('.modal-overlay').forEach(o =>
        o.addEventListener('click', e => { if (e.target === o) o.classList.remove('active'); })
    );
}
