import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, Upload, ChevronDown, TableProperties } from 'lucide-react';

/**
 * onExcel, onPDF   — export handlers (required)
 * onTemplate       — download CSV template handler (optional)
 * onImport         — CSV import handler (file) (optional)
 * importLabel      — label for import button
 */
export default function ExportMenu({ onExcel, onPDF, onTemplate, onImport, importLabel = 'Importar CSV o Excel' }) {
    const [open, setOpen] = useState(false);
    const fileRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const run = (fn) => { fn(); setOpen(false); };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar / Importar</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden py-1.5">
                    <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Exportar</p>

                    <button
                        onClick={() => run(onExcel)}
                        className="w-full px-3 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
                        <span className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        </span>
                        <span>Exportar a Excel</span>
                    </button>

                    <button
                        onClick={() => run(onPDF)}
                        className="w-full px-3 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
                        <span className="w-7 h-7 rounded-md bg-red-100 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-red-500" />
                        </span>
                        <span>Exportar a PDF</span>
                    </button>

                    {(onTemplate || onImport) && (
                        <>
                            <div className="border-t border-slate-100 my-1.5" />
                            <p className="px-3 pt-0.5 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Importar</p>

                            {onTemplate && (
                                <button
                                    onClick={() => run(onTemplate)}
                                    className="w-full px-3 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
                                    <span className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                                        <TableProperties className="w-4 h-4 text-blue-500" />
                                    </span>
                                    <span>Descargar Plantilla</span>
                                </button>
                            )}

                            {onImport && (
                                <button
                                    onClick={() => { fileRef.current?.click(); setOpen(false); }}
                                    className="w-full px-3 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
                                    <span className="w-7 h-7 rounded-md bg-violet-100 flex items-center justify-center shrink-0">
                                        <Upload className="w-4 h-4 text-violet-500" />
                                    </span>
                                    <span>{importLabel}</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}

            {onImport && (
                <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={e => {
                        if (e.target.files[0]) onImport(e.target.files[0]);
                        e.target.value = '';
                    }}
                />
            )}
        </div>
    );
}
