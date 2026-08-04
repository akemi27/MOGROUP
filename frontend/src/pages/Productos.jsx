import { useState, useEffect } from "react"
import DasboardLayout from "../layouts/DashboardLayout"
import { FileBox, Shapes, Package, Wallet, Funnel, ChevronsUpDown, SquarePen, Trash, X, FileX, Plus, Tag } from "lucide-react";
import { apiFetch } from "../services/api";
import Pagination from "../components/Pagination";
import ExportMenu from "../components/ExportMenu";
import { exportToExcel, exportToPDF, downloadExcelTemplate, parseFile } from "../utils/exportUtils";
import { useNotifications } from "../contexts/NotificationContext";

const COLS_EXPORT = [
  { key: 'nombre',           label: 'Producto' },
  { key: 'categoria',        label: 'Categoría' },
  { key: 'precio_ref',       label: 'Precio Ref. (S/)' },
  { key: 'garantia_std',     label: 'Garantía (meses)' },
  { key: 'stock_disponible', label: 'Stock Disponible' },
];

export default function Productos() {
  const { notify } = useNotifications();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterEst, setFilterEst] = useState("");

  const [pagAct, setPagAct] = useState(1);
  const pag = 5;

  const [form, setForm] = useState({
    nombre: "",
    cat_producto_id: "",
    precio_ref: "",
    garantia_std: 12,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProductos, resCategorias] = await Promise.all([
          apiFetch("/productos"),
          apiFetch("/categorias")
        ]);
        if (!resProductos || !resCategorias) return;
        setProductos(await resProductos.json());
        setCategorias(await resCategorias.json());
      } catch (error) {
        console.log('Error: ', error);
      }
    };
    fetchData();
  }, []);

  const openModal = (producto) => {
    setForm({
      nombre: producto.nombre || "",
      cat_producto_id: producto.cat_producto_id || "",
      precio_ref: producto.precio_ref || "",
      garantia_std: producto.garantia_std || 12,
    });
    setEditId(producto.id);
    setModal(true);
  };

  const saveProducto = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await apiFetch(`/productos/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
        if (!res) return;
        const actualizado = await res.json();
        setProductos(productos.map(p => p.id === editId ? actualizado : p));
      } else {
        const res = await apiFetch("/productos", {
          method: 'POST',
          body: JSON.stringify(form)
        });
        if (!res) return;
        const nuevo = await res.json();
        setProductos([nuevo, ...productos]);
      }
      setForm({ nombre: "", cat_producto_id: "", precio_ref: "", garantia_std: 12 });
      setEditId(null);
      setModal(false);
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  const deleteProducto = async (id) => {
    if (!window.confirm("¿Seguro de eliminar este producto?")) return;
    try {
      const res = await apiFetch(`/productos/${id}`, { method: "DELETE" });
      if (!res) return;
      if (res.ok) {
        setProductos(productos.filter(p => p.id !== id));
      } else {
        alert("No se pudo eliminar el producto.");
      }
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  const handleImport = async (file) => {
    try {
      const rows = await parseFile(file);
      if (!rows.length) { notify('El CSV está vacío o tiene formato incorrecto', 'error'); return; }
      let ok = 0, errs = 0;
      for (const row of rows) {
        if (!row.nombre) { errs++; continue; }
        const catMatch = categorias.find(c => c.nombre?.toLowerCase() === (row.categoria || '').toLowerCase());
        const res = await apiFetch('/productos', { method: 'POST', body: JSON.stringify({ nombre: row.nombre, precio_ref: parseFloat(row.precio_ref) || 0, garantia_std: parseInt(row.garantia_std) || 12, cat_producto_id: catMatch?.id || '' }) });
        if (res?.ok) { const d = await res.json(); setProductos(prev => [d, ...prev]); ok++; }
        else errs++;
      }
      notify(`Importación: ${ok} producto${ok !== 1 ? 's' : ''} registrado${ok !== 1 ? 's' : ''}${errs > 0 ? ` · ${errs} error${errs !== 1 ? 'es' : ''}` : ''}`, errs > 0 && ok === 0 ? 'error' : 'success');
    } catch { notify('Error al procesar el archivo CSV', 'error'); }
  };

  const productosFiltrados = productos.filter((p) => {
    const porNombre = p.nombre.toLowerCase().includes(search.toLowerCase());
    const porCat = filterCat === "" || p.cat_producto_id?.toString() === filterCat;
    let porEst = true;
    const stock = parseInt(p.stock_disponible) || 0;
    if (filterEst === "agotado") porEst = stock === 0;
    else if (filterEst === "disponible") porEst = stock > 0;
    return porNombre && porCat && porEst;
  });

  const indUlt = pagAct * pag;
  const indPri = indUlt - pag;
  const productoPag = productosFiltrados.slice(indPri, indUlt);

  const totalProductos = productosFiltrados.length;
  const totalCategorias = categorias.length;
  const sinStock = productosFiltrados.filter(p => (parseInt(p.stock_disponible) || 0) === 0).length;
  const totalValor = productosFiltrados.reduce((acc, p) => {
    return acc + (parseFloat(p.precio_ref) * (parseInt(p.stock_disponible) || 0));
  }, 0);

  return (
    <DasboardLayout>
      <div className="p-4">
        <div className="flex items-center mb-6 gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-500" /> Catálogo de Productos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{productos.length} modelos registrados</p>
          </div>
          <ExportMenu
            onExcel={() => exportToExcel(productosFiltrados, 'productos', COLS_EXPORT)}
            onPDF={() => exportToPDF(productosFiltrados, 'productos', COLS_EXPORT, 'Catálogo de Productos')}
            onTemplate={() => downloadExcelTemplate('productos', ['nombre','precio_ref','garantia_std','categoria'], [{ nombre: 'Producto Ejemplo', precio_ref: '8500', garantia_std: '12', categoria: 'General' }])}
            onImport={handleImport}
          />
          <button
            onClick={() => { setForm({ nombre: "", cat_producto_id: "", precio_ref: "", garantia_std: 12 }); setEditId(null); setModal(true); }}
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm">
            + Nuevo Producto
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6 gap-4">
          <div className="lg:col-span-2 relative">
            <Funnel className="absolute mx-2 my-2.5 w-4 h-4 text-gray-400" />
            <input
              placeholder="Buscar producto..."
              type="text"
              className="w-full p-2 border bg-white border-gray-300 rounded-sm text-sm pl-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagAct(1); }}
            />
          </div>
          <div>
            <select
              className="w-full p-2 border bg-white border-gray-300 rounded-sm text-sm"
              value={filterCat}
              onChange={(e) => { setFilterCat(e.target.value); setPagAct(1); }}>
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="w-full p-2 border bg-white border-gray-300 rounded-sm text-sm"
              value={filterEst}
              onChange={(e) => { setFilterEst(e.target.value); setPagAct(1); }}>
              <option value="">Todos los estados</option>
              <option value="disponible">Con stock</option>
              <option value="agotado">Sin stock</option>
            </select>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 mb-6 gap-4">
          <div className="border border-gray-300 rounded-md p-4 flex gap-4 hover:-translate-y-1 hover:shadow-md duration-300 transition-all bg-white">
            <div className="bg-blue-100 p-2 rounded-md flex items-center justify-center w-10 h-10">
              <FileBox color="blue" className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-between">
              <span className="text-[12px] font-medium text-gray-500">Productos</span>
              <span className="text-lg font-bold">{totalProductos}</span>
            </div>
          </div>
          <div className="border border-gray-300 rounded-md p-4 flex gap-4 hover:-translate-y-1 hover:shadow-md duration-300 transition-all bg-white">
            <div className="bg-yellow-100 p-2 rounded-md flex items-center justify-center w-10 h-10">
              <Shapes color="orange" className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-between">
              <span className="text-[12px] font-medium text-gray-500">Categorías</span>
              <span className="text-lg font-bold">{totalCategorias}</span>
            </div>
          </div>
          <div className={`border rounded-md p-4 flex gap-4 hover:-translate-y-1 hover:shadow-md duration-300 transition-all ${sinStock > 0 ? "bg-red-50 border-red-300" : "bg-white border-gray-300"}`}>
            <div className="bg-red-100 p-2 rounded-md flex items-center justify-center w-10 h-10">
              <Package color="red" className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-between">
              <span className="text-[12px] font-medium text-gray-500">Sin Stock</span>
              <span className="text-lg font-bold">{sinStock}</span>
            </div>
          </div>
          <div className="border border-gray-300 rounded-md p-4 flex gap-4 hover:-translate-y-1 hover:shadow-md duration-300 transition-all bg-white">
            <div className="bg-slate-100 p-2 rounded-md flex items-center justify-center w-10 h-10">
              <Wallet color="gray" className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-between">
              <span className="text-[12px] font-medium text-gray-500">Valor referencial</span>
              <span className="text-base font-bold">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(totalValor)}</span>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="border border-gray-300 rounded-lg overflow-x-auto bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-300 bg-slate-100 text-left text-gray-500 uppercase text-[12px] tracking-wider">
              <tr>
                <th><div className="p-4 font-medium flex items-center gap-1">Nombre <ChevronsUpDown className="w-3" /></div></th>
                <th><div className="p-4 font-medium flex items-center gap-1">Categoría <ChevronsUpDown className="w-3" /></div></th>
                <th><div className="p-4 font-medium flex items-center gap-1">Precio Ref. <ChevronsUpDown className="w-3" /></div></th>
                <th><div className="p-4 font-medium flex items-center gap-1">Garantía <ChevronsUpDown className="w-3" /></div></th>
                <th><div className="p-4 font-medium flex items-center gap-1">Unidades <ChevronsUpDown className="w-3" /></div></th>
                <th><div className="p-4 font-medium">Acciones</div></th>
              </tr>
            </thead>
            <tbody>
              {productoPag.length > 0 ? (
                productoPag.map((p) => {
                  const stock = parseInt(p.stock_disponible) || 0;
                  return (
                    <tr key={p.id} className="border-b border-gray-100 text-gray-600 text-sm hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium">{p.nombre}</td>
                      <td className="p-4">
                        <span className="bg-gray-200 text-gray-600 font-medium uppercase rounded-2xl px-2 py-0.5 text-[10px] tracking-wide">
                          {p.categoria || '—'}
                        </span>
                      </td>
                      <td className="p-4 font-medium">
                        {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(p.precio_ref)}
                      </td>
                      <td className="p-4 text-sm text-slate-500">{p.garantia_std} meses</td>
                      <td className="p-4">
                        {stock === 0 ? (
                          <span className="bg-red-100 text-red-700 border border-red-200 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider flex items-center w-max gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div> Agotado
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider flex items-center w-max gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {stock} uds.
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <button className="text-blue-600 bg-indigo-100 p-2 rounded-md hover:bg-indigo-200 transition-colors cursor-pointer mr-2"
                          onClick={() => openModal(p)}>
                          <SquarePen className="w-4 h-4" />
                        </button>
                        <button className="text-red-500 bg-red-100 p-2 rounded-md hover:bg-red-200 transition-colors cursor-pointer"
                          onClick={() => deleteProducto(p.id)}>
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-gray-400 text-center">
                    <div className="flex flex-col justify-center items-center gap-2">
                      <FileX className="w-8 h-8 text-slate-300" />
                      <span>No se encontraron productos</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan={6}>
                  <Pagination total={productosFiltrados.length} page={pagAct} perPage={pag} onChange={setPagAct} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex justify-center items-center z-60">
            <div className="bg-white w-full max-w-md shadow-xl rounded-lg overflow-hidden m-4 md:m-0">
              <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                <h3 className="text-lg font-semibold">{editId ? "Editar Producto" : "Nuevo Producto"}</h3>
                <button className="hover:bg-slate-700 p-1 rounded-md" onClick={() => { setModal(false); setEditId(null); }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={saveProducto} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del producto *</label>
                    <input
                      type="text" required
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Ej: Samsung Galaxy A55"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
                    <select
                      required
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.cat_producto_id}
                      onChange={(e) => setForm({ ...form, cat_producto_id: e.target.value })}>
                      <option value="" disabled>Seleccione una categoría...</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Precio referencial (S/) *</label>
                      <input
                        type="number" step="0.01" required min="0"
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.precio_ref}
                        onChange={(e) => setForm({ ...form, precio_ref: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Garantía estándar (meses)</label>
                      <input
                        type="number" min="0"
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.garantia_std}
                        onChange={(e) => setForm({ ...form, garantia_std: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button"
                      className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                      onClick={() => { setModal(false); setEditId(null); }}>
                      Cancelar
                    </button>
                    <button type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md active:scale-95">
                      {editId ? "Guardar Cambios" : "Crear Producto"}
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
