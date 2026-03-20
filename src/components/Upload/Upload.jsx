import React, { useCallback } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import styles from './Upload.module.css';

export default function Upload({ onFile, loading, error, hasData, onReset }) {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  const handleChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  }, [onFile]);

  if (hasData) {
    return (
      <div className={styles.mini}>
        <FileText size={16} color="var(--accent-lime)" strokeWidth={1.5} />
        <span className={styles.miniLabel}>Dados carregados</span>
        <button className={styles.miniReset} onClick={onReset} title="Carregar novo arquivo">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropzone} ${loading ? styles.loading : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.currentTarget.classList.add(styles.dragover)}
        onDragLeave={(e) => e.currentTarget.classList.remove(styles.dragover)}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          className={styles.input}
          onChange={handleChange}
          id="file-upload"
        />
        <label htmlFor="file-upload" className={styles.label}>
          {loading ? (
            <div className={styles.loadingSpinner} />
          ) : (
            <div className={styles.icon}>
              <UploadCloud size={40} strokeWidth={1.2} />
            </div>
          )}
          <div className={styles.text}>
            <span className={styles.title}>
              {loading ? 'Processando arquivo...' : 'Carregar dados de criativos'}
            </span>
            <span className={styles.subtitle}>
              {loading ? 'Aguarde um momento' : 'Arraste um arquivo ou clique para selecionar'}
            </span>
            {!loading && (
              <span className={styles.formats}>CSV, XLSX, XLS suportados</span>
            )}
          </div>
        </label>
        {error && (
          <div className={styles.error}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
      <button
        className={styles.demoBtn}
        onClick={() => onFile(null)}
        disabled={loading}
      >
        Usar dados de demonstração
      </button>
    </div>
  );
}
