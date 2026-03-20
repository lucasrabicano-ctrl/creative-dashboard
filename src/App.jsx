import { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { DollarSign, MousePointerClick, Eye, TrendingUp, Image, Zap } from 'lucide-react';
import KPICard from './components/KPICard/KPICard';
import Upload from './components/Upload/Upload';
import CreativeTable from './components/CreativeTable/CreativeTable';
import Charts from './components/Charts/Charts';
import ExportButton from './components/ExportButton/ExportButton';
import { fmt } from './utils/format';
import './App.css';

// ── Demo data ──────────────────────────────────────────────────────────────
const DEMO_ROWS = [
  { creative: 'UGC_Café_01', format: 'Reels', spend: 4200, impressions: 320000, clicks: 8400, conversions: 210, revenue: 18900 },
  { creative: 'Estático_Promo_B', format: 'Feed', spend: 2800, impressions: 190000, clicks: 4750, conversions: 142, revenue: 9940 },
  { creative: 'Carrossel_Reviews', format: 'Carrossel', spend: 3100, impressions: 250000, clicks: 6250, conversions: 175, revenue: 15750 },
  { creative: 'UGC_Unboxing_02', format: 'Reels', spend: 5600, impressions: 480000, clicks: 12000, conversions: 336, revenue: 30240 },
  { creative: 'Estático_Branding_A', format: 'Feed', spend: 1900, impressions: 140000, clicks: 2800, conversions: 70, revenue: 4200 },
  { creative: 'Vídeo_Depoimento', format: 'Story', spend: 3400, impressions: 210000, clicks: 5250, conversions: 131, revenue: 11790 },
  { creative: 'Carrossel_Produtos', format: 'Carrossel', spend: 2200, impressions: 175000, clicks: 4375, conversions: 109, revenue: 7630 },
  { creative: 'UGC_Tutorial_03', format: 'Reels', spend: 6100, impressions: 520000, clicks: 15600, conversions: 448, revenue: 40320 },
  { creative: 'Estático_Oferta_C', format: 'Feed', spend: 1600, impressions: 120000, clicks: 2400, conversions: 60, revenue: 3600 },
  { creative: 'Vídeo_Animado_01', format: 'Story', spend: 2900, impressions: 230000, clicks: 5750, conversions: 144, revenue: 12960 },
];

// ── Column map aliases ─────────────────────────────────────────────────────
const COL_ALIASES = {
  creative: ['creative', 'criativo', 'name', 'nome', 'ad name', 'ad_name', 'creative name'],
  format: ['format', 'formato', 'type', 'tipo', 'ad format'],
  spend: ['spend', 'gasto', 'cost', 'custo', 'amount spent', 'valor gasto'],
  impressions: ['impressions', 'impressões', 'impress'],
  clicks: ['clicks', 'cliques', 'link clicks'],
  conversions: ['conversions', 'conversões', 'purchases', 'compras', 'results'],
  revenue: ['revenue', 'receita', 'purchase value', 'valor de compra', 'amount', 'roas value'],
};

function findColumn(headers, key) {
  const aliases = COL_ALIASES[key];
  return headers.find(h => aliases.some(a => h.toLowerCase().trim().includes(a)));
}

function parseRows(sheetData) {
  if (!sheetData || sheetData.length < 2) return [];
  const [header, ...rows] = sheetData;
  const headers = header.map((h) => String(h ?? ''));
  const colMap = {};
  for (const key of Object.keys(COL_ALIASES)) {
    colMap[key] = findColumn(headers, key);
  }

  return rows
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      const parsed = {};
      for (const key of Object.keys(COL_ALIASES)) {
        const col = colMap[key];
        const val = col !== undefined ? obj[col] : undefined;
        parsed[key] = ['spend', 'impressions', 'clicks', 'conversions', 'revenue'].includes(key)
          ? parseFloat(String(val ?? '').replace(/[^0-9.-]/g, '')) || 0
          : String(val ?? '').trim() || '—';
      }
      return parsed;
    })
    .filter((r) => r.creative && r.creative !== '—');
}

function deriveMetrics(rows) {
  return rows.map((r) => ({
    ...r,
    ctr: r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0,
    cpc: r.clicks > 0 ? r.spend / r.clicks : 0,
    cpa: r.conversions > 0 ? r.spend / r.conversions : 0,
    roas: r.spend > 0 ? r.revenue / r.spend : 0,
    cvr: r.clicks > 0 ? (r.conversions / r.clicks) * 100 : 0,
  }));
}

