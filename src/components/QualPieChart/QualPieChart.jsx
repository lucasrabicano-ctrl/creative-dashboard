import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  Qualificado: '#4ade80',
  'Não Qualificado': '#f87171',
  'Não Preenchido': '#fbbf24',
};

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function QualPieChart({ qualificados, naoQualificados, naoPreenchidos }) {
  const data = [
    { name: 'Qualificado', value: qualificados },
    { name: 'Não Qualificado', value: naoQualificados },
    { name: 'Não Preenchido', value: naoPreenchidos },
  ].filter(d => d.value > 0);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
      }}>
        Distribuição de Qualificação
      </span>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#1a1a1b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
            }}
            formatter={(value, name) => [value, name]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
