// =============================================
// APP.JS — Entry Point: imports + inicialização
// =============================================
import { auth, db } from './config/firebase.js';
import { getTheme, setTheme, toggleTheme } from './modules/theme.js';
import { showAuthForm, togglePassword, handleLogin, handleRegister, handleGoogleLogin, handleResetPassword, handleLogout } from './modules/auth.js';
import { openModal, closeModal, initModalOverlays } from './modules/modal.js';
import { showPage, registerPageCallback } from './modules/router.js';
import { loadUserProfile, updateAllAvatars, openProfileModal, triggerAvatarUpload, handleAvatarUpload, removeAvatar, openEditNameModal, saveNewName } from './modules/profile.js';
import { showToast } from './utils/toast.js';
import { sanitize } from './utils/sanitize.js';
import { uid, formatDate, timeAgo, getGradient, getTP } from './utils/helpers.js';
import { STATUS_LABELS, PRIORITY_LABELS, PRIORITY_ORDER, MONTHS, WEEKDAYS } from './constants/status.js';
import * as store from './modules/store.js';

// ---- Inicializar tema ----
setTheme(getTheme());

// ---- Expor funções ao escopo global (para onclick inline do HTML) ----
window.toggleTheme = toggleTheme;
window.showAuthForm = showAuthForm;
window.togglePassword = togglePassword;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleGoogleLogin = handleGoogleLogin;
window.handleResetPassword = handleResetPassword;
window.handleLogout = handleLogout;
window.openModal = openModal;
window.closeModal = closeModal;
window.showPage = showPage;
window.openProfileModal = openProfileModal;
window.triggerAvatarUpload = triggerAvatarUpload;
window.handleAvatarUpload = handleAvatarUpload;
window.removeAvatar = removeAvatar;
window.openEditNameModal = openEditNameModal;
window.saveNewName = saveNewName;

// =========================================================
// CLIENTES
// =========================================================
function renderClients() {
    const g = document.getElementById('clients-grid');
    const e = document.getElementById('empty-clients');
    if (!store.data.clients.length) { g.style.display = 'none'; e.style.display = 'flex'; return; }
    g.style.display = 'grid'; e.style.display = 'none';
    g.innerHTML = store.data.clients.map(c => {
        const pc = c.projects?.length || 0;
        const cc = (c.projects || []).filter(p => p.status === 'concluido').length;
        const ic = (c.projects || []).filter(p => p.status === 'andamento').length;
        const ini = c.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        return `<div class="client-card" onclick="openClientDetail('${c.id}')">
            <div class="client-actions"><button class="client-action-btn" onclick="event.stopPropagation();editClient('${c.id}')">✏️</button><button class="client-action-btn delete" onclick="event.stopPropagation();confirmDeleteClient('${c.id}')">🗑</button></div>
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px"><div class="client-avatar" style="background:${getGradient(c.color)}">${sanitize(ini)}</div><div><div class="client-name">${sanitize(c.name)}</div><span class="client-segment">${sanitize(c.segment || '—')}</span></div></div>
            <div class="client-stats"><div class="client-stat-item"><span class="client-stat-value">${pc}</span><span class="client-stat-label">Projetos</span></div><div class="client-stat-item"><span class="client-stat-value">${ic}</span><span class="client-stat-label">Ativos</span></div><div class="client-stat-item"><span class="client-stat-value">${cc}</span><span class="client-stat-label">Concluídos</span></div><div class="client-stat-item"><div class="progress-bar" style="width:80px;margin-top:4px"><div class="progress-fill green" style="width:${pc > 0 ? cc / pc * 100 : 0}%"></div></div><span class="client-stat-label" style="margin-top:4px">${pc > 0 ? Math.round(cc / pc * 100) : 0}%</span></div></div></div>`;
    }).join('');
}

