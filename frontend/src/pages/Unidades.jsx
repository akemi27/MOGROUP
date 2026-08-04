import { useState, useEffect } from "react";
import DasboardLayout from "../layouts/DashboardLayout";
import { Package, Search, SquarePen, Trash, X, FileX, Plus, CheckCircle2, XCircle, Truck, ShieldCheck, Eye, CircleDot } from "lucide-react";
import { apiFetch } from "../services/api";
import Pagination from "../components/Pagination";
import ExportMenu from "../components/ExportMenu";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

const COLS_EXPORT = [
  { key: 'serie',        label: 'Código SN' },
  { key: 'color',        label: 'Color' },
  { key: 'producto',     label: 'Producto' },
  { key: 'almacen',      label: 'Almacén' },
  { key: 'estado',       label: 'Estado' },
  { key: 'precio_venta', label: 'Precio de Venta (S/)' },
];

const ESTADOS = ["disponible", "vendido", "defectuoso", "garantia", "en_transito", "exhibicion"];
const COLORES = ["Rojo", "Azul", "Blanco", "Negro", "Sin color"];
const COLOR_STYLE = {
  "Rojo":      "bg-red-100 text-red-700",
  "Azul":      "bg-blue-100 text-blue-700",
  "Blanco":    "bg-slate-100 text-slate-700",
  "Negro":     "bg-slate-800 text-white",
  "Sin color": "bg-gray-100 text-gray-500",
};
const ESTADO_STYLE = {
  disponible:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  vendido:     "bg-blue-100 text-blue-700 border-blue-200",
  defectuoso:  "bg-red-100 text-red-700 border-red-200",
  en_transito: "bg-orange-100 text-orange-700 border-orange-200",
  exhibicion:  "bg-purple-100 text-purple-700 border-purple-200",
  garantia:    "bg-amber-100 text-amber-700 border-amber-200",
};

const ESTADO_ICON = {
  disponible:  CheckCircle2,
  vendido:     CircleDot,
  defectuoso:  XCircle,
  en_transito: Truck,
  exhibicion:  Eye,
  garantia:    ShieldCheck,
};

