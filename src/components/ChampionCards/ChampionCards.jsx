const MEDAL = ['🥇', '🥈', '🥉'];

function ChampionCard({ criativo, rank }) {
  const pct = criativo.taxa;
  const barColor = pct >= 15 ? '#4ade80' : pct >= 5 ? '#fbbf24' : '#f87171';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow background */}
      <div style={{
        position: 'absolute',
        top: -40,
        right: -40,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: barColor,
        opacity: 0.05,
        filter: 'blur(24px)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 22 }}>{MEDAL[rank]}</span>
        <div style={{
          fontSize: 20,
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: barColor,
        }}>
          {pct}%
        </div>
      </div>

      {/* Nome */}
      <p style={{
        fontSize: 11,
        color: 'var(--text-secondary)',
        wordBreak: 'break-word',
        lineHeight: 1.4,
        margin: 0,
      }}>
        {criativo.nome}
      </p>

      {/* Barra de progresso */}
      <div style={{
        height: 4,
        borderRadius: 99,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(pct, 100)}%`,
          borderRadius: 99,
          background: barColor,
          transition: 'width 0.8s ease',
        }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
        <span style={{ color: '#4ade80' }}>✔ {criativo.qualificados}</span>
        <span style={{ color: '#f87171' }}>✘ {criativo.naoQualificados}</span>
        <span style={{ color: 'var(--text-muted)' }}>Total: {criativo.total}</span>
      </div>
    </div>
  );
}

export default function ChampionCards({ criativos }) {
  const top3 = criativos.filter(c => c.qualificados + c.naoQualificados > 0).slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${top3.length}, 1fr)`,
      gap: 12,
    }}>
      {top3.map((c, i) => (
        <ChampionCard key={c.nome} criativo={c} rank={i} />
      ))}
    </div>
  );
}