window.openNewClientModal = function() {
    document.getElementById('modal-client-title').textContent = 'Novo Cliente';
    document.getElementById('client-edit-id').value = '';
    ['client-name', 'client-contact', 'client-email', 'client-notes'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('client-segment').value = 'Tecnologia';
    store.setSelectedClientColor('#6c5ce7'); setupColorPickers();
    openModal('modal-client');
};

window.editClient = function(id) {
    const c = store.data.clients.find(x => x.id === id); if (!c) return;
    document.getElementById('modal-client-title').textContent = 'Editar';
    document.getElementById('client-edit-id').value = id;
    document.getElementById('client-name').value = c.name;
    document.getElementById('client-segment').value = c.segment || 'Tecnologia';
    document.getElementById('client-contact').value = c.contact || '';
    document.getElementById('client-email').value = c.email || '';
    document.getElementById('client-notes').value = c.notes || '';
    store.setSelectedClientColor(c.color || '#6c5ce7'); setupColorPickers();
    openModal('modal-client');
};

window.saveClient = async function() {
    const name = document.getElementById('client-name').value.trim();
    if (!name) { showToast('Nome obrigatório', 'error'); return; }
    const eid = document.getElementById('client-edit-id').value;
    const cd = { name, segment: document.getElementById('client-segment').value, contact: document.getElementById('client-contact').value.trim(), email: document.getElementById('client-email').value.trim(), notes: document.getElementById('client-notes').value.trim(), color: store.selectedClientColor };
    if (eid) { const i = store.data.clients.findIndex(c => c.id === eid); if (i > -1) { store.data.clients[i] = { ...store.data.clients[i], ...cd }; store.logActivity(`<strong>${sanitize(name)}</strong> atualizado`); showToast('Atualizado!'); } }
    else { store.data.clients.push({ id: uid(), ...cd, projects: [], createdAt: new Date().toISOString() }); store.logActivity(`Novo cliente <strong>${sanitize(name)}</strong>`); showToast('Criado!'); }
    await store.saveData(); closeModal('modal-client'); renderAll();
    if (document.getElementById('page-clients').classList.contains('active')) renderClients();
};

window.confirmDeleteClient = function(id) {
    const c = store.data.clients.find(x => x.id === id); if (!c) return;
    document.getElementById('confirm-message').innerHTML = `Excluir <strong>${sanitize(c.name)}</strong>?`;
    document.getElementById('confirm-btn').onclick = () => deleteClient(id);
    openModal('modal-confirm');
};

async function deleteClient(id) {
    const c = store.data.clients.find(x => x.id === id);
    store.data.clients = store.data.clients.filter(x => x.id !== id);
    store.logActivity(`<strong>${sanitize(c?.name)}</strong> removido`);
    await store.saveData(); closeModal('modal-confirm');
    showToast('Excluído!'); renderAll(); renderClients();
}

window.openClientDetail = function(id) { store.setCurrentClientId(id); showPage('client-detail'); };

// =========================================================
// PROJETOS + KANBAN
// =========================================================
function renderClientDetail() {
    const c = store.data.clients.find(x => x.id === store.currentClientId); if (!c) return;
    const ini = c.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('page-title').textContent = c.name;
    document.getElementById('page-subtitle').textContent = `${c.segment} • ${c.projects?.length || 0} projetos`;
    document.getElementById('client-detail-header').innerHTML = `<div class="client-detail-avatar" style="background:${getGradient(c.color)}">${sanitize(ini)}</div><div class="client-detail-info" style="flex:1"><h2>${sanitize(c.name)}</h2><p>${sanitize(c.segment || '')}${c.contact ? ' • ' + sanitize(c.contact) : ''}${c.email ? ' • ' + sanitize(c.email) : ''}</p>${c.notes ? `<p style="margin-top:6px;font-style:italic;opacity:.7">"${sanitize(c.notes)}"</p>` : ''}</div><button class="btn btn-secondary btn-sm" onclick="editClient('${c.id}')">✏️ Editar</button>`;
    ['backlog', 'andamento', 'revisao', 'concluido'].forEach(st => {
        const col = document.getElementById(`col-${st}`);
        const ps = (c.projects || []).filter(p => p.status === st);
        document.getElementById(`count-${st}`).textContent = ps.length;
        col.innerHTML = ps.map(p => `<div class="kanban-card" draggable="true" data-project-id="${p.id}" data-status="${st}" ondragstart="onDS(event)" ondragend="onDE(event)" onclick="openProjectDetail('${p.id}')"><span class="drag-handle">⠿</span><div style="display:flex;justify-content:space-between;align-items:start"><div class="kanban-card-title">${sanitize(p.name)}</div><div class="kanban-card-actions"><button class="client-action-btn" style="width:24px;height:24px;font-size:11px" onclick="event.stopPropagation();editProject('${p.id}')">✏️</button><button class="client-action-btn delete" style="width:24px;height:24px;font-size:11px" onclick="event.stopPropagation();confirmDeleteProject('${p.id}')">🗑</button></div></div>${p.description ? `<div class="kanban-card-desc">${sanitize(p.description)}</div>` : ''}<div class="kanban-card-footer"><span class="priority-badge priority-${p.priority}">${p.priority}</span>${p.deadline ? `<span class="kanban-card-date">📅 ${formatDate(p.deadline)}</span>` : ''}</div>${p.tasks?.length ? `<div class="progress-bar" style="margin-top:10px"><div class="progress-fill purple" style="width:${getTP(p)}%"></div></div><div style="font-size:10px;color:var(--text-muted);margin-top:4px">${p.tasks.filter(t => t.done).length}/${p.tasks.length}</div>` : ''}</div>`).join('');
    });
    initDD();
}

window.openNewProjectModal = function(st = 'backlog') {
    document.getElementById('modal-project-title').textContent = 'Novo Projeto';
    document.getElementById('project-edit-id').value = '';
    ['project-name', 'project-desc', 'project-owner'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('project-status').value = st;
    document.getElementById('project-priority').value = 'media';
    document.getElementById('project-start').value = new Date().toISOString().split('T')[0];
    document.getElementById('project-deadline').value = '';
    openModal('modal-project');
};

window.editProject = function(id) {
    const c = store.data.clients.find(x => x.id === store.currentClientId);
    const p = c?.projects?.find(x => x.id === id); if (!p) return;
    document.getElementById('modal-project-title').textContent = 'Editar';
    document.getElementById('project-edit-id').value = id;
    document.getElementById('project-name').value = p.name;
    document.getElementById('project-desc').value = p.description || '';
    document.getElementById('project-status').value = p.status;
    document.getElementById('project-priority').value = p.priority;
    document.getElementById('project-start').value = p.startDate || '';
    document.getElementById('project-deadline').value = p.deadline || '';
    document.getElementById('project-owner').value = p.owner || '';
    openModal('modal-project');
};

window.saveProject = async function() {
    const name = document.getElementById('project-name').value.trim();
    if (!name) { showToast('Nome obrigatório', 'error'); return; }
    const c = store.data.clients.find(x => x.id === store.currentClientId); if (!c) return;
    const pd = { name, description: document.getElementById('project-desc').value.trim(), status: document.getElementById('project-status').value, priority: document.getElementById('project-priority').value, startDate: document.getElementById('project-start').value, deadline: document.getElementById('project-deadline').value, owner: document.getElementById('project-owner').value.trim(), clientId: store.currentClientId };
    const eid = document.getElementById('project-edit-id').value;
    if (eid) { const i = c.projects.findIndex(p => p.id === eid); if (i > -1) { c.projects[i] = { ...c.projects[i], ...pd }; store.logActivity(`<strong>${sanitize(name)}</strong> atualizado`); showToast('Atualizado!'); } }
    else { if (!c.projects) c.projects = []; c.projects.push({ id: uid(), ...pd, tasks: [], createdAt: new Date().toISOString() }); store.logActivity(`Novo: <strong>${sanitize(name)}</strong> em <strong>${sanitize(c.name)}</strong>`); showToast('Criado!'); }
    await store.saveData(); closeModal('modal-project'); renderClientDetail(); updateBadges();
};

window.confirmDeleteProject = function(id) {
    const c = store.data.clients.find(x => x.id === store.currentClientId);
    const p = c?.projects?.find(x => x.id === id); if (!p) return;
    document.getElementById('confirm-message').innerHTML = `Excluir <strong>${sanitize(p.name)}</strong>?`;
    document.getElementById('confirm-btn').onclick = () => deleteProject(id);
    openModal('modal-confirm');
};

async function deleteProject(id) {
    const c = store.data.clients.find(x => x.id === store.currentClientId); if (!c) return;
    const p = c.projects.find(x => x.id === id);
    c.projects = c.projects.filter(x => x.id !== id);
    store.logActivity(`<strong>${sanitize(p?.name)}</strong> removido`);
    await store.saveData(); closeModal('modal-confirm'); closeModal('modal-project-detail');
    showToast('Excluído!'); renderClientDetail(); updateBadges();
}

window.openProjectDetail = function(id) {
    store.setCurrentProjectId(id);
    const c = store.data.clients.find(x => x.id === store.currentClientId);
    const p = c?.projects?.find(x => x.id === id); if (!p) return;
    document.getElementById('detail-project-name').textContent = p.name;
    let th = (p.tasks || []).map((t, i) => `<div class="task-item ${t.done ? 'done' : ''}"><button class="task-check ${t.done ? 'checked' : ''}" onclick="toggleTask('${id}',${i})">✓</button><span class="task-text">${sanitize(t.text)}</span><button class="task-delete" onclick="deleteTask('${id}',${i})">✕</button></div>`).join('');
    document.getElementById('project-detail-body').innerHTML = `<div class="project-detail-section"><h4>Informações</h4><div class="detail-row"><span class="detail-label">Status:</span><div class="status-select-wrapper">${Object.keys(STATUS_LABELS).map(s => `<button class="status-pill ${p.status === s ? 'active-' + s : ''}" onclick="chgStatus('${id}','${s}')">${STATUS_LABELS[s]}</button>`).join('')}</div></div><div class="detail-row"><span class="detail-label">Prioridade:</span><span>${PRIORITY_LABELS[p.priority]}</span></div>${p.owner ? `<div class="detail-row"><span class="detail-label">Responsável:</span>${sanitize(p.owner)}</div>` : ''}${p.startDate ? `<div class="detail-row"><span class="detail-label">Início:</span>${formatDate(p.startDate)}</div>` : ''}${p.deadline ? `<div class="detail-row"><span class="detail-label">Entrega:</span>${formatDate(p.deadline)}</div>` : ''}</div>${p.description ? `<div class="project-detail-section"><h4>Descrição</h4><p style="font-size:14px;line-height:1.7;color:var(--text-secondary)">${sanitize(p.description)}</p></div>` : ''}<div class="project-detail-section"><h4>Tarefas (${(p.tasks || []).filter(t => t.done).length}/${(p.tasks || []).length})</h4>${p.tasks?.length ? `<div class="progress-bar" style="margin-bottom:12px"><div class="progress-fill purple" style="width:${getTP(p)}%"></div></div>` : ''}<div class="task-list">${th}</div><div class="add-task-input"><input type="text" id="new-task-input" placeholder="Nova tarefa..." onkeydown="if(event.key==='Enter')addTask('${id}')"><button class="btn btn-primary btn-sm" onclick="addTask('${id}')">+</button></div></div>`;
    openModal('modal-project-detail');
};

window.chgStatus = async function(pid, ns) {
    const c = store.data.clients.find(x => x.id === store.currentClientId);
    const p = c?.projects?.find(x => x.id === pid); if (!p) return;
    p.status = ns; store.logActivity(`<strong>${sanitize(p.name)}</strong> → <strong>${STATUS_LABELS[ns]}</strong>`);
    await store.saveData(); window.openProjectDetail(pid); renderClientDetail();
};

window.deleteProjectFromDetail = function() { window.confirmDeleteProject(store.currentProjectId); };
window.editProjectFromDetail = function() { closeModal('modal-project-detail'); window.editProject(store.currentProjectId); };

// =========================================================
// TASKS
// =========================================================
window.addTask = async function(pid) {
    const input = document.getElementById('new-task-input'), t = input.value.trim(); if (!t) return;
    const c = store.data.clients.find(x => x.id === store.currentClientId);
    const p = c?.projects?.find(x => x.id === pid); if (!p) return;
    if (!p.tasks) p.tasks = []; p.tasks.push({ text: t, done: false });
    await store.saveData(); window.openProjectDetail(pid); renderClientDetail();
};
window.toggleTask = async function(pid, i) {
    const c = store.data.clients.find(x => x.id === store.currentClientId);
    const p = c?.projects?.find(x => x.id === pid); if (!p?.tasks?.[i]) return;
    p.tasks[i].done = !p.tasks[i].done;
    await store.saveData(); window.openProjectDetail(pid); renderClientDetail();
};
window.deleteTask = async function(pid, i) {
    const c = store.data.clients.find(x => x.id === store.currentClientId);
    const p = c?.projects?.find(x => x.id === pid); if (!p) return;
    p.tasks.splice(i, 1); await store.saveData(); window.openProjectDetail(pid); renderClientDetail();
};

// =========================================================
// DRAG & DROP
// =========================================================
function initDD() {
    document.querySelectorAll('.kanban-cards').forEach(z => {
        z.ondragover = onDO;
        z.ondragenter = e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
        z.ondragleave = e => { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { e.currentTarget.classList.remove('drag-over'); e.currentTarget.querySelector('.drop-placeholder')?.remove(); } };
        z.ondrop = onDrop;
    });
}
window.onDS = function(e) {
    const c = e.target.closest('.kanban-card'); if (!c) return;
    store.setDraggedProjectId(c.dataset.projectId);
    store.setDragSourceStatus(c.dataset.status);
    setTimeout(() => c.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', store.draggedProjectId);
    document.querySelectorAll('.kanban-column').forEach(col => col.classList.add('drag-active'));
};
window.onDE = function(e) {
    e.target.closest('.kanban-card')?.classList.remove('dragging');
    document.querySelectorAll('.kanban-column').forEach(c => c.classList.remove('drag-active'));
    document.querySelectorAll('.kanban-cards').forEach(z => z.classList.remove('drag-over'));
    document.querySelectorAll('.drop-placeholder').forEach(p => p.remove());
    store.setDraggedProjectId(null);
};
function onDO(e) {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    const z = e.currentTarget; let ph = z.querySelector('.drop-placeholder');
    if (!ph) { ph = document.createElement('div'); ph.className = 'drop-placeholder'; }
    const af = getAfter(z, e.clientY); af ? z.insertBefore(ph, af) : z.appendChild(ph);
}
async function onDrop(e) {
    e.preventDefault(); const z = e.currentTarget, ns = z.dataset.status;
    z.classList.remove('drag-over'); z.querySelector('.drop-placeholder')?.remove();
    if (!store.draggedProjectId || !ns) return;
    const c = store.data.clients.find(x => x.id === store.currentClientId); if (!c) return;
    const p = c.projects?.find(x => x.id === store.draggedProjectId);
    if (!p || p.status === ns) return;
    const os = p.status; p.status = ns;
    store.logActivity(`<strong>${sanitize(p.name)}</strong>: ${STATUS_LABELS[os]} → <strong>${STATUS_LABELS[ns]}</strong>`);
    await store.saveData(); showToast(`${p.name} → ${STATUS_LABELS[ns]}`); renderClientDetail(); updateBadges();
}
function getAfter(z, y) {
    return [...z.querySelectorAll('.kanban-card:not(.dragging)')].reduce((cl, ch) => {
        const b = ch.getBoundingClientRect(), o = y - b.top - b.height / 2;
        return o < 0 && o > cl.offset ? { offset: o, element: ch } : cl;
    }, { offset: -Infinity }).element;
}

// =========================================================
// DASHBOARD
// =========================================================
function renderDashboard() {
    const all = store.data.clients.flatMap(c => (c.projects || []).map(p => ({ ...p, clientName: c.name })));
    document.getElementById('stat-clients').textContent = store.data.clients.length;
    document.getElementById('stat-projects').textContent = all.length;
    document.getElementById('stat-in-progress').textContent = all.filter(p => p.status === 'andamento').length;
    document.getElementById('stat-completed').textContent = all.filter(p => p.status === 'concluido').length;
    const rc = document.getElementById('recent-projects');
    const re = all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    rc.innerHTML = !re.length ? '<p style="color:var(--text-muted);font-size:13px;padding:20px;text-align:center">Nenhum projeto</p>' : re.map(p => `<div class="activity-item" style="cursor:pointer" onclick="goToProject('${p.clientId}','${p.id}')"><span class="status-dot ${p.status}"></span><div style="flex:1"><div style="font-size:13px;font-weight:600">${sanitize(p.name)}</div><div style="font-size:11px;color:var(--text-muted)">${sanitize(p.clientName)}</div></div><span class="priority-badge priority-${p.priority}">${p.priority}</span></div>`).join('');
    const ac = document.getElementById('recent-activity');
    ac.innerHTML = !store.data.activities.length ? '<p style="color:var(--text-muted);font-size:13px;padding:20px;text-align:center">Nenhuma atividade</p>' : store.data.activities.slice(0, 8).map(a => `<div class="activity-item"><div class="activity-dot" style="background:var(--accent)"></div><span class="activity-text">${a.text}</span><span class="activity-time">${timeAgo(new Date(a.time))}</span></div>`).join('');
    updateBadges();
}

window.goToProject = function(c, p) { store.setCurrentClientId(c); showPage('client-detail'); setTimeout(() => window.openProjectDetail(p), 100); };

// =========================================================
// ALL PROJECTS
// =========================================================
function renderAllProjects() {
    const ct = document.getElementById('all-projects-list');
    const all = store.data.clients.flatMap(c => (c.projects || []).map(p => ({ ...p, clientName: c.name, clientId: c.id })));
    if (!all.length) { ct.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📁</div><h3>Nenhum projeto</h3></div>'; return; }
    ct.innerHTML = `<div style="display:grid;gap:10px">${all.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]).map(p => `<div class="activity-item" style="cursor:pointer" onclick="store.setCurrentClientId('${p.clientId}');openProjectDetail('${p.id}')"><span class="status-dot ${p.status}"></span><div style="flex:1"><div style="font-size:14px;font-weight:600">${sanitize(p.name)}</div><div style="font-size:12px;color:var(--text-muted)">${sanitize(p.clientName)}${p.owner ? ' • ' + sanitize(p.owner) : ''}${p.deadline ? ' • 📅 ' + formatDate(p.deadline) : ''}</div></div><span class="priority-badge priority-${p.priority}">${p.priority}</span></div>`).join('')}</div>`;
}

// =========================================================
// CALENDAR
// =========================================================
function renderCalendar() {
    const g = document.getElementById('calendar-grid');
    const y = store.currentCalendarDate.getFullYear(), m = store.currentCalendarDate.getMonth();
    document.getElementById('calendar-month').textContent = MONTHS[m] + ' ' + y;
    const fd = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate(), td = new Date();
    const all = store.data.clients.flatMap(c => (c.projects || []).map(p => ({ ...p })));
    const dl = {};
    all.forEach(p => { if (p.deadline) { const d = new Date(p.deadline + 'T00:00:00'); if (d.getFullYear() === y && d.getMonth() === m) { const day = d.getDate(); if (!dl[day]) dl[day] = []; dl[day].push(p); } } });
    let h = WEEKDAYS.map(d => `<div style="text-align:center;font-size:12px;font-weight:600;color:var(--text-muted);padding:8px">${d}</div>`).join('');
    for (let i = 0; i < fd; i++) h += '<div></div>';
    for (let day = 1; day <= dim; day++) {
        const isT = td.getFullYear() === y && td.getMonth() === m && td.getDate() === day, hd = dl[day];
        h += `<div style="padding:10px 8px;text-align:center;border-radius:10px;background:${isT ? 'rgba(108,92,231,.2)' : hd ? 'var(--bg-card)' : 'transparent'};border:1px solid ${isT ? 'var(--accent)' : hd ? 'var(--border)' : 'transparent'};min-height:60px;font-size:13px"><div style="font-weight:${isT ? 700 : 500};color:${isT ? 'var(--accent)' : 'var(--text-primary)'}">${day}</div>${hd ? hd.slice(0, 2).map(p => `<div style="font-size:9px;margin-top:3px;padding:2px 4px;border-radius:4px;background:rgba(108,92,231,.15);color:var(--accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${sanitize(p.name)}</div>`).join('') + (hd.length > 2 ? `<div style="font-size:9px;color:var(--text-muted)">+${hd.length - 2}</div>` : '') : ''}</div>`;
    }
    g.innerHTML = h;
}
window.changeMonth = function(d) { store.currentCalendarDate.setMonth(store.currentCalendarDate.getMonth() + d); renderCalendar(); };

// =========================================================
// SEARCH
// =========================================================
window.handleGlobalSearch = function(q) {
    if (!q.trim()) { const cp = document.querySelector('.page.active')?.id?.replace('page-', ''); if (cp === 'clients') renderClients(); return; }
    const ql = q.toLowerCase(); showPage('clients');
    const g = document.getElementById('clients-grid');
    const f = store.data.clients.filter(c => c.name.toLowerCase().includes(ql) || (c.segment && c.segment.toLowerCase().includes(ql)) || (c.projects || []).some(p => p.name.toLowerCase().includes(ql)));
    if (!f.length) g.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🔍</div><h3>Nenhum resultado</h3></div>';
    else { const o = store.data.clients; store.data.clients = f; renderClients(); store.data.clients = o; }
};

// =========================================================
// UTILS
// =========================================================
function updateBadges() {
    document.getElementById('client-count-badge').textContent = store.data.clients.length;
    document.getElementById('project-count-badge').textContent = store.data.clients.reduce((s, c) => s + (c.projects?.length || 0), 0);
}

function renderAll() { updateBadges(); renderDashboard(); }

function setupColorPickers() {
    document.querySelectorAll('#client-colors .color-option').forEach(o => {
        o.classList.remove('selected');
        if (o.dataset.color === store.selectedClientColor) o.classList.add('selected');
        o.onclick = () => {
            document.querySelectorAll('#client-colors .color-option').forEach(x => x.classList.remove('selected'));
            o.classList.add('selected'); store.setSelectedClientColor(o.dataset.color);
        };
    });
}

function listen() {
    if (!store.currentUser) return;
    const unsub = store.getUnsubSnap();
    if (unsub) unsub();
    store.setUnsubSnap(db.collection('userData').doc(store.currentUser.uid).onSnapshot(d => {
        if (d.exists && !d.metadata.hasPendingWrites) {
            store.setData(d.data());
            if (!store.data.clients) store.data.clients = [];
            if (!store.data.activities) store.data.activities = [];
            renderAll();
            const ap = document.querySelector('.page.active')?.id?.replace('page-', '');
            if (ap === 'clients') renderClients();
            if (ap === 'client-detail') renderClientDetail();
            if (ap === 'projects') renderAllProjects();
            if (ap === 'calendar') renderCalendar();
            store.setSync('ok');
        }
    }, () => store.setSync('error')));
}

// =========================================================
// REGISTRAR CALLBACKS DE PÁGINA
// =========================================================
registerPageCallback('dashboard', renderDashboard);
registerPageCallback('clients', renderClients);
registerPageCallback('client-detail', renderClientDetail);
registerPageCallback('projects', renderAllProjects);
registerPageCallback('calendar', renderCalendar);

// =========================================================
// AUTH STATE CHANGED
// =========================================================
auth.onAuthStateChanged(async u => {
    document.getElementById('loading-screen').style.display = 'none';
    if (u) {
        store.setCurrentUser(u);
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('app-screen').classList.add('active');
        await loadUserProfile(); await store.loadData(); renderAll(); listen();
    } else {
        store.setCurrentUser(null);
        document.getElementById('app-screen').classList.remove('active');
        document.getElementById('auth-screen').classList.add('active');
        const unsub = store.getUnsubSnap();
        if (unsub) { unsub(); store.setUnsubSnap(null); }
    }
});

// =========================================================
// EVENT LISTENERS GLOBAIS
// =========================================================
document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        if (document.getElementById('login-form').style.display !== 'none' && ['login-email', 'login-password'].includes(document.activeElement?.id)) handleLogin();
        if (document.getElementById('register-form').style.display !== 'none' && ['register-name', 'register-email', 'register-password'].includes(document.activeElement?.id)) handleRegister();
    }
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
});

initModalOverlays();
