import { useState, useEffect } from "react";
import DasboardLayout from "../layouts/DashboardLayout";
import { Tag, SquarePen, Trash, X, FileX, Plus } from "lucide-react";
import { apiFetch } from "../services/api";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre: "" });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => { fetchCategorias(); }, []);

  const fetchCategorias = async () => {
    const res = await apiFetch("/categorias");
    if (!res) return;
    setCategorias(await res.json());
  };

  const openModal = (cat = null) => {
    setForm({ nombre: cat?.nombre || "" });
    setEditId(cat?.id || null);
    setErrorMsg("");
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const res = await apiFetch(editId ? `/categorias/${editId}` : "/categorias", {
      method: editId ? "PUT" : "POST",
      body: JSON.stringify(form)
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { setErrorMsg(data.error); return; }
    if (editId) setCategorias(categorias.map(c => c.id === editId ? data : c));
    else setCategorias([...categorias, data]);
    setModal(false);
  };

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    const res = await apiFetch(`/categorias/${id}`, { method: "DELETE" });
    if (!res) return;
    if (res.ok) setCategorias(categorias.filter(c => c.id !== id));
    else { const d = await res.json(); alert(d.error); }
  };

  return (
    <DasboardLayout>
      <div className="p-4">
        <div className="flex items-center mb-6 gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
              <Tag className="w-5 h-5 text-yellow-500" /> Categorías de Productos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{categorias.length} categorías registradas</p>
          </div>
          <button onClick={() => openModal()}
            className="bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Nueva Categoría
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categorias.map(cat => (
            <div key={cat.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-md">
                  <Tag className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="font-medium text-gray-700 text-sm">{cat.nombre}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openModal(cat)}
                  className="text-blue-600 bg-indigo-100 p-1.5 rounded-md hover:bg-indigo-200 transition-colors cursor-pointer">
                  <SquarePen className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(cat.id)}
                  className="text-red-600 bg-red-100 p-1.5 rounded-md hover:bg-red-200 transition-colors cursor-pointer">
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {categorias.length === 0 && (
            <div className="col-span-4 py-16 flex flex-col items-center gap-2 text-gray-400">
              <FileX className="w-10 h-10 text-slate-300" />
              <span>No hay categorías registradas</span>
            </div>
          )}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-60">
            <div className="bg-white w-full max-w-sm shadow-2xl rounded-xl overflow-hidden m-4">
              <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                <h3 className="font-semibold flex items-center gap-2">
                  <Tag className="w-5 h-5" /> {editId ? "Editar Categoría" : "Nueva Categoría"}
                </h3>
                <button onClick={() => setModal(false)} className="hover:bg-slate-700 p-1 rounded-md">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md mb-4">{errorMsg}</div>}
                <form onSubmit={save} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                    <input type="text" required autoFocus
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.nombre}
                      onChange={e => setForm({ nombre: e.target.value })}
                      placeholder="Ej: Electrónica, Repuestos" />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setModal(false)}
                      className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">Cancelar</button>
                    <button type="submit"
                      className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md active:scale-95">
                      {editId ? "Guardar" : "Crear"}
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
