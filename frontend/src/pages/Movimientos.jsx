import { useState, useEffect } from "react";
import DasboardLayout from "../layouts/DashboardLayout";
import { apiFetch } from "../services/api";
import { Activity, ArrowUpRight, ArrowDownLeft, FileX } from "lucide-react";
import Pagination from "../components/Pagination";
import ExportMenu from "../components/ExportMenu";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

const COLS_EXPORT = [
  { key: 'tipo',        label: 'Tipo' },
  { key: 'fecha',       label: 'Fecha' },
  { key: 'contraparte', label: 'Contraparte' },
  { key: 'recibo',      label: 'N° Recibo' },
  { key: 'extra',       label: 'Detalle' },
  { key: 'total',       label: 'Total (S/)' },
];

const fmt = (v) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v || 0);

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [total, setTotal] = useState(0);
  const [tipo, setTipo] = useState("");
  const [pagAct, setPagAct] = useState(1);
  const perPage = 15;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: pagAct });
    if (tipo) params.set('tipo', tipo);
    apiFetch(`/dashboard/movimientos?${params}`)
      .then(r => r?.json())
      .then(d => {
        if (d && !d.error) {
          setMovimientos(d.movimientos || []);
          setTotal(d.total || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [pagAct, tipo]);

  const handleTipo = (t) => {
    setTipo(t);
    setPagAct(1);
  };

  return (
    <DasboardLayout>
      <div className="p-5">
        <div className="flex items-center mb-6 gap-3">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-400" /> Movimientos
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">Historial completo de compras y ventas</p>
          </div>
          <ExportMenu
            onExcel={() => exportToExcel(movimientos, 'movimientos', COLS_EXPORT)}
            onPDF={() => exportToPDF(movimientos, 'movimientos', COLS_EXPORT, 'Historial de Movimientos')}
          />
        </div>

        <div className="flex gap-2 mb-4">
          {[["", "Todos"], ["venta", "Ventas"], ["compra", "Compras"]].map(([val, label]) => (
            <button key={val} onClick={() => handleTipo(val)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tipo === val
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4 text-left">Tipo</th>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-left">Contraparte</th>
                <th className="p-4 text-left">Recibo</th>
                <th className="p-4 text-left">Detalle</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 text-sm">Cargando...</td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FileX className="w-8 h-8 text-slate-300" />
                      <span className="text-sm">Sin movimientos registrados</span>
                    </div>
                  </td>
                </tr>
              ) : movimientos.map((m, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors text-sm">
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      m.tipo === 'venta'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      {m.tipo === 'venta'
                        ? <ArrowUpRight className="w-3 h-3" />
                        : <ArrowDownLeft className="w-3 h-3" />}
                      {m.tipo}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{new Date(m.fecha).toLocaleDateString('es-PE')}</td>
                  <td className="p-4 font-medium text-slate-700">{m.contraparte || '—'}</td>
                  <td className="p-4 font-mono text-xs text-slate-400">{m.recibo || '—'}</td>
                  <td className="p-4 text-xs text-slate-400 max-w-32 truncate" title={m.extra}>{m.extra || '—'}</td>
                  <td className={`p-4 text-right font-semibold ${m.tipo === 'venta' ? 'text-emerald-600' : 'text-blue-700'}`}>
                    {fmt(m.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan="6">
                  <Pagination total={total} page={pagAct} perPage={perPage} onChange={setPagAct} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </DasboardLayout>
  );
}
