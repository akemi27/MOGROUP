import { useState, useEffect } from "react";
import DasboardLayout from "../layouts/DashboardLayout";
import { Receipt, Search, Eye, Plus, X, Trash2, FileX, TrendingUp } from "lucide-react";
import { apiFetch } from "../services/api";
import Pagination from "../components/Pagination";
import { useNotifications } from "../contexts/NotificationContext";
import ExportMenu from "../components/ExportMenu";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

const COLS_EXPORT = [
  { key: 'id',             label: '#' },
  { key: 'cliente',        label: 'Cliente' },
  { key: 'fecha',          label: 'Fecha' },
  { key: 'destino',        label: 'Destino' },
  { key: 'total_unidades', label: 'Unidades' },
  { key: 'total',          label: 'Total (S/)' },
  { key: 'tipo_recibo',    label: 'Tipo Recibo' },
  { key: 'numero_recibo',  label: 'N° Recibo' },
];

const hoy = () => new Date().toISOString().split('T')[0];
const fmt = (v) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v || 0);

export default function Ventas() {
  const { notify } = useNotifications();
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tipRecibos, setTipRecibos] = useState([]);
  const [modal, setModal] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [search, setSearch] = useState("");
  const [pagAct, setPagAct] = useState(1);
  const pag = 8;

  // Búsqueda de unidades disponibles
  const [prodBusqueda, setProdBusqueda] = useState("");
  const [unidadesDisponibles, setUnidadesDisponibles] = useState([]);

  const [form, setForm] = useState({ cliente_id: "", fecha: hoy(), fecha_separacion: "", destino: "", tip_recibo_id: "", numero_recibo: "" });
  const [unidadesSeleccionadas, setUnidadesSeleccionadas] = useState([]);

  useEffect(() => {
    Promise.all([
      apiFetch("/ventas").then(r => r?.json()),
      apiFetch("/clientes").then(r => r?.json()),
      apiFetch("/productos").then(r => r?.json()),
      apiFetch("/tip-recibos").then(r => r?.json()),
    ]).then(([v, c, p, tr]) => {
      if (v) setVentas(v);
      if (c) setClientes(c);
      if (p) setProductos(p);
      if (tr) setTipRecibos(tr);
    });
  }, []);

  const buscarUnidades = async (producto_id) => {
    setProdBusqueda(producto_id);
    if (!producto_id) { setUnidadesDisponibles([]); return; }
    const res = await apiFetch(`/unidades?producto_id=${producto_id}&estado=disponible`);
    if (!res) return;
    const data = await res.json();
    const yaSeleccionadas = unidadesSeleccionadas.map(u => u.unidad_id);
    setUnidadesDisponibles(data.filter(u => !yaSeleccionadas.includes(u.id)));
  };

  const agregarUnidad = (u) => {
    setUnidadesSeleccionadas([...unidadesSeleccionadas, {
      unidad_id: u.id, serie: u.serie, color: u.color, producto: u.producto, precio: u.precio_venta, almacen: u.almacen
    }]);
    setUnidadesDisponibles(unidadesDisponibles.filter(x => x.id !== u.id));
  };

  const quitarUnidad = (unidad_id) => {
    setUnidadesSeleccionadas(unidadesSeleccionadas.filter(u => u.unidad_id !== unidad_id));
  };

  const updatePrecio = (unidad_id, precio) => {
    setUnidadesSeleccionadas(unidadesSeleccionadas.map(u =>
      u.unidad_id === unidad_id ? { ...u, precio } : u
    ));
  };

  const total = unidadesSeleccionadas.reduce((s, u) => s + (parseFloat(u.precio) || 0), 0);

  const createVenta = async (e) => {
    e.preventDefault();
    if (unidadesSeleccionadas.length === 0) { alert("Agrega al menos una unidad a la venta"); return; }
    const payload = {
      ...form,
      cliente_id: form.cliente_id || null,
      unidades: unidadesSeleccionadas.map(u => ({ unidad_id: u.unidad_id, precio: u.precio }))
    };
    const res = await apiFetch("/ventas", { method: "POST", body: JSON.stringify(payload) });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    setVentas([data, ...ventas]);
    notify(`Venta #${data.id} registrada — ${unidadesSeleccionadas.length} unidad${unidadesSeleccionadas.length !== 1 ? 'es' : ''} vendida${unidadesSeleccionadas.length !== 1 ? 's' : ''}`);
    setForm({ cliente_id: "", fecha: hoy(), fecha_separacion: "", destino: "", tip_recibo_id: "", numero_recibo: "" });
    setUnidadesSeleccionadas([]);
    setProdBusqueda("");
    setUnidadesDisponibles([]);
    setModal(false);
  };

  const verDetalle = async (id) => {
    const res = await apiFetch(`/ventas/${id}`);
    if (!res) return;
    setDetalle(await res.json());
    setModalDetalle(id);
  };

  const filtradas = ventas.filter(v =>
    (v.cliente || "Anónimo").toLowerCase().includes(search.toLowerCase()) ||
    (v.numero_recibo || "").includes(search)
  );

  const indUlt = pagAct * pag;
  const indPri = indUlt - pag;
  const pagina = filtradas.slice(indPri, indUlt);

  const totalVentas = ventas.reduce((s, v) => s + parseFloat(v.total || 0), 0);

  return (
    <DasboardLayout>
      <div className="p-4">
        <div className="flex items-center mb-6 gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Ventas
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{ventas.length} ventas registradas</p>
          </div>
          <ExportMenu
            onExcel={() => exportToExcel(filtradas, 'ventas', COLS_EXPORT)}
            onPDF={() => exportToPDF(filtradas, 'ventas', COLS_EXPORT, 'Registro de Ventas')}
          />
          <button onClick={() => setModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Nueva Venta
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <p className="text-[12px] font-medium text-gray-500">Total Ventas</p>
            <p className="text-2xl font-bold text-gray-700">{ventas.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <p className="text-[12px] font-medium text-gray-500">Ingresos</p>
            <p className="text-lg font-bold text-emerald-600">{fmt(totalVentas)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <p className="text-[12px] font-medium text-gray-500">Unidades Vendidas</p>
            <p className="text-2xl font-bold text-gray-700">{ventas.reduce((s, v) => s + parseInt(v.total_unidades || 0), 0)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <p className="text-[12px] font-medium text-gray-500">Ticket Promedio</p>
            <p className="text-lg font-bold text-blue-600">{ventas.length > 0 ? fmt(totalVentas / ventas.length) : fmt(0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-3 relative">
            <Search className="absolute mx-3 my-2.5 w-4 h-4 text-gray-400" />
            <input placeholder="Buscar por cliente o número de recibo..."
              className="w-full p-2 border bg-white border-gray-300 rounded-sm text-sm pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={search} onChange={e => { setSearch(e.target.value); setPagAct(1); }} />
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-x-auto bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-300 bg-slate-100 text-left text-gray-500 uppercase text-[12px] tracking-wider">
              <tr>
                <th className="p-4 font-medium">#</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">Destino</th>
                <th className="p-4 font-medium">Unidades</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Recibo</th>
                <th className="p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagina.length > 0 ? pagina.map(v => (
                <tr key={v.id} className="border-b border-gray-100 text-gray-600 text-sm hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-400">#{v.id}</td>
                  <td className="p-4 font-medium">{v.cliente || <span className="text-slate-400">Anónimo</span>}</td>
                  <td className="p-4">{new Date(v.fecha).toLocaleDateString('es-PE')}</td>
                  <td className="p-4 text-xs text-slate-500 max-w-32 truncate">{v.destino || "—"}</td>
                  <td className="p-4 text-center">{v.total_unidades}</td>
                  <td className="p-4 font-semibold text-emerald-700">{fmt(v.total)}</td>
                  <td className="p-4 text-xs">
                    <p className="text-slate-500">{v.tipo_recibo || "—"}</p>
                    <p className="font-mono">{v.numero_recibo || ""}</p>
                  </td>
                  <td className="p-4">
                    <button onClick={() => verDetalle(v.id)}
                      className="text-slate-600 bg-slate-100 p-2 rounded-md hover:bg-slate-200 cursor-pointer">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <FileX className="w-8 h-8 text-slate-300" /><span>No hay ventas registradas</span>
                  </div>
                </td></tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50"><tr><td colSpan="8">
              <Pagination total={filtradas.length} page={pagAct} perPage={pag} onChange={setPagAct} />
            </td></tr></tfoot>
          </table>
        </div>

        {/* Modal nueva venta */}
        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-60 p-4">
            <div className="bg-white w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-slate-800 p-5 flex justify-between items-center text-white shrink-0">
                <h3 className="font-semibold flex items-center gap-2"><Receipt className="w-5 h-5" /> Registrar Venta</h3>
                <button onClick={() => setModal(false)} className="hover:bg-slate-700 p-1 rounded-md"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <form onSubmit={createVenta} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                      <select className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
                        <option value="">Venta anónima</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
                      <input type="date" required className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Destino / Ciudad *</label>
                      <input type="text" required className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.destino} onChange={e => setForm({ ...form, destino: e.target.value })} placeholder="Ej: Chiclayo, Lima - San Miguel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Separación</label>
                      <input type="date" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.fecha_separacion} onChange={e => setForm({ ...form, fecha_separacion: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Recibo *</label>
                      <select required className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.tip_recibo_id} onChange={e => setForm({ ...form, tip_recibo_id: e.target.value })}>
                        <option value="" disabled>Seleccionar...</option>
                        {tipRecibos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">N° de Recibo *</label>
                      <input type="text" required className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.numero_recibo} onChange={e => setForm({ ...form, numero_recibo: e.target.value })} placeholder="B001-00001" />
                    </div>
                  </div>

                  {/* Búsqueda de unidades */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Agregar unidades</label>
                    <select className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none mb-3"
                      value={prodBusqueda} onChange={e => buscarUnidades(e.target.value)}>
                      <option value="">Seleccionar producto para ver unidades disponibles...</option>
                      {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    {unidadesDisponibles.length > 0 && (
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {unidadesDisponibles.map(u => (
                          <button key={u.id} type="button"
                            onClick={() => agregarUnidad(u)}
                            className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded-md hover:bg-blue-50 hover:border-blue-300 text-sm flex justify-between items-center transition-colors">
                            <span className="font-mono text-xs text-slate-500">{u.serie || "Sin código"}{u.color ? ` · ${u.color}` : ""}</span>
                            <span className="text-xs font-medium text-emerald-600">{fmt(u.precio_venta)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {prodBusqueda && unidadesDisponibles.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-2">No hay unidades disponibles</p>
                    )}
                  </div>

                  {/* Unidades seleccionadas */}
                  {unidadesSeleccionadas.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Unidades a vender ({unidadesSeleccionadas.length})</label>
                      <div className="space-y-2">
                        {unidadesSeleccionadas.map(u => (
                          <div key={u.unidad_id} className="grid grid-cols-12 gap-2 items-center bg-white border border-slate-200 rounded-md p-2">
                            <div className="col-span-5">
                              <p className="text-xs font-medium text-slate-700">{u.producto}</p>
                              <p className="text-[11px] font-mono text-slate-400">{u.serie || "Sin código"}{u.color ? ` · ${u.color}` : ""}</p>
                            </div>
                            <div className="col-span-3 text-xs text-slate-400">{u.almacen}</div>
                            <div className="col-span-3">
                              <input type="number" step="0.01" min="0"
                                className="w-full p-1.5 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                value={u.precio} onChange={e => updatePrecio(u.unidad_id, e.target.value)} />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <button type="button" onClick={() => quitarUnidad(u.unidad_id)} className="text-red-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div className="text-lg font-bold text-slate-700">
                      Total: <span className="text-emerald-600">{fmt(total)}</span>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setModal(false)}
                        className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">Cancelar</button>
                      <button type="submit"
                        className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-md active:scale-95">
                        Confirmar Venta
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal detalle */}
        {modalDetalle && detalle && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-60 p-4">
            <div className="bg-white w-full max-w-lg shadow-2xl rounded-xl overflow-hidden">
              <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                <h3 className="font-semibold">Venta #{detalle.id} — {detalle.cliente || "Anónimo"}</h3>
                <button onClick={() => setModalDetalle(null)} className="hover:bg-slate-700 p-1 rounded-md"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Fecha:</span> <strong>{new Date(detalle.fecha).toLocaleDateString('es-PE')}</strong></div>
                  <div><span className="text-slate-500">Recibo:</span> <strong>{detalle.tipo_recibo} {detalle.numero_recibo}</strong></div>
                  <div><span className="text-slate-500">Total:</span> <strong className="text-emerald-600">{fmt(detalle.total)}</strong></div>
                  {detalle.destino && <div className="col-span-2"><span className="text-slate-500">Destino:</span> <strong>{detalle.destino}</strong></div>}
                  {detalle.fecha_separacion && <div><span className="text-slate-500">Separación:</span> <strong>{new Date(detalle.fecha_separacion).toLocaleDateString('es-PE')}</strong></div>}
                </div>
                <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="p-3 text-left">Producto</th>
                      <th className="p-3 text-left">Serie</th>
                      <th className="p-3 text-right">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.items?.map((it, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="p-3">{it.producto}</td>
                        <td className="p-3 font-mono text-xs text-slate-400">{it.serie || "—"}</td>
                        <td className="p-3 text-right font-medium text-emerald-600">{fmt(it.precio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DasboardLayout>
  );
}
