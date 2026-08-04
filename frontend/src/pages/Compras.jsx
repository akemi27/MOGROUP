import { useState, useEffect } from "react";
import DasboardLayout from "../layouts/DashboardLayout";
import { ShoppingCart, Search, Eye, Plus, X, Trash2, FileX, PackageCheck, Info, Clock3, CheckCircle2, XCircle } from "lucide-react";
import { apiFetch } from "../services/api";
import Pagination from "../components/Pagination";
import { useNotifications } from "../contexts/NotificationContext";
import ExportMenu from "../components/ExportMenu";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

const COLS_EXPORT = [
  { key: 'id',           label: '#' },
  { key: 'proveedor',    label: 'Proveedor' },
  { key: 'fecha',        label: 'Fecha' },
  { key: 'total_items',  label: 'Ítems' },
  { key: 'total',        label: 'Total (S/)' },
  { key: 'tipo_recibo',  label: 'Tipo Recibo' },
  { key: 'numero_recibo',label: 'N° Recibo' },
  { key: 'estado',       label: 'Estado' },
];

const hoy = () => new Date().toISOString().split('T')[0];
const COLORES = ["Rojo", "Azul", "Blanco", "Negro", "Amarillo", "Verde", "Naranja", "Gris", "Morado"];

const ESTADO_STYLE = {
  pendiente: "bg-amber-100 text-amber-700 border-amber-200",
  recibido:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelado: "bg-red-100 text-red-700 border-red-200",
};
const ESTADO_ICON = { pendiente: Clock3, recibido: CheckCircle2, cancelado: XCircle };

