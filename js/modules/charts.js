// =============================================
// CHARTS.JS — Gráficos do Dashboard (Chart.js)
// =============================================
import * as store from './store.js';

// Paleta de cores consistente
const COLORS = [
    '#6c5ce7', '#0984e3', '#00b894', '#e17055',
    '#fdcb6e', '#e84393', '#00cec9', '#636e72',
    '#a29bfe', '#74b9ff', '#55efc4', '#fab1a0'
];

const COLORS_ALPHA = COLORS.map(c => c + '30');

// Instâncias dos charts (para destruir antes de recriar)
let radarChart = null;
let doughnutChart = null;
let priorityChart = null;
let topClientsChart = null;

/**
 * Configura tema do Chart.js baseado no tema atual
 */
function getChartTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        textColor: isDark ? '#9499b3' : '#5a5f7a',
        gridColor: isDark ? 'rgba(45,49,72,0.5)' : 'rgba(224,227,235,0.7)',
        bgCard: isDark ? '#1e2130' : '#ffffff',
    };
}

/**
 * Coleta dados de segmentos (nichos)
 */
function getSegmentData() {
    const segments = {};
    store.data.clients.forEach(c => {
        const seg = c.segment || 'Outro';
        if (!segments[seg]) segments[seg] = { clients: 0, projects: 0 };
        segments[seg].clients++;
        segments[seg].projects += (c.projects || []).length;
    });
    return segments;
}

/**
 * Coleta dados de status
 */
function getStatusData() {
    const status = { backlog: 0, andamento: 0, revisao: 0, concluido: 0 };
    store.data.clients.forEach(c => {
        (c.projects || []).forEach(p => {
            if (status[p.status] !== undefined) status[p.status]++;
        });
    });
    return status;
}

/**
 * Coleta dados de prioridade
 */
function getPriorityData() {
    const prio = { alta: 0, media: 0, baixa: 0 };
    store.data.clients.forEach(c => {
        (c.projects || []).forEach(p => {
            if (prio[p.priority] !== undefined) prio[p.priority]++;
        });
    });
    return prio;
}

/**
 * Top clientes por projetos
 */
function getTopClientsData() {
    return store.data.clients
        .map(c => ({ name: c.name, total: (c.projects || []).length, active: (c.projects || []).filter(p => p.status === 'andamento').length }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6);
}

// =========================================================
// RENDER CHARTS
// =========================================================

export function renderCharts() {
    // Verifica se Chart.js está carregado
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js não carregado ainda');
        return;
    }

    const theme = getChartTheme();

    // Configuração global do Chart.js
    Chart.defaults.color = theme.textColor;
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 16;

    renderRadarChart(theme);
    renderDoughnutChart(theme);
    renderPriorityChart(theme);
    renderTopClientsChart(theme);
}

/**
 * 🎯 Radar — Nichos de Atuação
 */
function renderRadarChart(theme) {
    const canvas = document.getElementById('chart-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Destroy existing
    if (radarChart) { radarChart.destroy(); radarChart = null; }

    const segments = getSegmentData();
    const labels = Object.keys(segments);
    const projectCounts = labels.map(l => segments[l].projects);
    const clientCounts = labels.map(l => segments[l].clients);

    // Render legend
    const legendEl = document.getElementById('segment-legend');
    if (legendEl) {
        legendEl.innerHTML = labels.map((l, i) =>
            `<div class="segment-legend-item">
                <span class="segment-legend-dot" style="background:${COLORS[i % COLORS.length]}"></span>
                ${l}: <span class="segment-legend-value">${clientCounts[i]} cliente${clientCounts[i] !== 1 ? 's' : ''}, ${projectCounts[i]} projeto${projectCounts[i] !== 1 ? 's' : ''}</span>
            </div>`
        ).join('');
    }

    if (!labels.length) {
        canvas.parentElement.innerHTML = '<div class="chart-empty"><div class="chart-empty-icon">🎯</div><div class="chart-empty-text">Adicione clientes para visualizar</div></div>';
        return;
    }

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Projetos',
                    data: projectCounts,
                    backgroundColor: 'rgba(108, 92, 231, 0.2)',
                    borderColor: '#6c5ce7',
                    borderWidth: 2,
                    pointBackgroundColor: '#6c5ce7',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                },
                {
                    label: 'Clientes',
                    data: clientCounts,
                    backgroundColor: 'rgba(0, 184, 148, 0.2)',
                    borderColor: '#00b894',
                    borderWidth: 2,
                    pointBackgroundColor: '#00b894',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 11, weight: '600' } }
                },
                tooltip: {
                    backgroundColor: theme.bgCard,
                    titleColor: theme.textColor,
                    bodyColor: theme.textColor,
                    borderColor: theme.gridColor,
                    borderWidth: 1,
                    cornerRadius: 10,
                    padding: 12,
                    displayColors: true,
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        backdropColor: 'transparent',
                        font: { size: 10 }
                    },
                    grid: { color: theme.gridColor },
                    angleLines: { color: theme.gridColor },
                    pointLabels: {
                        font: { size: 11, weight: '600' },
                        color: theme.textColor
                    }
                }
            }
        }
    });
}

