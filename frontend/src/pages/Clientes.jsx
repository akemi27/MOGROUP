import { useState, useEffect } from "react";
import DasboardLayout from "../layouts/DashboardLayout";
import { UserRound, Search, SquarePen, Trash, X, FileX, Plus, Phone, Mail, CreditCard } from "lucide-react";
import { apiFetch } from "../services/api";
import Pagination from "../components/Pagination";
import ExportMenu from "../components/ExportMenu";
import { exportToExcel, exportToPDF, downloadExcelTemplate, parseFile } from "../utils/exportUtils";
import { useNotifications } from "../contexts/NotificationContext";

const COLS_EXPORT = [
  { key: 'nombre',  label: 'Nombre' },
  { key: 'dni',     label: 'DNI' },
  { key: 'celular', label: 'Celular' },
  { key: 'email',   label: 'Email' },
];

export default function Clientes() {
  const { notify } = useNotifications();
  const [clientes, setClientes] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [pagAct, setPagAct] = useState(1);
  const pag = 8;

  const [form, setForm] = useState({ nombre: "", dni: "", celular: "", email: "" });

  useEffect(() => { fetchClientes(); }, []);

  const fetchClientes = async () => {
    const res = await apiFetch("/clientes");
    if (!res) return;
    setClientes(await res.json());
  };

  const openModal = (c = null) => {
    setForm({ nombre: c?.nombre || "", dni: c?.dni || "", celular: c?.celular || "", email: c?.email || "" });
    setEditId(c?.id || null);
    setErrorMsg("");
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const res = await apiFetch(editId ? `/clientes/${editId}` : "/clientes", {
      method: editId ? "PUT" : "POST",
      body: JSON.stringify(form)
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { setErrorMsg(data.error); return; }
    if (editId) setClientes(clientes.map(c => c.id === editId ? data : c));
    else setClientes([data, ...clientes]);
    setModal(false);
  };

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    const res = await apiFetch(`/clientes/${id}`, { method: "DELETE" });
    if (!res) return;
    if (res.ok) setClientes(clientes.filter(c => c.id !== id));
    else { const d = await res.json(); alert(d.error); }
  };

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.dni || "").includes(search) ||
    (c.celular || "").includes(search)
  );

  const indUlt = pagAct * pag;
  const indPri = indUlt - pag;
  const pagina = filtrados.slice(indPri, indUlt);

  const handleImport = async (file) => {
    try {
      const rows = await parseFile(file);
      if (!rows.length) { notify('El CSV está vacío o tiene formato incorrecto', 'error'); return; }
      let ok = 0, errs = 0;
      for (const row of rows) {
        if (!row.nombre) { errs++; continue; }
        const res = await apiFetch('/clientes', { method: 'POST', body: JSON.stringify({ nombre: row.nombre, dni: row.dni || '', celular: row.celular || '', email: row.email || '' }) });
        res?.ok ? ok++ : errs++;
      }
      await fetchClientes();
      notify(`Importación: ${ok} cliente${ok !== 1 ? 's' : ''} registrado${ok !== 1 ? 's' : ''}${errs > 0 ? ` · ${errs} error${errs !== 1 ? 'es' : ''}` : ''}`, errs > 0 && ok === 0 ? 'error' : 'success');
    } catch { notify('Error al procesar el archivo CSV', 'error'); }
  };

  const getInitials = (nombre) => nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <DasboardLayout>
      <div className="p-4">
        <div className="flex items-center mb-6 gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
              <UserRound className="w-5 h-5 text-blue-500" /> Clientes
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{clientes.length} clientes registrados</p>
          </div>
          <ExportMenu
            onExcel={() => exportToExcel(filtrados, 'clientes', COLS_EXPORT)}
            onPDF={() => exportToPDF(filtrados, 'clientes', COLS_EXPORT, 'Directorio de Clientes')}
            onTemplate={() => downloadExcelTemplate('clientes', ['nombre','dni','celular','email'], [{ nombre: 'Juan Pérez', dni: '12345678', celular: '999888777', email: 'juan@email.com' }])}
            onImport={handleImport}
          />
          <button onClick={() => openModal()}
            className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Nuevo Cliente
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 mb-6 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute mx-3 my-2.5 w-4 h-4 text-gray-400" />
            <input placeholder="Buscar por nombre, DNI o celular..."
              className="w-full p-2 border bg-white border-gray-300 rounded-sm text-sm pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={search} onChange={e => { setSearch(e.target.value); setPagAct(1); }} />
          </div>
          <div className="border border-gray-300 rounded-md p-2 flex gap-4 bg-white items-center px-4">
            <div className="bg-blue-100 p-2 rounded-md"><UserRound className="text-blue-600 w-5 h-5" /></div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-gray-500">Total Clientes</span>
              <span className="text-lg font-bold text-gray-700">{filtrados.length}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-x-auto bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-300 bg-slate-100 text-left text-gray-500 uppercase text-[12px] tracking-wider">
              <tr>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">DNI</th>
                <th className="p-4 font-medium">Contacto</th>
                <th className="p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagina.length > 0 ? pagina.map(c => (
                <tr key={c.id} className="border-b border-gray-100 text-gray-600 text-sm hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(c.nombre)}
                      </div>
                      <span className="font-medium">{c.nombre}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {c.dni
                      ? <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"><CreditCard className="w-3 h-3" />{c.dni}</span>
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5">
                      {c.celular && <span className="text-xs font-medium text-slate-600 flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{c.celular}</span>}
                      {c.email && <span className="text-xs text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                      {!c.celular && !c.email && <span className="text-slate-300 text-xs">—</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <button onClick={() => openModal(c)}
                      className="text-blue-600 bg-indigo-100 p-2 rounded-md hover:bg-indigo-200 cursor-pointer mr-2">
                      <SquarePen className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(c.id)}
                      className="text-red-600 bg-red-100 p-2 rounded-md hover:bg-red-200 cursor-pointer">
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <FileX className="w-8 h-8 text-slate-300" /><span>No se encontraron clientes</span>
                  </div>
                </td></tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50"><tr><td colSpan="4">
              <Pagination total={filtrados.length} page={pagAct} perPage={pag} onChange={setPagAct} />
            </td></tr></tfoot>
          </table>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-60">
            <div className="bg-white w-full max-w-md shadow-2xl rounded-xl overflow-hidden m-4">
              <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                <h3 className="font-semibold flex items-center gap-2"><UserRound className="w-5 h-5" />{editId ? "Editar Cliente" : "Nuevo Cliente"}</h3>
                <button onClick={() => setModal(false)} className="hover:bg-slate-700 p-1 rounded-md"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md mb-4">{errorMsg}</div>}
                <form onSubmit={save} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo *</label>
                    <input type="text" required className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Juan Pérez García" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                      <input type="text" maxLength="8" pattern="\d{8}"
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} placeholder="12345678" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Celular</label>
                      <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.celular} onChange={e => setForm({ ...form, celular: e.target.value })} placeholder="999 999 999" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
                    <input type="email" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="cliente@email.com" />
                  </div>
                  <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setModal(false)}
                      className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">Cancelar</button>
                    <button type="submit"
                      className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md active:scale-95">
                      {editId ? "Guardar Cambios" : "Registrar Cliente"}
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
