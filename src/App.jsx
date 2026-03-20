import { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import KPICard from './components/KPICard/KPICard';
import Upload from './components/Upload/Upload';
import ExportButton from './components/ExportButton/ExportButton';
import QualPieChart from './components/QualPieChart/QualPieChart';
import ChampionCards from './components/ChampionCards/ChampionCards';
import './App.css';

// ── 2. FUNÇÃO DE NORMALIZAÇÃO DE QUALIFICAÇÃO ─────────────────────────────
const normalizarQualificacao = (valor) => {
  if (!valor || String(valor).trim() === '') return 'Não Preenchido';
  const v = String(valor).toLowerCase().trim();

  // Qualificado
  if (v.includes('sim') || v.includes('qualif')) return 'Qualificado';

  // Não Qualificado
  if (
    v.includes('não') || v.includes('nao') || v.includes('emprest') ||
    v.includes('errado') || v.includes('bloq') || v.includes('interesse')
  ) {
    return 'Não Qualificado';
  }

  return 'Não Preenchido';
};

// ── Normalização inteligente de criativos ─────────────────────────────────
const normalizarCriativo = (texto) => {
  if (!texto) return 'SEM NOME';
  return String(texto)
    .toUpperCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove acentos
    .replace(/[^\w\s]/g, '')           // remove pontuação e hífens
    .replace(/\s+/g, ' ')              // colapsa espaços múltiplos
    .trim();
};

// ── Estilos ────────────────────────────────────────────────────────────────
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
  // Tabela
  tableWrap: {
    overflowX: 'auto',
    borderRadius: 10,
    border: '1px solid var(--border)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    padding: '10px 14px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    background: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8,
    padding: '12px 16px',
    color: '#f87171',
    fontSize: 13,
  },
};

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [dados, setDados] = useState(null); // dados processados (leads únicos)
  const [criativos, setCriativos] = useState(null); // agrupados por criativo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── 1. LEITURA CORRETA DA PLANILHA ───────────────────────────────────────
  const processarPlanilha = useCallback(async (file) => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (rawData.length === 0) {
        throw new Error('Planilha vazia ou sem dados válidos.');
      }

      // ── DEBUG: mostrar colunas encontradas no console ─────────────────
      const todasColunas = Object.keys(rawData[0]);
      console.log('COLUNAS ENCONTRADAS:', todasColunas);

      // ── Busca inteligente de colunas ──────────────────────────────────
      const colunaCriativo = todasColunas.find(c =>
        c.includes('Criativo') || c.includes('criativo') ||
        c.includes('Campanha') || c.includes('Anúncio') || c.includes('Anuncio')
      );
      const colunaConsultor = todasColunas.find(c =>
        c.toUpperCase().includes('CONSULTOR')
      );
      const colunaQualificado = todasColunas.find(c =>
        c.toUpperCase().includes('QUALIFICADO')
      );
      const colunaEmail = todasColunas.find(c =>
        c.toLowerCase().includes('email') || c.toLowerCase().includes('e-mail')
      );

      console.log('Coluna Criativo   :', colunaCriativo);
      console.log('Coluna Consultor  :', colunaConsultor);
      console.log('Coluna Qualificado:', colunaQualificado);
      console.log('Coluna Email      :', colunaEmail);

      if (!colunaCriativo) {
        alert(
          '❌ ERRO: Coluna de Criativo não encontrada!\n\n' +
          'Colunas disponíveis na planilha:\n' +
          todasColunas.join('\n')
        );
        setLoading(false);
        return;
      }

      // ── Processar cada linha usando colunas detectadas ─────────────────
      const dadosProcessados = rawData.map(row => ({
        criativo: normalizarCriativo(row[colunaCriativo]),
        consultor: String(row[colunaConsultor] || 'SEM CONSULTOR').toUpperCase().trim(),
        qualificado: normalizarQualificacao(row[colunaQualificado] || ''),
        email: String(row[colunaEmail] || '').toLowerCase().trim(),
      }));

      // Remover duplicatas por email
      const emailsVistos = new Set();
      const unicos = dadosProcessados.filter(lead => {
        if (!lead.email) return true; // sem email, mantém sempre
        if (emailsVistos.has(lead.email)) return false;
        emailsVistos.add(lead.email);
        return true;
      });

      setDados(unicos);

      // ── 3. PROCESSAMENTO COM 3 CATEGORIAS ─────────────────────────────
      const agrupado = {};
      unicos.forEach(lead => {
        if (!agrupado[lead.criativo]) {
          agrupado[lead.criativo] = {
            nome: lead.criativo,
            total: 0,
            qualificados: 0,
            naoQualificados: 0,
            naoPreenchidos: 0,
          };
        }

        agrupado[lead.criativo].total++;

        if (lead.qualificado === 'Qualificado') {
          agrupado[lead.criativo].qualificados++;
        } else if (lead.qualificado === 'Não Qualificado') {
          agrupado[lead.criativo].naoQualificados++;
        } else {
          agrupado[lead.criativo].naoPreenchidos++;
        }
      });

      // ── 4. CÁLCULO CORRETO DA TAXA ────────────────────────────────────
      const criativosArray = Object.values(agrupado).map(c => {
        const avaliados = c.qualificados + c.naoQualificados;
        const taxa = avaliados > 0 ? (c.qualificados / avaliados * 100).toFixed(1) : 0;

        return {
          ...c,
          taxa: parseFloat(taxa),
          badge: taxa >= 15 ? '🟢' : taxa >= 5 ? '🟡' : '🔴',
        };
      });

      // Ordenar por taxa desc
      criativosArray.sort((a, b) => b.taxa - a.taxa);
      setCriativos(criativosArray);

    } catch (e) {
      setError(e.message || 'Erro ao processar arquivo');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setDados(null);
    setCriativos(null);
    setError(null);
  }, []);

  // ── DADOS DE DEMONSTRAÇÃO ────────────────────────────────────────────────
  const loadDemoData = useCallback(() => {
    const DEMO_CRIATIVOS = [
      'VIDEO DEPOIMENTO CLIENTE A',
      'CARROSSEL BENEFICIOS',
      'BANNER OFERTA ESPECIAL',
      'VIDEO EXPLICATIVO PRODUTO',
      'IMAGEM ESTATICA PROMO',
    ];
    const CONSULTORES = ['LUCAS', 'ANA', 'PEDRO', 'MARIANA', 'CARLOS'];
    const QUALIFS = ['Qualificado', 'Qualificado', 'Qualificado', 'Não Qualificado', 'Não Preenchido'];

    const demoLeads = Array.from({ length: 120 }, (_, i) => ({
      criativo: DEMO_CRIATIVOS[i % DEMO_CRIATIVOS.length],
      consultor: CONSULTORES[i % CONSULTORES.length],
      qualificado: QUALIFS[Math.floor(i * 7 % QUALIFS.length)],
      email: `lead${i}@demo.com`,
    }));

    setDados(demoLeads);
    setError(null);

    const agrupado = {};
    demoLeads.forEach(lead => {
      if (!agrupado[lead.criativo]) {
        agrupado[lead.criativo] = { nome: lead.criativo, total: 0, qualificados: 0, naoQualificados: 0, naoPreenchidos: 0 };
      }
      agrupado[lead.criativo].total++;
      if (lead.qualificado === 'Qualificado') agrupado[lead.criativo].qualificados++;
      else if (lead.qualificado === 'Não Qualificado') agrupado[lead.criativo].naoQualificados++;
      else agrupado[lead.criativo].naoPreenchidos++;
    });

    const criativosArray = Object.values(agrupado).map(c => {
      const avaliados = c.qualificados + c.naoQualificados;
      const taxa = avaliados > 0 ? parseFloat((c.qualificados / avaliados * 100).toFixed(1)) : 0;
      return { ...c, taxa, badge: taxa >= 15 ? '🟢' : taxa >= 5 ? '🟡' : '🔴' };
    });
    criativosArray.sort((a, b) => b.taxa - a.taxa);
    setCriativos(criativosArray);
  }, []);

  // ── 5. KPIs CORRETOS ────────────────────────────────────────────────────
  const calcularKPIs = () => {
    if (!dados) return {
      total: 0,
      qualificados: 0,
      naoQualificados: 0,
      naoPreenchidos: 0,
      taxa: 0,
    };

    const qualificados = dados.filter(d => d.qualificado === 'Qualificado').length;
    const naoQualificados = dados.filter(d => d.qualificado === 'Não Qualificado').length;
    const naoPreenchidos = dados.filter(d => d.qualificado === 'Não Preenchido').length;
    const avaliados = qualificados + naoQualificados;
    const taxa = avaliados > 0 ? (qualificados / avaliados * 100).toFixed(1) : 0;

    return {
      total: dados.length,
      qualificados,
      naoQualificados,
      naoPreenchidos,
      taxa: parseFloat(taxa),
    };
  };

  const kpis = useMemo(calcularKPIs, [dados]);
  const hasData = Boolean(dados);

  return (
    <div style={S.app}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.dot} />
          Dashboard de Qualificação
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasData && (
            <span style={S.badge}>
              {dados.length} leads
            </span>
          )}
          <ExportButton targetId="dashboard-content" disabled={!hasData} />
          <Upload
            onFile={processarPlanilha}
            onDemo={loadDemoData}
            loading={loading}
            error={null}
            hasData={hasData}
            onReset={handleReset}
          />
        </div>
      </header>

      <main style={S.main}>
        {error && (
          <div style={S.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {!hasData ? (
          /* Upload screen */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', gap: 16 }}>
            <div style={S.hero}>
              <h1 style={{ ...S.heroTitle, textAlign: 'center', fontSize: 28 }}>
                Dashboard de Qualificação de Leads
              </h1>
              <p style={{ ...S.heroSub, textAlign: 'center', fontSize: 14 }}>
                Carregue a planilha com as colunas: <strong>Criativo Convertido</strong>, <strong>CONSULTOR</strong>, <strong>QUALIFICADO?</strong>, <strong>Email</strong>
              </p>
            </div>
            <Upload onFile={processarPlanilha} onDemo={loadDemoData} loading={loading} error={error} hasData={false} onReset={handleReset} />
          </div>
        ) : (
          <div id="dashboard-content">
            {/* KPIs */}
            <div style={{ ...S.section, marginBottom: 32 }}>
              <span style={S.sectionTitle}>Visão Geral</span>
              <div style={S.kpiGrid}>
                <KPICard title="Total de Leads" value={String(kpis.total)} icon={Users} color="lime" />
                <KPICard title="Qualificados" value={String(kpis.qualificados)} icon={CheckCircle} color="emerald" />
                <KPICard title="Não Qualificados" value={String(kpis.naoQualificados)} icon={XCircle} color="rose" />
                <KPICard title="Taxa de Qualif." value={`${kpis.taxa}%`} icon={TrendingUp} color="sky" />
              </div>
            </div>

            {/* Gráficos + Campeões */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              <QualPieChart
                qualificados={kpis.qualificados}
                naoQualificados={kpis.naoQualificados}
                naoPreenchidos={kpis.naoPreenchidos}
              />
              <ChampionCards criativos={criativos} />
            </div>

            {/* Tabela de Criativos */}
            <div style={S.section}>
              <span style={S.sectionTitle}>Ranking de Criativos por Qualificação</span>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>#</th>
                      <th style={S.th}>Criativo</th>
                      <th style={S.th}>Total Leads</th>
                      <th style={S.th}>Qualificados</th>
                      <th style={S.th}>Não Qualificados</th>
                      <th style={S.th}>Não Preenchidos</th>
                      <th style={S.th}>Taxa (avaliados)</th>
                      <th style={S.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criativos.map((c, i) => (
                      <tr key={c.nome} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={{ ...S.td, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                          {i + 1}
                        </td>
                        <td style={{ ...S.td, maxWidth: 320, wordBreak: 'break-word', fontWeight: 500 }}>
                          {c.nome}
                        </td>
                        <td style={{ ...S.td, fontFamily: 'var(--font-mono)' }}>
                          {c.total}
                        </td>
                        <td style={{ ...S.td, color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
                          {c.qualificados}
                        </td>
                        <td style={{ ...S.td, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                          {c.naoQualificados}
                        </td>
                        <td style={{ ...S.td, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                          {c.naoPreenchidos}
                        </td>
                        <td style={{ ...S.td, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {c.taxa}%
                        </td>
                        <td style={{ ...S.td, fontSize: 16 }}>
                          {c.badge}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