/**
 * 📊 Doughnut — Status dos Projetos
 */
function renderDoughnutChart(theme) {
    const canvas = document.getElementById('chart-doughnut');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (doughnutChart) { doughnutChart.destroy(); doughnutChart = null; }

    const status = getStatusData();
    const total = Object.values(status).reduce((a, b) => a + b, 0);

    if (!total) {
        canvas.parentElement.innerHTML = '<div class="chart-empty"><div class="chart-empty-icon">📊</div><div class="chart-empty-text">Nenhum projeto cadastrado</div></div>';
        return;
    }

    const labels = ['Backlog', 'Em Andamento', 'Em Revisão', 'Concluído'];
    const data = [status.backlog, status.andamento, status.revisao, status.concluido];
    const colors = ['#6b7094', '#74b9ff', '#fdcb6e', '#00b894'];

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: theme.bgCard,
                borderWidth: 3,
                hoverOffset: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 11, weight: '500' }, padding: 12 }
                },
                tooltip: {
                    backgroundColor: theme.bgCard,
                    titleColor: theme.textColor,
                    bodyColor: theme.textColor,
                    borderColor: theme.gridColor,
                    borderWidth: 1,
                    cornerRadius: 10,
                    padding: 12,
                    callbacks: {
                        label: function(ctx) {
                            const pct = total > 0 ? Math.round(ctx.raw / total * 100) : 0;
                            return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw(chart) {
                const { ctx, width, height } = chart;
                ctx.save();
                ctx.font = "800 28px 'Inter', sans-serif";
                ctx.fillStyle = theme.textColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(total, width / 2, height / 2 - 8);
                ctx.font = "500 11px 'Inter', sans-serif";
                ctx.fillText('projetos', width / 2, height / 2 + 14);
                ctx.restore();
            }
        }]
    });
}

/**
 * 🔥 Bar — Prioridades
 */
function renderPriorityChart(theme) {
    const canvas = document.getElementById('chart-priority');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (priorityChart) { priorityChart.destroy(); priorityChart = null; }

    const prio = getPriorityData();
    const total = prio.alta + prio.media + prio.baixa;

    if (!total) {
        canvas.parentElement.innerHTML = '<div class="chart-empty"><div class="chart-empty-icon">🔥</div><div class="chart-empty-text">Nenhum projeto cadastrado</div></div>';
        return;
    }

    priorityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['🔴 Alta', '🟡 Média', '🟢 Baixa'],
            datasets: [{
                label: 'Projetos',
                data: [prio.alta, prio.media, prio.baixa],
                backgroundColor: [
                    'rgba(225, 112, 85, 0.7)',
                    'rgba(253, 203, 110, 0.7)',
                    'rgba(0, 184, 148, 0.7)'
                ],
                borderColor: ['#e17055', '#fdcb6e', '#00b894'],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: theme.bgCard,
                    titleColor: theme.textColor,
                    bodyColor: theme.textColor,
                    borderColor: theme.gridColor,
                    borderWidth: 1,
                    cornerRadius: 10,
                    padding: 12,
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { size: 11 } },
                    grid: { color: theme.gridColor }
                },
                y: {
                    ticks: { font: { size: 13, weight: '600' } },
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * 🏆 Bar — Top Clientes
 */
function renderTopClientsChart(theme) {
    const canvas = document.getElementById('chart-top-clients');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (topClientsChart) { topClientsChart.destroy(); topClientsChart = null; }

    const topClients = getTopClientsData();

    if (!topClients.length) {
        canvas.parentElement.innerHTML = '<div class="chart-empty"><div class="chart-empty-icon">🏆</div><div class="chart-empty-text">Adicione clientes para visualizar</div></div>';
        return;
    }

    const labels = topClients.map(c => c.name.length > 15 ? c.name.substring(0, 15) + '…' : c.name);

    topClientsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total',
                    data: topClients.map(c => c.total),
                    backgroundColor: 'rgba(108, 92, 231, 0.6)',
                    borderColor: '#6c5ce7',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                },
                {
                    label: 'Ativos',
                    data: topClients.map(c => c.active),
                    backgroundColor: 'rgba(0, 184, 148, 0.6)',
                    borderColor: '#00b894',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 11, weight: '500' } }
                },
                tooltip: {
                    backgroundColor: theme.bgCard,
                    titleColor: theme.textColor,
                    bodyColor: theme.textColor,
                    borderColor: theme.gridColor,
                    borderWidth: 1,
                    cornerRadius: 10,
                    padding: 12,
                }
            },
            scales: {
                x: {
                    ticks: { font: { size: 10, weight: '600' }, maxRotation: 45 },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { size: 11 } },
                    grid: { color: theme.gridColor }
                }
            }
        }
    });
}

/**
 * Limpa todos os charts (para quando trocar de tema)
 */
export function destroyAllCharts() {
    if (radarChart) { radarChart.destroy(); radarChart = null; }
    if (doughnutChart) { doughnutChart.destroy(); doughnutChart = null; }
    if (priorityChart) { priorityChart.destroy(); priorityChart = null; }
    if (topClientsChart) { topClientsChart.destroy(); topClientsChart = null; }
}
