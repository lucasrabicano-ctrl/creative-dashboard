import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Mapeamento de nomes alternativos de colunas para os nomes canônicos
const COLUMN_ALIASES = {
  // Identificadores
  'id': ['id', 'ad_id', 'campaign_id', 'creative_id', 'adid'],
  'name': ['name', 'ad_name', 'creative_name', 'title', 'ad_set_name', 'campaign_name', 'criativo', 'nome'],
  'campaign': ['campaign', 'campaign_name', 'campanha', 'camp'],
  'format': ['format', 'ad_format', 'formato', 'type', 'tipo', 'creative_type'],
  'platform': ['platform', 'placement', 'channel', 'plataforma', 'canal', 'publisher_platform'],
  
  // Métricas de entrega
  'impressions': ['impressions', 'impressoes', 'impress', 'reach', 'alcance', 'views', 'visualizacoes'],
  'clicks': ['clicks', 'cliques', 'link_clicks', 'outbound_clicks'],
  'spend': ['spend', 'gasto', 'cost', 'custo', 'amount_spent', 'budget_spent', 'investimento'],
  'reach': ['reach', 'alcance', 'unique_reach'],
  
  // Métricas de engajamento
  'engagement': ['engagement', 'engajamento', 'post_engagement', 'total_engagement'],
  'likes': ['likes', 'curtidas', 'reactions', 'reaction_count'],
  'comments': ['comments', 'comentarios', 'comment_count'],
  'shares': ['shares', 'compartilhamentos', 'share_count'],
  'saves': ['saves', 'salvamentos', 'save_count', 'bookmarks'],
  
  // Métricas de vídeo
  'video_views': ['video_views', 'video_plays', 'views_video', 'visualizacoes_video'],
  'video_views_25': ['video_p25_watched_actions', 'video_25', 'views_25', 'thruplay_25'],
  'video_views_50': ['video_p50_watched_actions', 'video_50', 'views_50', 'thruplay_50'],
  'video_views_75': ['video_p75_watched_actions', 'video_75', 'views_75', 'thruplay_75'],
  'video_views_100': ['video_p100_watched_actions', 'video_100', 'views_100', 'thruplay_100', 'video_complete'],
  
  // Conversões
  'conversions': ['conversions', 'conversoes', 'results', 'resultados', 'purchases', 'compras', 'leads'],
  'revenue': ['revenue', 'receita', 'purchase_value', 'conversion_value', 'value'],
  
  // Datas
  'date': ['date', 'data', 'report_date', 'day', 'dia', 'period'],
  'start_date': ['start_date', 'data_inicio', 'date_start'],
  'end_date': ['end_date', 'data_fim', 'date_stop'],
};

function normalizeColumnName(col) {
  const lower = col.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
  for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.includes(lower)) return canonical;
  }
  return lower;
}

function parseNumber(val) {
  if (val === null || val === undefined || val === '') return 0;
  const str = String(val).replace(/[R$\s,\.]/g, (m) => m === ',' ? '.' : '');
  // Handle Brazilian number format (dots as thousand separators, comma as decimal)
  const cleaned = String(val).replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export function parseFileData(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const processed = processRawData(results.data);
            resolve(processed);
          } catch (err) {
            reject(err);
          }
        },
        error: reject,
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rawData = XLSX.utils.sheet_to_json(ws, { defval: '' });
          const processed = processRawData(rawData);
          resolve(processed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Formato não suportado. Use CSV, XLSX ou XLS.'));
    }
  });
}

function processRawData(rawRows) {
  if (!rawRows || rawRows.length === 0) throw new Error('Arquivo vazio ou sem dados.');
  
  // Build column mapping
  const sampleRow = rawRows[0];
  const originalCols = Object.keys(sampleRow);
  const colMap = {};
  originalCols.forEach(col => {
    colMap[col] = normalizeColumnName(col);
  });
  
  const rows = rawRows.map((rawRow, i) => {
    const row = { _index: i };
    originalCols.forEach(orig => {
      const canonical = colMap[orig];
      row[canonical] = rawRow[orig];
    });
    
    // Ensure numeric fields
    const numericFields = [
      'impressions', 'clicks', 'spend', 'reach', 'engagement',
      'likes', 'comments', 'shares', 'saves', 'video_views',
      'video_views_25', 'video_views_50', 'video_views_75', 'video_views_100',
      'conversions', 'revenue',
    ];
    numericFields.forEach(f => {
      row[f] = parseNumber(row[f]);
    });
    
    return row;
  });
  
  // Detect available columns
  const detectedColumns = new Set(Object.values(colMap));
  
  return { rows, detectedColumns, colMap, originalCols };
}

