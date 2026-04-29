// =============================================
// ROUTER.JS — Navegação entre páginas
// =============================================
const PAGE_TITLES = {
    dashboard: ['Dashboard', 'Visão geral'],
    clients: ['Clientes', 'Carteira'],
    'client-detail': ['Projetos', 'Kanban'],
    projects: ['Todos os Projetos', 'Consolidado'],
    calendar: ['Calendário', 'Entregas']
};
const NAV_MAP = { dashboard: 0, clients: 1, 'client-detail': 1, projects: 2, calendar: 3 };

let renderCallbacks = {};

export function registerPageCallback(page, fn) {
    renderCallbacks[page] = fn;
}

export function showPage(p) {
    document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
    const el = document.getElementById(`page-${p}`);
    if (el) el.classList.add('active');
    const ns = document.querySelectorAll('.nav-item');
    if (ns[NAV_MAP[p]]) ns[NAV_MAP[p]].classList.add('active');
    document.getElementById('page-title').textContent = PAGE_TITLES[p]?.[0] || '';
    document.getElementById('page-subtitle').textContent = PAGE_TITLES[p]?.[1] || '';
    if (renderCallbacks[p]) renderCallbacks[p]();
}
