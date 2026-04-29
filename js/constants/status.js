// =============================================
// STATUS.JS — Mapas de status, prioridades, labels
// =============================================
export const STATUS_LABELS = {
    backlog: 'Backlog',
    andamento: 'Em Andamento',
    revisao: 'Em Revisão',
    concluido: 'Concluído'
};

export const PRIORITY_LABELS = {
    baixa: '🟢 Baixa',
    media: '🟡 Média',
    alta: '🔴 Alta'
};

export const PRIORITY_ORDER = { alta: 0, media: 1, baixa: 2 };

export const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