export function computeMetrics(rows) {
  const totalImpressions = rows.reduce((s, r) => s + (r.impressions || 0), 0);
  const totalClicks = rows.reduce((s, r) => s + (r.clicks || 0), 0);
  const totalSpend = rows.reduce((s, r) => s + (r.spend || 0), 0);
  const totalReach = rows.reduce((s, r) => s + (r.reach || 0), 0);
  const totalConversions = rows.reduce((s, r) => s + (r.conversions || 0), 0);
  const totalRevenue = rows.reduce((s, r) => s + (r.revenue || 0), 0);
  const totalEngagement = rows.reduce((s, r) => s + ((r.engagement || 0) + (r.likes || 0) + (r.comments || 0) + (r.shares || 0)), 0);
  const totalVideoViews = rows.reduce((s, r) => s + (r.video_views || 0), 0);
  const totalVideoComplete = rows.reduce((s, r) => s + (r.video_views_100 || 0), 0);

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const engRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0;
  const vtr = totalImpressions > 0 ? (totalVideoViews / totalImpressions) * 100 : 0;
  const videoCompleteRate = totalVideoViews > 0 ? (totalVideoComplete / totalVideoViews) * 100 : 0;
  const frequency = totalReach > 0 ? totalImpressions / totalReach : 0;

  return {
    totalImpressions, totalClicks, totalSpend, totalReach,
    totalConversions, totalRevenue, totalEngagement, totalVideoViews, totalVideoComplete,
    ctr, cpm, cpc, cpa, roas, convRate, engRate, vtr, videoCompleteRate, frequency,
  };
}

export function groupByField(rows, field) {
  const groups = {};
  rows.forEach(row => {
    const key = row[field] || 'Não definido';
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });
  return Object.entries(groups).map(([key, items]) => ({
    name: key,
    rows: items,
    ...computeMetrics(items),
  }));
}

export function groupByDate(rows) {
  const groups = {};
  rows.forEach(row => {
    const date = row.date || row.start_date || row.end_date || 'Sem data';
    if (!groups[date]) groups[date] = [];
    groups[date].push(row);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, items]) => ({
      date,
      ...computeMetrics(items),
    }));
}

export function generateMockData() {
  const formats = ['Story', 'Reels', 'Feed', 'Carrossel', 'Video'];
  const platforms = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn'];
  const campaigns = ['Brand Awareness Q1', 'Performance Leads', 'Retargeting Hot', 'Seasonal Sale', 'Product Launch'];
  
  const rows = [];
  const today = new Date();
  
  for (let day = 29; day >= 0; day--) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    
    formats.forEach((format, fi) => {
      platforms.forEach((platform, pi) => {
        const baseImpressions = (5000 + Math.random() * 15000) * (1 + (29 - day) / 60);
        const baseCTR = 0.01 + Math.random() * 0.04;
        const baseConvRate = 0.02 + Math.random() * 0.08;
        const baseCPM = 8 + Math.random() * 25;
        
        const impressions = Math.floor(baseImpressions);
        const reach = Math.floor(impressions * (0.6 + Math.random() * 0.3));
        const clicks = Math.floor(impressions * baseCTR);
        const spend = (impressions / 1000) * baseCPM;
        const conversions = Math.floor(clicks * baseConvRate);
        const revenue = conversions * (50 + Math.random() * 200);
        const likes = Math.floor(impressions * 0.02 * Math.random());
        const comments = Math.floor(likes * 0.1 * Math.random());
        const shares = Math.floor(likes * 0.05 * Math.random());
        const video_views = format === 'Reels' || format === 'Video' ? Math.floor(impressions * 0.7) : 0;
        const video_views_100 = format === 'Reels' || format === 'Video' ? Math.floor(video_views * 0.3) : 0;
        
        rows.push({
          _index: rows.length,
          date: dateStr,
          name: `${format} - ${campaigns[fi % campaigns.length]}`,
          campaign: campaigns[(fi + pi) % campaigns.length],
          format,
          platform,
          impressions,
          reach,
          clicks,
          spend: parseFloat(spend.toFixed(2)),
          conversions,
          revenue: parseFloat(revenue.toFixed(2)),
          likes,
          comments,
          shares,
          video_views,
          video_views_100,
          engagement: likes + comments + shares,
        });
      });
    });
  }
  
  return {
    rows,
    detectedColumns: new Set([
      'date', 'name', 'campaign', 'format', 'platform',
      'impressions', 'reach', 'clicks', 'spend', 'conversions', 'revenue',
      'likes', 'comments', 'shares', 'video_views', 'video_views_100', 'engagement',
    ]),
  };
}

export function formatNumber(n, opts = {}) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  const { prefix = '', suffix = '', decimals } = opts;
  
  if (decimals !== undefined) {
    return `${prefix}${n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  }
  
  if (Math.abs(n) >= 1e6) return `${prefix}${(n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M${suffix}`;
  if (Math.abs(n) >= 1e3) return `${prefix}${(n / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}K${suffix}`;
  return `${prefix}${n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${suffix}`;
}

export function formatCurrency(n) {
  if (isNaN(n) || n === undefined) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
}

export function formatPercent(n) {
  if (isNaN(n) || n === undefined) return '—';
  return `${n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
}
