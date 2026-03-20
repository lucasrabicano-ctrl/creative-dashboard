import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import styles from './Charts.module.css';
import { fmt } from '../../utils/format';

const COLORS = {
  spend: '#a3e635',
  roas: '#38bdf8',
  conversions: '#a78bfa',
  ctr: '#fb923c',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.ttLabel}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className={styles.ttRow}>
          <div className={styles.ttDot} style={{ background: p.color }} />
          <span className={styles.ttName}>{p.name}</span>
          <span className={styles.ttVal}>{p.value?.toFixed ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function SpendRoasChart({ data }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Investimento vs ROAS</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a3e635" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gRoas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}x`} />
          <Tooltip content={<CustomTooltip />} />
          <Area yAxisId="left" type="monotone" dataKey="spend" name="Investimento" stroke="#a3e635" strokeWidth={2} fill="url(#gSpend)" dot={false} />
          <Area yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke="#38bdf8" strokeWidth={2} fill="url(#gRoas)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopCreativesChart({ data }) {
  const top = useMemo(() => [...data].sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0)).slice(0, 8), [data]);
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Top Criativos por Investimento</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={top} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="spend" name="Investimento" fill="#a3e635" radius={[0, 4, 4, 0]} fillOpacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConversionFunnelChart({ data }) {
  const top = useMemo(() => [...data].sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0)).slice(0, 6), [data]);
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Funil de Conversão</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={top} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
          <Bar dataKey="clicks" name="Cliques" fill="#38bdf8" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
          <Bar dataKey="conversions" name="Conversões" fill="#a78bfa" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CtrCpcChart({ data }) {
  const top = useMemo(() => [...data].sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0)).slice(0, 8), [data]);
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>CTR vs CPC por Criativo</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={top} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
          <Bar yAxisId="left" dataKey="ctr" name="CTR (%)" fill="#fb923c" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
          <Bar yAxisId="right" dataKey="cpc" name="CPC (R$)" fill="#34d399" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Default export: wrapper que compõe todos os gráficos ──────────────────
export default function Charts({ rows }) {
  const data = useMemo(
    () => rows.map((r) => ({ name: r.creative?.slice(0, 14) ?? '—', ...r })),
    [rows]
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 12 }}>
      <SpendRoasChart data={data} />
      <TopCreativesChart data={data} />
      <ConversionFunnelChart data={data} />
      <CtrCpcChart data={data} />
    </div>
  );
}