// ── Styles inlined ─────────────────────────────────────────────────────────
const S = {
  app: {
    minHeight: '100vh',
    background: 'var(--bg-black)',
    fontFamily: 'var(--font-body)',
  },
  header: {
    borderBottom: '1px solid var(--border)',
    padding: '0 32px',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    background: 'rgba(10,10,11,0.85)',
    backdropFilter: 'blur(12px)',
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--accent-lime)',
    boxShadow: '0 0 8px var(--accent-lime)',
  },
  badge: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 99,
    background: 'rgba(163,230,53,0.1)',
    color: 'var(--accent-lime)',
    border: '1px solid rgba(163,230,53,0.2)',
    fontFamily: 'var(--font-mono)',
  },
  main: {
    maxWidth: 1440,
    margin: '0 auto',
    padding: '32px 32px 64px',
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  heroSub: {
    fontSize: 13,
    color: 'var(--text-secondary)',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: 12,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
  },
};

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = useCallback(async (file) => {
    if (!file) {
      setRows(deriveMetrics(DEMO_ROWS));
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      const parsed = parseRows(data);
      if (parsed.length === 0) throw new Error('Nenhuma linha válida encontrada. Verifique as colunas do arquivo.');
      setRows(deriveMetrics(parsed));
    } catch (e) {
      setError(e.message || 'Erro ao processar arquivo');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setRows(null);
    setError(null);
  }, []);

  const totals = useMemo(() => {
    if (!rows) return null;
    const spend = rows.reduce((s, r) => s + r.spend, 0);
    const revenue = rows.reduce((s, r) => s + r.revenue, 0);
    const clicks = rows.reduce((s, r) => s + r.clicks, 0);
    const impressions = rows.reduce((s, r) => s + r.impressions, 0);
    const conversions = rows.reduce((s, r) => s + r.conversions, 0);
    return {
      spend,
      revenue,
      roas: spend > 0 ? revenue / spend : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpa: conversions > 0 ? spend / conversions : 0,
      creatives: rows.length,
    };
  }, [rows]);

  const hasData = Boolean(rows);

  return (
    <div style={S.app}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.dot} />
          Creative Dashboard
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasData && (
            <span style={S.badge}>
              {rows.length} criativos
            </span>
          )}
          <ExportButton targetId="dashboard-content" disabled={!hasData} />
          <Upload
            onFile={handleFile}
            loading={loading}
            error={null}
            hasData={hasData}
            onReset={handleReset}
          />
        </div>
      </header>

      <main style={S.main}>
        {!hasData ? (
          /* Upload screen */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', gap: 16 }}>
            <div style={S.hero}>
              <h1 style={{ ...S.heroTitle, textAlign: 'center', fontSize: 28 }}>
                Análise de Performance de Criativos
              </h1>
              <p style={{ ...S.heroSub, textAlign: 'center', fontSize: 14 }}>
                Carregue seus dados de campanhas para visualizar métricas, ROAS, CTR e rankings
              </p>
            </div>
            <Upload onFile={handleFile} loading={loading} error={error} hasData={false} onReset={handleReset} />
          </div>
        ) : (
          <div id="dashboard-content">
            {/* KPIs */}
            <div style={{ ...S.section, marginBottom: 32 }}>
              <span style={S.sectionTitle}>Visão Geral</span>
              <div style={S.kpiGrid}>
                <KPICard title="Investimento" value={fmt.currency(totals.spend)} icon={DollarSign} color="lime" />
                <KPICard title="Receita" value={fmt.currency(totals.revenue)} icon={TrendingUp} color="emerald" />
                <KPICard title="ROAS" value={fmt.roas(totals.roas)} icon={Zap} color="amber" />
                <KPICard title="CTR" value={fmt.pct(totals.ctr)} icon={MousePointerClick} color="sky" />
                <KPICard title="CPA" value={fmt.currency(totals.cpa)} icon={Eye} color="violet" />
                <KPICard title="Criativos" value={fmt.number(totals.creatives)} icon={Image} color="rose" />
              </div>
            </div>

            {/* Charts */}
            <div style={{ ...S.section, marginBottom: 32 }}>
              <span style={S.sectionTitle}>Análise Visual</span>
              <Charts rows={rows} />
            </div>

            {/* Table */}
            <div style={S.section}>
              <span style={S.sectionTitle}>Ranking de Criativos</span>
              <CreativeTable data={rows} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
