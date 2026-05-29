import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const ExportService = {
    toExcel: (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Documents');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    },

    toCSV: (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
    },

    toPDF: (data, title) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(title, 14, 22);
        doc.setFontSize(10);
        doc.text(`Généré le ${new Date().toLocaleString()}`, 14, 32);
        
        const columns = ['ID', 'Titre', 'Catégorie', 'Vues', 'Téléchargements'];
        const rows = data.map(item => [item.id, item.title_fr, item.category_name_fr, item.views_count, item.downloads_count]);
        
        doc.autoTable(columns, rows, { startY: 40 });
        doc.save(`${title}.pdf`);
    }
};