export default function Compras() {
  const { notify } = useNotifications();
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [tipRecibos, setTipRecibos] = useState([]);
  const [modal, setModal] = useState(false);
  const [modalRecibir, setModalRecibir] = useState(null); // {id, detalle}
  const [modalDetalle, setModalDetalle] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [search, setSearch] = useState("");
  const [pagAct, setPagAct] = useState(1);
  const pag = 8;

  const [form, setForm] = useState({
    proveedor_id: "", fecha: hoy(), tip_recibo_id: "", numero_recibo: "",
    items: [{ producto_id: "", cantidad: 1, costo_unit: "" }]
  });
  const [almacenRecibir, setAlmacenRecibir] = useState("");
  // [{det_compra_id, idx, serie, color, precio_venta}]
  const [unidadesRecibir, setUnidadesRecibir] = useState([]);
  // {det_compra_id: garantia_meses}
  const [garantiasPorDet, setGarantiasPorDet] = useState({});

  useEffect(() => {
    Promise.all([
      apiFetch("/compras").then(r => r?.json()),
      apiFetch("/proveedores").then(r => r?.json()),
      apiFetch("/productos").then(r => r?.json()),
      apiFetch("/almacenes").then(r => r?.json()),
      apiFetch("/tip-recibos").then(r => r?.json()),
    ]).then(([c, pr, p, a, tr]) => {
      if (c) setCompras(c);
      if (pr) setProveedores(pr);
      if (p) setProductos(p);
      if (a) setAlmacenes(a.filter(x => x.activo));
      if (tr) setTipRecibos(tr);
    });
  }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { producto_id: "", cantidad: 1, costo_unit: "" }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, k, v) => {
    const items = [...form.items];
    items[i] = { ...items[i], [k]: v };
    setForm({ ...form, items });
  };

  const total = form.items.reduce((s, it) => s + (parseFloat(it.cantidad) || 0) * (parseFloat(it.costo_unit) || 0), 0);

  const createCompra = async (e) => {
    e.preventDefault();
    if (form.items.some(it => !it.producto_id)) { alert("Selecciona producto en todos los ítems"); return; }
    const res = await apiFetch("/compras", { method: "POST", body: JSON.stringify({ ...form, total }) });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    setCompras([data, ...compras]);
    notify(`Orden de compra #${data.id} registrada exitosamente`);
    setForm({ proveedor_id: "", fecha: hoy(), tip_recibo_id: "", numero_recibo: "", items: [{ producto_id: "", cantidad: 1, costo_unit: "" }] });
    setModal(false);
  };

  const abrirRecibir = async (compra) => {
    const res = await apiFetch(`/compras/${compra.id}`);
    if (!res) return;
    const d = await res.json();
    // Generar una fila por cada unidad física
    const units = [];
    const garantias = {};
    for (const item of (d.items || [])) {
      garantias[item.id] = item.garantia_std || "";
      for (let i = 0; i < item.cantidad; i++) {
        units.push({ det_compra_id: item.id, producto: item.producto, idx: i, serie: "", color: "", precio_venta: item.costo_unit || "" });
      }
    }
    setModalRecibir({ id: compra.id, detalle: d });
    setUnidadesRecibir(units);
    setGarantiasPorDet(garantias);
    setAlmacenRecibir("");
  };

  const updateUnidad = (globalIdx, field, value) => {
    setUnidadesRecibir(prev => {
      const next = [...prev];
      next[globalIdx] = { ...next[globalIdx], [field]: value };
      return next;
    });
  };

  const recibirCompra = async () => {
    if (!almacenRecibir) { alert("Selecciona un almacén"); return; }
    const payload = {
      almacen_id: almacenRecibir,
      unidades: unidadesRecibir.map(u => ({
        det_compra_id: u.det_compra_id,
        serie: u.serie.trim() || null,
        color: u.color || null,
        precio_venta: u.precio_venta ? parseFloat(u.precio_venta) : null,
        garantia_meses: garantiasPorDet[u.det_compra_id] ? parseInt(garantiasPorDet[u.det_compra_id]) : null,
      }))
    };
    const res = await apiFetch(`/compras/${modalRecibir.id}/recibir`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    setCompras(compras.map(c => c.id === modalRecibir.id ? { ...c, estado: "recibido" } : c));
    notify(`Compra #${modalRecibir.id} recibida — ${unidadesRecibir.length} unidad${unidadesRecibir.length !== 1 ? 'es' : ''} ingresada${unidadesRecibir.length !== 1 ? 's' : ''} al inventario`);
    setModalRecibir(null);
    setUnidadesRecibir([]);
    setGarantiasPorDet({});
    setAlmacenRecibir("");
  };

  const verDetalle = async (id) => {
    const res = await apiFetch(`/compras/${id}`);
    if (!res) return;
    setDetalle(await res.json());
    setModalDetalle(id);
  };

  const filtradas = compras.filter(c =>
    (c.proveedor || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.numero_recibo || "").includes(search)
  );

  const indUlt = pagAct * pag;
  const indPri = indUlt - pag;
  const pagina = filtradas.slice(indPri, indUlt);

  const fmt = (v) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v);

  // Agrupar unidadesRecibir por producto para mostrarlas en secciones
  const gruposUnidades = () => {
    const grupos = [];
    let i = 0;
    while (i < unidadesRecibir.length) {
      const det_id = unidadesRecibir[i].det_compra_id;
      const producto = unidadesRecibir[i].producto;
      const startIdx = i;
      while (i < unidadesRecibir.length && unidadesRecibir[i].det_compra_id === det_id) i++;
      grupos.push({ det_id, producto, startIdx, count: i - startIdx });
    }
    return grupos;
  };

  return (
    <DasboardLayout>
      <div className="p-4">
        <div className="flex items-center mb-6 gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" /> Órdenes de Compra
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{compras.length} órdenes registradas</p>
          </div>
          <ExportMenu
            onExcel={() => exportToExcel(filtradas, 'compras', COLS_EXPORT)}
            onPDF={() => exportToPDF(filtradas, 'compras', COLS_EXPORT, 'Órdenes de Compra')}
          />
          <button onClick={() => setModal(true)}
            className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Nueva Compra
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 relative">
            <Search className="absolute mx-3 my-2.5 w-4 h-4 text-gray-400" />
            <input placeholder="Buscar por proveedor o número de recibo..."
              className="w-full p-2 border bg-white border-gray-300 rounded-sm text-sm pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={search} onChange={e => { setSearch(e.target.value); setPagAct(1); }} />
          </div>
          <div className="border border-gray-300 rounded-md p-2 flex gap-4 bg-white items-center px-4">
            <div className="bg-blue-100 p-2 rounded-md"><ShoppingCart className="text-blue-600 w-5 h-5" /></div>
            <div>
              <p className="text-[12px] font-medium text-gray-500">Total Compras</p>
              <p className="text-lg font-bold text-gray-700">{filtradas.length}</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-x-auto bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-300 bg-slate-100 text-left text-gray-500 uppercase text-[12px] tracking-wider">
              <tr>
                <th className="p-4 font-medium">#</th>
                <th className="p-4 font-medium">Proveedor</th>
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">Ítems</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Recibo</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagina.length > 0 ? pagina.map(c => (
                <tr key={c.id} className="border-b border-gray-100 text-gray-600 text-sm hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-400">#{c.id}</td>
                  <td className="p-4 font-medium">{c.proveedor || "—"}</td>
                  <td className="p-4">{new Date(c.fecha).toLocaleDateString('es-PE')}</td>
                  <td className="p-4 text-center">{c.total_items}</td>
                  <td className="p-4 font-semibold">{fmt(c.total)}</td>
                  <td className="p-4 text-xs">
                    <p className="text-slate-500">{c.tipo_recibo || "—"}</p>
                    <p className="font-mono">{c.numero_recibo || ""}</p>
                  </td>
                  <td className="p-4">
                    {(() => { const Icon = ESTADO_ICON[c.estado]; return (
                      <span className={`border font-semibold px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider inline-flex items-center gap-1 ${ESTADO_STYLE[c.estado]}`}>
                        {Icon && <Icon className="w-3 h-3" />}{c.estado}
                      </span>
                    ); })()}
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => verDetalle(c.id)}
                      className="text-slate-600 bg-slate-100 p-2 rounded-md hover:bg-slate-200 cursor-pointer">
                      <Eye className="w-4 h-4" />
                    </button>
                    {c.estado === "pendiente" && (
                      <button onClick={() => abrirRecibir(c)}
                        className="text-emerald-600 bg-emerald-100 p-2 rounded-md hover:bg-emerald-200 cursor-pointer" title="Recibir mercadería">
                        <PackageCheck className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <FileX className="w-8 h-8 text-slate-300" /><span>No hay órdenes de compra</span>
                  </div>
                </td></tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50"><tr><td colSpan="8">
              <Pagination total={filtradas.length} page={pagAct} perPage={pag} onChange={setPagAct} />
            </td></tr></tfoot>
          </table>
        </div>

        {/* Modal nueva compra */}
        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-60 p-4">
            <div className="bg-white w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-slate-800 p-5 flex justify-between items-center text-white shrink-0">
                <h3 className="font-semibold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Nueva Orden de Compra</h3>
                <button onClick={() => setModal(false)} className="hover:bg-slate-700 p-1 rounded-md"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <form onSubmit={createCompra} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor *</label>
                      <select required className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.proveedor_id} onChange={e => setForm({ ...form, proveedor_id: e.target.value })}>
                        <option value="" disabled>Seleccionar...</option>
                        {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
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
                        value={form.numero_recibo} onChange={e => setForm({ ...form, numero_recibo: e.target.value })} placeholder="F001-00001" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-slate-700">Productos *</label>
                      <button type="button" onClick={addItem}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
                        <Plus className="w-3.5 h-3.5" /> Agregar ítem
                      </button>
                    </div>
                    <div className="space-y-2">
                      {form.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6">
                            <select required className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                              value={item.producto_id} onChange={e => updateItem(i, "producto_id", e.target.value)}>
                              <option value="" disabled>Producto...</option>
                              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <input type="number" min="1" required placeholder="Cant."
                              className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                              value={item.cantidad} onChange={e => updateItem(i, "cantidad", e.target.value)} />
                          </div>
                          <div className="col-span-3">
                            <input type="number" step="0.01" min="0" required placeholder="Costo unit."
                              className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                              value={item.costo_unit} onChange={e => updateItem(i, "costo_unit", e.target.value)} />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            {form.items.length > 1 && (
                              <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div className="text-lg font-bold text-slate-700">
                      Total: <span className="text-blue-700">{fmt(total)}</span>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setModal(false)}
                        className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">Cancelar</button>
                      <button type="submit"
                        className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md active:scale-95">
                        Registrar Compra
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal recibir — con ingreso de SN y color por unidad */}
        {modalRecibir && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-60 p-4">
            <div className="bg-white w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-emerald-700 p-5 flex justify-between items-center text-white shrink-0">
                <h3 className="font-semibold flex items-center gap-2">
                  <PackageCheck className="w-5 h-5" />
                  Recibir Compra #{modalRecibir.id}
                  <span className="text-emerald-200 text-sm font-normal">— {modalRecibir.detalle?.proveedor}</span>
                </h3>
                <button onClick={() => setModalRecibir(null)} className="hover:bg-emerald-600 p-1 rounded-md"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
                {/* Almacén */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Almacén destino *</label>
                  <select className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    value={almacenRecibir} onChange={e => setAlmacenRecibir(e.target.value)}>
                    <option value="">Seleccionar almacén...</option>
                    {almacenes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>

                {/* Guía: confirmar almacén */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 items-start">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    <strong>Consejo:</strong> Verifica que el almacén seleccionado sea el correcto antes de confirmar.
                    Las unidades se registrarán directamente en el inventario de ese almacén.
                  </p>
                </div>

                {/* Unidades por producto */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Ingresa el código SN y color de cada unidad
                    <span className="text-slate-400 font-normal ml-1">(el código SN es opcional)</span>
                  </p>

                  <div className="space-y-4">
                    {gruposUnidades().map(grupo => (
                      <div key={grupo.det_id} className="border border-slate-200 rounded-lg overflow-hidden">
                        {/* Cabecera del grupo con garantía */}
                        <div className="bg-slate-100 px-3 py-2 flex flex-wrap items-center gap-3">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide flex-1">{grupo.producto}</span>
                          <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            {grupo.count} {grupo.count === 1 ? 'unidad' : 'unidades'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs text-slate-500 whitespace-nowrap">Garantía (meses):</label>
                            <input
                              type="number" min="0" max="120" placeholder="0"
                              className="w-16 p-1 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-emerald-500 outline-none"
                              value={garantiasPorDet[grupo.det_id] ?? ""}
                              onChange={e => setGarantiasPorDet(prev => ({ ...prev, [grupo.det_id]: e.target.value }))}
                            />
                          </div>
                        </div>
                        {/* Leyenda de columnas */}
                        <div className="grid grid-cols-12 gap-2 px-3 py-1 bg-slate-50 border-b border-slate-100">
                          <span className="col-span-1 text-[10px] text-slate-400 text-center">#</span>
                          <span className="col-span-4 text-[10px] text-slate-400">Código SN</span>
                          <span className="col-span-4 text-[10px] text-slate-400">Color</span>
                          <span className="col-span-3 text-[10px] text-slate-400">Precio venta (S/)</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {Array.from({ length: grupo.count }, (_, i) => {
                            const globalIdx = grupo.startIdx + i;
                            const u = unidadesRecibir[globalIdx];
                            return (
                              <div key={i} className="grid grid-cols-12 gap-2 items-center px-3 py-2">
                                <span className="col-span-1 text-xs text-slate-400 font-mono text-center">{i + 1}</span>
                                <input
                                  className="col-span-4 p-1.5 border border-slate-200 rounded text-sm font-mono focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-slate-300"
                                  placeholder="SN-201"
                                  value={u.serie}
                                  onChange={e => updateUnidad(globalIdx, "serie", e.target.value)}
                                />
                                <select
                                  className="col-span-4 p-1.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                  value={u.color}
                                  onChange={e => updateUnidad(globalIdx, "color", e.target.value)}
                                >
                                  <option value="">Sin color</option>
                                  {COLORES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input
                                  type="number" step="0.01" min="0"
                                  className="col-span-3 p-1.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-slate-300"
                                  placeholder="0.00"
                                  value={u.precio_venta}
                                  onChange={e => updateUnidad(globalIdx, "precio_venta", e.target.value)}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50">
                <button onClick={() => setModalRecibir(null)}
                  className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-md">
                  Cancelar
                </button>
                <button onClick={recibirCompra}
                  className="px-5 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-md active:scale-95 font-medium">
                  Confirmar Recepción ({unidadesRecibir.length} unidades)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal detalle */}
        {modalDetalle && detalle && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-60 p-4">
            <div className="bg-white w-full max-w-lg shadow-2xl rounded-xl overflow-hidden">
              <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                <h3 className="font-semibold">Compra #{detalle.id} — {detalle.proveedor}</h3>
                <button onClick={() => setModalDetalle(null)} className="hover:bg-slate-700 p-1 rounded-md"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Fecha:</span> <strong>{new Date(detalle.fecha).toLocaleDateString('es-PE')}</strong></div>
                  <div><span className="text-slate-500">Estado:</span> <span className={`border px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ml-1 ${ESTADO_STYLE[detalle.estado]}`}>{detalle.estado}</span></div>
                  <div><span className="text-slate-500">Recibo:</span> <strong>{detalle.tipo_recibo} {detalle.numero_recibo}</strong></div>
                  <div><span className="text-slate-500">Total:</span> <strong className="text-blue-700">{fmt(detalle.total)}</strong></div>
                </div>
                <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="p-3 text-left">Producto</th>
                      <th className="p-3 text-center">Cant.</th>
                      <th className="p-3 text-right">Costo unit.</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.items?.map((it, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="p-3">{it.producto}</td>
                        <td className="p-3 text-center">{it.cantidad}</td>
                        <td className="p-3 text-right">{fmt(it.costo_unit)}</td>
                        <td className="p-3 text-right font-medium">{fmt(it.cantidad * it.costo_unit)}</td>
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
