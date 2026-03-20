export const fmt = {
  currency: (v) => {
    if (v == null || isNaN(v)) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(v);
  },
  number: (v) => {
    if (v == null || isNaN(v)) return '—';
    return new Intl.NumberFormat('pt-BR').format(v);
  },
  pct: (v) => {
    if (v == null || isNaN(v)) return '—';
    return `${Number(v).toFixed(2)}%`;
  },
  roas: (v) => {
    if (v == null || isNaN(v)) return '—';
    return `${Number(v).toFixed(2)}x`;
  },
};
