import { useState, useEffect } from "react";
import DasboardLayout from "../layouts/DashboardLayout";
import { Building2, Search, SquarePen, Trash, X, FileX, Phone, Mail, MapPin } from "lucide-react";
import { apiFetch } from "../services/api";
import Pagination from "../components/Pagination";
import ExportMenu from "../components/ExportMenu";
import { exportToExcel, exportToPDF, downloadExcelTemplate, parseFile } from "../utils/exportUtils";
import { useNotifications } from "../contexts/NotificationContext";

const COLS_EXPORT = [
  { key: 'ruc',      label: 'RUC' },
  { key: 'nombre',   label: 'Razón Social' },
  { key: 'contacto', label: 'Contacto' },
  { key: 'email',    label: 'Email' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'direccion',label: 'Dirección' },
];

export default function Proveedores() {
  const { notify } = useNotifications();
  const [proveedores, setProveedores] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const [pagAct, setPagAct] = useState(1);
  const pag = 5;

  const [form, setForm] = useState({
    ruc: "",
    nombre: "",
    contacto: "",
    email: "",
    telefono: "",
    direccion: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch("/proveedores");
        if (!res) return;
        setProveedores(await res.json());
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      }
    };
    fetchData();
  }, []);

  const openModal = (proveedor) => {
    setForm({
      ruc: proveedor.ruc || "",
      nombre: proveedor.nombre || "",
      contacto: proveedor.contacto || "",
      email: proveedor.email || "",
      telefono: proveedor.telefono || "",
      direccion: proveedor.direccion || ""
    });
    setEditId(proveedor.id);
    setModal(true);
  };

  const saveProveedor = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await apiFetch(`/proveedores/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
        if (!res) return;
        const actualizado = await res.json();
        setProveedores(proveedores.map(p => p.id === editId ? actualizado : p));
      } else {
        const res = await apiFetch("/proveedores", {
          method: 'POST',
          body: JSON.stringify(form)
        });
        if (!res) return;
        const nuevo = await res.json();
        setProveedores([nuevo, ...proveedores]);
      }
      setForm({ ruc: "", nombre: "", contacto: "", email: "", telefono: "", direccion: "" });
      setEditId(null);
      setModal(false);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const deleteProveedor = async (id) => {
    if (!window.confirm("¿Seguro de eliminar este proveedor?")) return;
    try {
      const res = await apiFetch(`/proveedores/${id}`, { method: "DELETE" });
      if (!res) return;
      if (res.ok) {
        setProveedores(proveedores.filter(p => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "No se puede eliminar este proveedor.");
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleImport = async (file) => {
    try {
      const rows = await parseFile(file);
      if (!rows.length) { notify('El CSV está vacío o tiene formato incorrecto', 'error'); return; }
      let ok = 0, errs = 0;
      for (const row of rows) {
        if (!row.nombre) { errs++; continue; }
        const res = await apiFetch('/proveedores', { method: 'POST', body: JSON.stringify({ ruc: row.ruc || '', nombre: row.nombre, contacto: row.contacto || '', email: row.email || '', telefono: row.telefono || '', direccion: row.direccion || '' }) });
        if (res?.ok) { const d = await res.json(); setProveedores(prev => [d, ...prev]); ok++; }
        else errs++;
      }
      notify(`Importación: ${ok} proveedor${ok !== 1 ? 'es' : ''} registrado${ok !== 1 ? 's' : ''}${errs > 0 ? ` · ${errs} error${errs !== 1 ? 'es' : ''}` : ''}`, errs > 0 && ok === 0 ? 'error' : 'success');
    } catch { notify('Error al procesar el archivo CSV', 'error'); }
  };

  const proveedoresFiltrados = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.ruc || "").includes(search)
  );

  const indUlt = pagAct * pag;
  const indPri = indUlt - pag;
  const proveedoresPag = proveedoresFiltrados.slice(indPri, indUlt);

  return (
    <DasboardLayout>
      <div className="p-4">
        <div className="flex items-center mb-6 gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" /> Proveedores
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{proveedores.length} proveedores registrados</p>
          </div>
          <ExportMenu
            onExcel={() => exportToExcel(proveedoresFiltrados, 'proveedores', COLS_EXPORT)}
            onPDF={() => exportToPDF(proveedoresFiltrados, 'proveedores', COLS_EXPORT, 'Directorio de Proveedores')}
            onTemplate={() => downloadExcelTemplate('proveedores', ['ruc','nombre','contacto','email','telefono','direccion'], [{ ruc: '20123456789', nombre: 'Importaciones SAC', contacto: 'Juan López', email: 'ventas@empresa.com', telefono: '+51 999 888 777', direccion: 'Av. Principal 123' }])}
            onImport={handleImport}
          />
          <button
            onClick={() => { setForm({ ruc: "", nombre: "", contacto: "", email: "", telefono: "", direccion: "" }); setEditId(null); setModal(true); }}
            className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm">
            + Nuevo Proveedor
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 mb-6 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute mx-3 my-2.5 w-4 h-4 text-gray-400" />
            <input
              placeholder="Buscar por RUC o Razón Social..."
              type="text"
              className="w-full p-2 border bg-white border-gray-300 rounded-sm text-sm pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagAct(1); }}
            />
          </div>
          <div className="border border-gray-300 rounded-md p-2 flex gap-4 bg-white items-center px-4">
            <div className="bg-blue-100 p-2 rounded-md flex items-center justify-center">
              <Building2 className="text-blue-600 w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-gray-500">Total Registrados</span>
              <span className="text-lg font-bold text-gray-700">{proveedoresFiltrados.length}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-x-auto bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-300 bg-slate-100 text-left text-gray-500 uppercase text-[12px] tracking-wider">
              <tr>
                <th className="p-4 font-medium">RUC</th>
                <th className="p-4 font-medium">Razón Social</th>
                <th className="p-4 font-medium">Contacto</th>
                <th className="p-4 font-medium">Dirección</th>
                <th className="p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedoresPag.length > 0 ? (
                proveedoresPag.map((prov) => (
                  <tr key={prov.id} className="border-b border-gray-100 text-gray-600 text-sm hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold">{prov.ruc || '—'}</td>
                    <td className="p-4 font-medium">{prov.nombre}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        {prov.contacto && <span className="text-xs font-semibold text-slate-700">{prov.contacto}</span>}
                        {prov.email && <span className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3 shrink-0" />{prov.email}</span>}
                        {prov.telefono && <span className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{prov.telefono}</span>}
                        {!prov.contacto && !prov.email && !prov.telefono && <span className="text-slate-300">—</span>}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-500 max-w-48 truncate" title={prov.direccion}>
                      {prov.direccion
                        ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0 text-slate-400" />{prov.direccion}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="p-4">
                      <button
                        className="text-blue-600 bg-indigo-100 p-2 rounded-md hover:bg-indigo-200 transition-colors cursor-pointer mr-2"
                        onClick={() => openModal(prov)}>
                        <SquarePen className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 bg-red-100 p-2 rounded-md hover:bg-red-200 transition-colors cursor-pointer"
                        onClick={() => deleteProveedor(prov.id)}>
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-gray-400 text-center">
                    <div className="flex flex-col justify-center items-center gap-2">
                      <FileX className="w-8 h-8 text-slate-300" />
                      <span>No se encontraron proveedores</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan="5">
                  <Pagination total={proveedoresFiltrados.length} page={pagAct} perPage={pag} onChange={setPagAct} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-60">
            <div className="bg-white w-full max-w-lg shadow-2xl rounded-xl overflow-hidden m-4 md:m-0">
              <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {editId ? "Editar Proveedor" : "Registrar Proveedor"}
                </h3>
                <button className="hover:bg-slate-700 p-1 rounded-md transition-colors" onClick={() => { setModal(false); setEditId(null); }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={saveProveedor} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">RUC</label>
                      <input
                        type="text" maxLength="11" pattern="\d{11}"
                        title="El RUC debe tener 11 dígitos"
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.ruc}
                        onChange={(e) => setForm({ ...form, ruc: e.target.value })}
                        placeholder="20000000001"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Razón Social *</label>
                      <input
                        type="text" required
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Ej: Importaciones SAC"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Persona de Contacto</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.contacto}
                      onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                      placeholder="Nombre del representante"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="ventas@empresa.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        placeholder="+51 999 999 999"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dirección Fiscal</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.direccion}
                      onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                      placeholder="Av. Principal 123, Distrito"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button"
                      className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                      onClick={() => { setModal(false); setEditId(null); }}>
                      Cancelar
                    </button>
                    <button type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-md active:scale-95">
                      {editId ? "Guardar Cambios" : "Registrar Proveedor"}
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
