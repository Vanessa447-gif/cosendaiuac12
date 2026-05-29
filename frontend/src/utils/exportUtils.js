import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = (documents, title) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text(`Généré le ${new Date().toLocaleDateString()}`, 14, 32);
  
  const tableColumn = ["ID", "Titre", "Catégorie", "Vues", "Téléchargements", "Date"];
  const tableRows = documents.map(doc => [
    doc.id,
    doc.title_fr,
    doc.category_name_fr,
    doc.views_count,
    doc.downloads_count,
    new Date(doc.created_at).toLocaleDateString()
  ]);
  
  doc.autoTable(tableColumn, tableRows, { startY: 40 });
  doc.save(`${title}.pdf`);
};

export const exportToExcel = (documents, title) => {
  const data = documents.map(doc => ({
    ID: doc.id,
    'Titre (FR)': doc.title_fr,
    'Titre (EN)': doc.title_en,
    'Catégorie': doc.category_name_fr,
    'Vues': doc.views_count,
    'Téléchargements': doc.downloads_count,
    'Date création': new Date(doc.created_at).toLocaleDateString(),
    'Taille': `${(doc.file_size / 1024 / 1024).toFixed(2)} MB`
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title);
  XLSX.writeFile(wb, `${title}.xlsx`);
};