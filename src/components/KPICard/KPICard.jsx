import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './KPICard.module.css';

export default function KPICard({ title, value, sub, trend, icon: Icon, color = 'lime', loading }) {
  const trendIcon = trend > 0 ? <TrendingUp size={13} /> : trend < 0 ? <TrendingDown size={13} /> : <Minus size={13} />;
  const trendClass = trend > 0 ? styles.positive : trend < 0 ? styles.negative : styles.neutral;

  return (
    <div className={`${styles.card} ${styles[`color_${color}`]}`}>
      {Icon && (
        <div className={styles.iconWrap}>
          <Icon size={18} strokeWidth={1.5} />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value}>
          {loading ? <div className={styles.skeleton} /> : value}
        </div>
        {sub && (
          <div className={styles.sub}>
            {trend !== undefined && (
              <span className={`${styles.trend} ${trendClass}`}>
                {trendIcon}
                {Math.abs(trend).toFixed(1)}%
              </span>
            )}
            <span className={styles.subText}>{sub}</span>
          </div>
        )}
      </div>
    </div>
  );
}
