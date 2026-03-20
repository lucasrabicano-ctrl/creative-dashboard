import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captura o elemento identificado por `elementId` e gera um PDF para download.
 * @param {string} elementId - id do elemento DOM a capturar
 * @param {string} [filename='creative-dashboard.pdf'] - nome do arquivo a baixar
 */
export async function exportDashboardPdf(elementId, filename = 'creative-dashboard.pdf') {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Elemento #${elementId} não encontrado`);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0a0a0b',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Determina orientação baseada na proporção
  const orientation = imgWidth > imgHeight ? 'l' : 'p';
  const pdf = new jsPDF({ orientation, unit: 'px', format: [imgWidth / 2, imgHeight / 2] });

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth / 2, imgHeight / 2);
  pdf.save(filename);
}
