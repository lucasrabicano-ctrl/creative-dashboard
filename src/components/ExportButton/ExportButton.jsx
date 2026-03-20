import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportDashboardPdf } from '../../utils/exportPdf';
import styles from './ExportButton.module.css';

export default function ExportButton({ targetId = 'dashboard-content', disabled = false }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await exportDashboardPdf(targetId, 'creative-dashboard.pdf');
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className={styles.button}
      onClick={handleExport}
      disabled={disabled || loading}
      title={disabled ? 'Carregue dados para exportar' : 'Exportar como PDF'}
    >
      {loading ? (
        <Loader2 className={styles.spinner} size={16} />
      ) : (
        <Download size={16} />
      )}
      <span>{loading ? 'Gerando...' : 'Exportar PDF'}</span>
    </button>
  );
}
