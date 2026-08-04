import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── helpers ────────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

const colLetter = (n) => {
    let s = '';
    while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
    return s;
};

const download = (buffer, filename) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
};

// ── Excel export (styled, ExcelJS) ────────────────────────────────────────────
export async function exportToExcel(data, filename, columns, title = filename) {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Mo Group'; wb.created = new Date();

    const ws = wb.addWorksheet(title, { views: [{ state: 'frozen', ySplit: 4 }] });
    const last = colLetter(columns.length);

    // Fila 1 — cabecera empresa
    ws.mergeCells(`A1:${last}1`);
    const c1 = ws.getCell('A1');
    c1.value = 'MO GROUP — Sistema de Gestión Comercial';
    c1.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
    c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    c1.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 34;

    // Fila 2 — subtítulo
    ws.mergeCells(`A2:${last}2`);
    const c2 = ws.getCell('A2');
    c2.value = `${title}   ·   Generado el ${new Date().toLocaleDateString('es-PE')}`;
    c2.font = { size: 9, color: { argb: 'FF94A3B8' }, italic: true, name: 'Calibri' };
    c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    c2.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 18;

    // Fila 3 — separador
    ws.getRow(3).height = 4;

    // Fila 4 — encabezados de columnas
    const hRow = ws.getRow(4);
    hRow.height = 26;
    columns.forEach((col, i) => {
        const cell = hRow.getCell(i + 1);
        cell.value = col.label;
        cell.font = { bold: true, size: 9.5, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF1E40AF' } } };
    });

    // Filas de datos (desde fila 5)
    data.forEach((row, ri) => {
        const dr = ws.getRow(ri + 5);
        dr.height = 20;
        const isEven = ri % 2 === 1;
        columns.forEach((col, ci) => {
            const cell = dr.getCell(ci + 1);
            const v = row[col.key];
            cell.value = v == null ? '' : (typeof v === 'number' ? v : String(v));
            cell.font = { size: 9, name: 'Calibri' };
            cell.alignment = { vertical: 'middle' };
            if (isEven) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            cell.border = {
                top: { style: 'hair', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
                right: { style: 'hair', color: { argb: 'FFE2E8F0' } },
            };
        });
    });

    // Anchos de columna automáticos
    columns.forEach((col, i) => {
        const max = Math.max(col.label.length, ...data.map(r => String(r[col.key] ?? '').length));
        ws.getColumn(i + 1).width = Math.min(Math.max(max + 4, 12), 45);
    });

    download(await wb.xlsx.writeBuffer(), `${filename}_${today()}.xlsx`);
}

// ── Excel template (styled, ExcelJS) ──────────────────────────────────────────
export async function downloadExcelTemplate(entityName, headers, sampleRows = []) {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Mo Group';
    const ws = wb.addWorksheet('Plantilla');
    const last = colLetter(headers.length);

    // Fila 1 — título
    ws.mergeCells(`A1:${last}1`);
    const c1 = ws.getCell('A1');
    c1.value = `Plantilla de Importación — ${entityName}   ·   Mo Group`;
    c1.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
    c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    c1.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 28;

    // Fila 2 — instrucción
    ws.mergeCells(`A2:${last}2`);
    const c2 = ws.getCell('A2');
    c2.value = '  ⚠  Completa los datos a partir de la fila 4. No modifiques los encabezados de la fila 3.';
    c2.font = { size: 9, color: { argb: 'FF92400E' }, name: 'Calibri' };
    c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
    c2.alignment = { horizontal: 'left', vertical: 'middle' };
    c2.border = { left: { style: 'medium', color: { argb: 'FFF59E0B' } } };
    ws.getRow(2).height = 20;

    // Fila 3 — encabezados
    const hRow = ws.getRow(3);
    hRow.height = 26;
    headers.forEach((h, i) => {
        const cell = hRow.getCell(i + 1);
        cell.value = h;
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getColumn(i + 1).width = Math.max(String(h).length + 4, 16);
    });

    // Filas de ejemplo
    sampleRows.forEach((sr, ri) => {
        const row = ws.getRow(ri + 4);
        row.height = 20;
        Object.values(sr).forEach((v, ci) => {
            const cell = row.getCell(ci + 1);
            cell.value = v;
            cell.font = { size: 9, color: { argb: 'FF64748B' }, italic: true, name: 'Calibri' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        });
    });

    download(await wb.xlsx.writeBuffer(), `plantilla_${entityName}.xlsx`);
}

// ── PDF export ─────────────────────────────────────────────────────────────────
export function exportToPDF(data, filename, columns, title) {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, doc.internal.pageSize.width, 22, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('MO GROUP', 14, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Portal Administrativo — Sistema de Gestión Comercial', 14, 19);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(title || filename, doc.internal.pageSize.width - 14, 12, { align: 'right' });
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, doc.internal.pageSize.width - 14, 19, { align: 'right' });

    autoTable(doc, {
        head: [columns.map(c => c.label)],
        body: data.map(row => columns.map(c => {
            const v = row[c.key];
            return v == null ? '—' : String(v);
        })),
        startY: 28,
        styles: { fontSize: 8.5, cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }, font: 'helvetica' },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        tableLineColor: [226, 232, 240],
        tableLineWidth: 0.3,
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`Mo Group — ${title}  |  Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 6, { align: 'center' });
    }

    doc.save(`${filename}_${today()}.pdf`);
}

// ── CSV parser ─────────────────────────────────────────────────────────────────
export function parseCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result.replace(/^﻿/, '');
                const lines = text.split(/\r?\n/).filter(l => l.trim());
                if (lines.length < 2) { resolve([]); return; }
                const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                const rows = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                    const obj = {};
                    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
                    return obj;
                }).filter(r => Object.values(r).some(v => v));
                resolve(rows);
            } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-8');
    });
}

// ── Excel parser (usa xlsx para leer) ─────────────────────────────────────────
export function parseExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array', raw: false });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

                // Buscar la fila de encabezados: primera fila con ≥2 valores no vacíos y cortos
                let headerIdx = 0;
                for (let i = 0; i < Math.min(rawRows.length, 6); i++) {
                    const nonempty = rawRows[i].filter(v => v && String(v).trim() && String(v).length < 80);
                    if (nonempty.length >= 2) { headerIdx = i; break; }
                }

                const headers = rawRows[headerIdx].map(h => String(h || '').trim()).filter(Boolean);
                const rows = rawRows.slice(headerIdx + 1)
                    .filter(row => row.some(v => v !== '' && v !== null && v !== undefined))
                    .map(row => {
                        const obj = {};
                        headers.forEach((h, i) => { obj[h] = row[i] != null ? String(row[i]).trim() : ''; });
                        return obj;
                    });
                resolve(rows);
            } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// ── Auto-detectar tipo de archivo ─────────────────────────────────────────────
export function parseFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    return (ext === 'xlsx' || ext === 'xls') ? parseExcel(file) : parseCSV(file);
}
