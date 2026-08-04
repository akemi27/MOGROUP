import { useState, useEffect } from 'react';
import DasboardLayout from '../layouts/DashboardLayout';
import { Users, Search, SquarePen, Trash, X, FileX, ShieldCheck, UserRound, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../services/api';
import Pagination from '../components/Pagination';

function PasswordInput({ value, onChange, required, placeholder, minLength }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                required={required}
                minLength={minLength}
                className="w-full p-2 pr-9 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
            >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );
}

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [modal, setModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [pagAct, setPagAct] = useState(1);
    const pag = 5;

    const [form, setForm] = useState({
        nombre: '',
        username: '',
        password: '',
        rol: 'empleado'
    });

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const res = await apiFetch('/usuarios');
            if (!res) return;
            const data = await res.json();
            setUsuarios(data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    const openModal = (usuario) => {
        setForm({
            nombre: usuario.nombre || '',
            username: usuario.username || '',
            password: '',
            rol: usuario.rol || 'empleado'
        });
        setEditId(usuario.id);
        setErrorMsg('');
        setModal(true);
    };

    const openNewModal = () => {
        setForm({ nombre: '', username: '', password: '', rol: 'empleado' });
        setEditId(null);
        setErrorMsg('');
        setModal(true);
    };

    const saveUsuario = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            let res;
            if (editId) {
                res = await apiFetch(`/usuarios/${editId}`, {
                    method: 'PUT',
                    body: JSON.stringify(form)
                });
            } else {
                res = await apiFetch('/usuarios', {
                    method: 'POST',
                    body: JSON.stringify(form)
                });
            }

            if (!res) return;
            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || 'Error al guardar');
                return;
            }

            if (editId) {
                setUsuarios(usuarios.map(u => u.id === editId ? data : u));
            } else {
                setUsuarios([data, ...usuarios]);
            }

            setModal(false);
            setEditId(null);
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    };

    const deleteUsuario = async (id) => {
        if (!window.confirm('¿Seguro de eliminar este usuario?')) return;
        try {
            const res = await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
            if (!res) return;
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'No se pudo eliminar');
                return;
            }
            setUsuarios(usuarios.filter(u => u.id !== id));
        } catch (error) {
            console.error('Error al eliminar:', error);
        }
    };

    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    const indUlt = pagAct * pag;
    const indPri = indUlt - pag;
    const usuariosPag = usuariosFiltrados.slice(indPri, indUlt);

    const getInitials = (nombre) => {
        return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <DasboardLayout>
            <div className="p-4">
                <div className="flex items-center mb-6 gap-3">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-500" /> Gestión de Usuarios
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Accesos y roles del sistema</p>
                    </div>
                    <button
                        onClick={openNewModal}
                        className="bg-slate-700 hover:bg-slate-800 active:scale-95 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                        + Nuevo Usuario
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 mb-6 gap-4">
                    <div className="lg:col-span-2 relative">
                        <Search className="absolute mx-3 my-2.5 w-4 h-4 text-gray-400" />
                        <input
                            placeholder="Buscar por nombre o usuario..."
                            type="text"
                            className="w-full p-2 border bg-white border-gray-300 rounded-sm text-sm pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPagAct(1); }}
                        />
                    </div>
                    <div className="border border-gray-300 rounded-md p-2 flex gap-4 bg-white items-center px-4">
                        <div className="bg-blue-100 p-2 rounded-md flex items-center justify-center">
                            <Users className="text-blue-600 w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[12px] font-medium text-gray-500">Total Usuarios</span>
                            <span className="text-lg font-bold text-gray-700">{usuariosFiltrados.length}</span>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-300 rounded-lg overflow-x-auto bg-white">
                    <table className="w-full">
                        <thead className="border-b border-gray-300 bg-slate-100 text-left text-gray-500 uppercase text-[12px] tracking-wider">
                            <tr>
                                <th className="p-4 font-medium">Usuario</th>
                                <th className="p-4 font-medium">Username</th>
                                <th className="p-4 font-medium">Rol</th>
                                <th className="p-4 font-medium">Estado</th>
                                <th className="p-4 font-medium">Registrado</th>
                                <th className="p-4 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosPag.length > 0 ? (
                                usuariosPag.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-100 text-gray-600 text-sm hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                                                    {getInitials(u.nombre)}
                                                </div>
                                                <span className="font-medium">{u.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-500 font-mono text-xs">{u.username}</td>
                                        <td className="p-4">
                                            {u.rol === 'admin' ? (
                                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                    <ShieldCheck className="w-3 h-3" /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                    <UserRound className="w-3 h-3" /> Empleado
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {u.activo ? (
                                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-xs text-slate-400">
                                            {new Date(u.creado_en).toLocaleDateString('es-PE')}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                className="text-blue-600 bg-indigo-100 p-2 rounded-md hover:bg-indigo-200 transition-colors cursor-pointer mr-2"
                                                onClick={() => openModal(u)}
                                            >
                                                <SquarePen className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="text-red-600 bg-red-100 p-2 rounded-md hover:bg-red-200 transition-colors cursor-pointer"
                                                onClick={() => deleteUsuario(u.id)}
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-gray-400 text-center">
                                        <div className="flex flex-col justify-center items-center gap-2">
                                            <FileX className="w-8 h-8 text-slate-300" />
                                            <span>No se encontraron usuarios</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50">
                            <tr>
                                <td colSpan="6">
                                    <Pagination
                                        total={usuariosFiltrados.length}
                                        page={pagAct}
                                        perPage={pag}
                                        onChange={setPagAct}
                                    />
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {modal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-60">
                        <div className="bg-white w-full max-w-md shadow-2xl rounded-xl overflow-hidden m-4 md:m-0">
                            <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    {editId ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h3>
                                <button
                                    className="hover:bg-slate-700 p-1 rounded-md transition-colors"
                                    onClick={() => setModal(false)}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                {errorMsg && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md mb-4">
                                        {errorMsg}
                                    </div>
                                )}
                                <form onSubmit={saveUsuario} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            value={form.nombre}
                                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                            placeholder="Ej: Juan Pérez García"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Usuario *</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                value={form.username}
                                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                                placeholder="usuario123"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Rol *</label>
                                            <select
                                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={form.rol}
                                                onChange={(e) => setForm({ ...form, rol: e.target.value })}
                                            >
                                                <option value="empleado">Empleado</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Contraseña {editId && <span className="text-slate-400 font-normal">(dejar vacío para no cambiar)</span>}
                                        </label>
                                        <PasswordInput
                                            required={!editId}
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            placeholder={editId ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                                            minLength={form.password ? 6 : undefined}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                                            onClick={() => setModal(false)}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-md transition-all active:scale-95"
                                        >
                                            {editId ? 'Guardar Cambios' : 'Crear Usuario'}
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
