// =============================================
// HELPERS.JS — Funções utilitárias
// =============================================
export function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDate(d) {
    if (!d) return '';
    const p = d.split('-');
    return `${p[2]}/${p[1]}/${p[0]}`;
}

export function timeAgo(d) {
    const s = Math.floor((new Date() - d) / 1000);
    if (s < 60) return 'agora';
    if (s < 3600) return `${Math.floor(s / 60)}min`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
}

export function getGradient(c) {
    const m = {
        '#6c5ce7': 'linear-gradient(135deg,#6c5ce7,#a29bfe)',
        '#0984e3': 'linear-gradient(135deg,#0984e3,#74b9ff)',
        '#00b894': 'linear-gradient(135deg,#00b894,#55efc4)',
        '#e17055': 'linear-gradient(135deg,#e17055,#fab1a0)',
        '#fdcb6e': 'linear-gradient(135deg,#fdcb6e,#ffeaa7)',
        '#e84393': 'linear-gradient(135deg,#e84393,#fd79a8)',
        '#00cec9': 'linear-gradient(135deg,#00cec9,#81ecec)',
        '#636e72': 'linear-gradient(135deg,#636e72,#b2bec3)'
    };
    return m[c] || m['#6c5ce7'];
}

export function getTP(p) {
    return (!p.tasks || !p.tasks.length)
        ? 0
        : Math.round(p.tasks.filter(t => t.done).length / p.tasks.length * 100);
}