export default function Unidades() {
  const [unidades, setUnidades] = useState([]);
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterEst, setFilterEst] = useState("");
  const [filterProd, setFilterProd] = useState("");
  const [pagAct, setPagAct] = useState(1);
  const pag = 8;

  const [form, setForm] = useState({ producto_id: "", almacen_id: "", serie: "", color: "", precio_venta: "", garantia_meses: "" });

  useEffect(() => {
    Promise.all([
      apiFetch("/unidades").then(r => r?.json()),
      apiFetch("/productos").then(r => r?.json()),
      apiFetch("/almacenes").then(r => r?.json()),
    ]).then(([u, p, a]) => {
      if (u) setUnidades(u);
      if (p) setProductos(p);
      if (a) setAlmacenes(a.filter(x => x.activo));
    });
  }, []);

  const openModal = (u = null) => {
    setForm({
      producto_id: u?.producto_id || "",
      almacen_id: u?.almacen_id || "",
      serie: u?.serie || "",
      color: u?.color || "",
      precio_venta: u?.precio_venta || "",
      garantia_meses: u?.garantia_meses || "",
      estado: u?.estado || "disponible"
    });
    setEditId(u?.id || null);
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const res = await apiFetch(editId ? `/unidades/${editId}` : "/unidades", {
      method: editId ? "PUT" : "POST",
      body: JSON.stringify(form)
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    if (editId) setUnidades(unidades.map(u => u.id === editId ? { ...u, ...data } : u));
    else setUnidades([data, ...unidades]);
    setModal(false);
  };

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar esta unidad?")) return;
    const res = await apiFetch(`/unidades/${id}`, { method: "DELETE" });
    if (!res) return;
    if (res.ok) setUnidades(unidades.filter(u => u.id !== id));
  };

  const filtradas = unidades.filter(u => {
    const porBusqueda = (u.serie || "").toLowerCase().includes(search.toLowerCase()) ||
      u.producto.toLowerCase().includes(search.toLowerCase());
    const porEst = !filterEst || u.estado === filterEst;
    const porProd = !filterProd || u.producto_id?.toString() === filterProd;
    return porBusqueda && porEst && porProd;
  });

  const indUlt = pagAct * pag;
  const indPri = indUlt - pag;
  const pagina = filtradas.slice(indPri, indUlt);

  const countByEstado = (est) => unidades.filter(u => u.estado === est).length;

  return (
    <DasboardLayout>
      <div className="p-4">
        <div className="flex items-center mb-6 gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-500" /> Unidades en Inventario
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{unidades.length} unidades registradas</p>
          </div>
          <ExportMenu
            onExcel={() => exportToExcel(filtradas, 'unidades', COLS_EXPORT)}
            onPDF={() => exportToPDF(filtradas, 'unidades', COLS_EXPORT, 'Inventario de Unidades')}
          />
          <button onClick={() => openModal()}
            className="bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Registrar Unidad
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="border border-slate-200 bg-slate-50 rounded-md p-4">
            <p className="text-[12px] font-medium text-slate-500">Total inventariado</p>
            <p className="text-2xl font-bold text-slate-800">{unidades.length}</p>
          </div>
          <div className="border border-emerald-200 bg-emerald-50 rounded-md p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm"
            onClick={() => { setFilterEst(filterEst === "disponible" ? "" : "disponible"); setPagAct(1); }}>
            <p className="text-[12px] font-medium text-emerald-700">Stock disponible</p>
            <p className="text-2xl font-bold text-emerald-800">{countByEstado("disponible")}</p>
          </div>
          <div className="border border-blue-200 bg-blue-50 rounded-md p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm"
            onClick={() => { setFilterEst(filterEst === "vendido" ? "" : "vendido"); setPagAct(1); }}>
            <p className="text-[12px] font-medium text-blue-700">Unidades vendidas</p>
            <p className="text-2xl font-bold text-blue-800">{countByEstado("vendido")}</p>
          </div>
          <div className="border border-amber-200 bg-amber-50 rounded-md p-4">
            <p className="text-[12px] font-medium text-amber-700">Otros estados</p>
            <p className="text-2xl font-bold text-amber-800">
              {unidades.filter(u => !["disponible", "vendido"].includes(u.estado)).length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute mx-3 my-2.5 w-4 h-4 text-gray-400" />
            <input placeholder="Buscar por código de serie o producto..."
              className="w-full p-2 border bg-white border-gray-300 rounded-sm text-sm pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={search} onChange={e => { setSearch(e.target.value); setPagAct(1); }} />
          </div>
          <select className="w-full p-2 border bg-white border-gray-300 rounded-sm text-sm"
            value={filterProd} onChange={e => { setFilterProd(e.target.value); setPagAct(1); }}>
            <option value="">Todos los productos</option>
            {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <select className="w-full p-2 border bg-white border-gray-300 rounded-sm text-sm"
            value={filterEst} onChange={e => { setFilterEst(e.target.value); setPagAct(1); }}>
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-x-auto bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-300 bg-slate-100 text-left text-gray-500 uppercase text-[12px] tracking-wider">
              <tr>
                <th className="p-4 font-medium">Producto</th>
                <th className="p-4 font-medium">Código SN / Color</th>
                <th className="p-4 font-medium">Almacén</th>
                <th className="p-4 font-medium">Precio Venta</th>
                <th className="p-4 font-medium">Garantía</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagina.length > 0 ? pagina.map(u => (
                <tr key={u.id} className="border-b border-gray-100 text-gray-600 text-sm hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">{u.producto}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{u.categoria || ""}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-mono text-xs">{u.serie || <span className="text-slate-300">Sin código</span>}</p>
                    {u.color && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block ${COLOR_STYLE[u.color] || "bg-gray-100 text-gray-600"}`}>
                        {u.color}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm">{u.almacen}</td>
                  <td className="p-4 font-medium">
                    {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(u.precio_venta)}
                  </td>
                  <td className="p-4 text-sm text-slate-500">{u.garantia_meses ? `${u.garantia_meses} m.` : "—"}</td>
                  <td className="p-4">
                    {(() => { const Icon = ESTADO_ICON[u.estado]; return (
                      <span className={`border font-semibold px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider inline-flex items-center gap-1 ${ESTADO_STYLE[u.estado]}`}>
                        {Icon && <Icon className="w-3 h-3" />}
                        {u.estado.replace('_', ' ')}
                      </span>
                    ); })()}
                  </td>
                  <td className="p-4">
                    <button onClick={() => openModal(u)}
                      className="text-blue-600 bg-indigo-100 p-2 rounded-md hover:bg-indigo-200 cursor-pointer mr-2">
                      <SquarePen className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(u.id)}
                      className="text-red-600 bg-red-100 p-2 rounded-md hover:bg-red-200 cursor-pointer">
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <FileX className="w-8 h-8 text-slate-300" /><span>No se encontraron unidades</span>
                  </div>
                </td></tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50"><tr><td colSpan="7">
              <Pagination total={filtradas.length} page={pagAct} perPage={pag} onChange={setPagAct} />
            </td></tr></tfoot>
          </table>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-60">
            <div className="bg-white w-full max-w-md shadow-2xl rounded-xl overflow-hidden m-4">
              <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                <h3 className="font-semibold flex items-center gap-2"><Package className="w-5 h-5" />{editId ? "Editar Unidad" : "Registrar Unidad"}</h3>
                <button onClick={() => setModal(false)} className="hover:bg-slate-700 p-1 rounded-md"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                <form onSubmit={save} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Producto *</label>
                    <select required className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.producto_id} onChange={e => setForm({ ...form, producto_id: e.target.value })}
                      disabled={!!editId}>
                      <option value="" disabled>Seleccionar producto...</option>
                      {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Almacén *</label>
                      <select required className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.almacen_id} onChange={e => setForm({ ...form, almacen_id: e.target.value })}>
                        <option value="" disabled>Seleccionar...</option>
                        {almacenes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                      <select className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.estado || "disponible"} onChange={e => setForm({ ...form, estado: e.target.value })}>
                        {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Código SN / Serie</label>
                      <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.serie} onChange={e => setForm({ ...form, serie: e.target.value })} placeholder="Ej: SN-001" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                      <select className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}>
                        <option value="">Sin color</option>
                        {COLORES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Precio de Venta (S/) *</label>
                      <input type="number" step="0.01" required min="0"
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.precio_venta} onChange={e => setForm({ ...form, precio_venta: e.target.value })} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Garantía (meses)</label>
                      <input type="number" min="0"
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.garantia_meses} onChange={e => setForm({ ...form, garantia_meses: e.target.value })} placeholder="12" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setModal(false)}
                      className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">Cancelar</button>
                    <button type="submit"
                      className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md active:scale-95">
                      {editId ? "Guardar Cambios" : "Registrar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DasboardLayout>
  );
}
