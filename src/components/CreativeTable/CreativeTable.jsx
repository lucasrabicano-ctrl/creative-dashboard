import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink } from 'lucide-react';
import styles from './CreativeTable.module.css';
import { fmt } from '../../utils/format';

const COLS = [
  { key: 'creative', label: 'Criativo', sortable: true },
  { key: 'spend', label: 'Investimento', sortable: true, format: 'currency' },
  { key: 'impressions', label: 'Impressões', sortable: true, format: 'number' },
  { key: 'clicks', label: 'Cliques', sortable: true, format: 'number' },
  { key: 'ctr', label: 'CTR', sortable: true, format: 'pct' },
  { key: 'cpc', label: 'CPC', sortable: true, format: 'currency' },
  { key: 'conversions', label: 'Conversões', sortable: true, format: 'number' },
  { key: 'roas', label: 'ROAS', sortable: true, format: 'roas' },
  { key: 'cpa', label: 'CPA', sortable: true, format: 'currency' },
];

function ScoreBadge({ roas }) {
  if (roas >= 4) return <span className={`${styles.badge} ${styles.excellent}`}>Excelente</span>;
  if (roas >= 2) return <span className={`${styles.badge} ${styles.good}`}>Bom</span>;
  if (roas >= 1) return <span className={`${styles.badge} ${styles.ok}`}>Regular</span>;
  return <span className={`${styles.badge} ${styles.poor}`}>Fraco</span>;
}

export default function CreativeTable({ data = [], loading }) {
  const [sortKey, setSortKey] = useState('spend');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

  const handleSort = (key) => {
    if (!COLS.find(c => c.key === key)?.sortable) return;
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
  };

  const sorted = useMemo(() => {
    const clone = [...data];
    clone.sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return clone;
  }, [data, sortKey, sortDir]);

  const paged = sorted.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <ChevronsUpDown size={12} className={styles.sortIcon} />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className={`${styles.sortIcon} ${styles.active}`} />
      : <ChevronDown size={12} className={`${styles.sortIcon} ${styles.active}`} />;
  };

  const formatVal = (col, val) => {
    if (val == null || val === '') return '—';
    switch (col.format) {
      case 'currency': return fmt.currency(val);
      case 'number': return fmt.number(val);
      case 'pct': return fmt.pct(val);
      case 'roas': return `${Number(val).toFixed(2)}x`;
      default: return val;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>Criativos</span>
        <span className={styles.count}>{data.length} itens</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLS.map(col => (
                <th
                  key={col.key}
                  className={`${styles.th} ${col.sortable ? styles.sortable : ''}`}
                  onClick={() => handleSort(col.key)}
                >
                  <span className={styles.thInner}>
                    {col.label}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
              <th className={styles.th}>Score</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.row}>
                  {COLS.map((col, j) => (
                    <td key={j} className={styles.td}>
                      <div className={styles.skeleton} />
                    </td>
                  ))}
                  <td className={styles.td}><div className={styles.skeleton} /></td>
                </tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={COLS.length + 1} className={styles.empty}>
                  Nenhum criativo encontrado
                </td>
              </tr>
            ) : paged.map((row, i) => (
              <tr key={i} className={styles.row}>
                {COLS.map(col => (
                  <td key={col.key} className={`${styles.td} ${col.key === 'creative' ? styles.name : ''}`}>
                    {col.key === 'creative' ? (
                      <div className={styles.nameCell}>
                        <div className={styles.thumb} style={{ background: `hsl(${(i * 47 + 120) % 360}, 70%, 25%)` }}>
                          {String(row[col.key] ?? '?')[0]?.toUpperCase()}
                        </div>
                        <span className={styles.nameText} title={row[col.key]}>{row[col.key] ?? '—'}</span>
                      </div>
                    ) : formatVal(col, row[col.key])}
                  </td>
                ))}
                <td className={styles.td}>
                  <ScoreBadge roas={row.roas ?? 0} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
            ←
          </button>
          <span className={styles.pageInfo}>Página {page + 1} de {pages}</span>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page === pages - 1}>
            →
          </button>
        </div>
      )}
    </div>
  );
}
