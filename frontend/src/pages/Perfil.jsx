import { useState, useEffect } from "react";
import DasboardLayout from "../layouts/DashboardLayout";
import {
  User, Lock, Shield, Calendar, CheckCircle,
  AlertCircle, Pencil, Eye, EyeOff, KeyRound, X
} from "lucide-react";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Toast } from "../components/Toast";

const ROL_INFO = {
  admin: {
    label: "Administrador",
    color: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    permisos: [
      "Gestión completa de usuarios",
      "Configurar tipos de recibo",
      "Acceso a todos los módulos",
      "Ver y modificar todos los registros",
    ],
  },
  empleado: {
    label: "Empleado",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    permisos: [
      "Registrar y ver productos, unidades",
      "Gestionar compras y ventas",
      "Administrar clientes y proveedores",
      "Sin acceso a gestión de usuarios",
    ],
  },
};

const getStrength = (p) => {
  if (!p || p.length < 6) return 0;
  if (p.length < 8) return 1;
  if (/[0-9]/.test(p) && /[a-zA-Z]/.test(p) && /[^a-zA-Z0-9]/.test(p)) return 3;
  if (/[0-9]/.test(p) && /[a-zA-Z]/.test(p)) return 2;
  return 1;
};
const STRENGTH = [
  { label: "",         bar: "w-0",    color: "bg-transparent" },
  { label: "Débil",   bar: "w-1/3",  color: "bg-red-400"      },
  { label: "Regular", bar: "w-2/3",  color: "bg-amber-400"    },
  { label: "Fuerte",  bar: "w-full", color: "bg-emerald-500"  },
];

function PasswordInput({ value, onChange, placeholder, id }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        required
        autoComplete="new-password"
        className="w-full p-2 pr-9 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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

export default function Perfil() {
  const { user: authUser, login } = useAuth();
  const [perfil, setPerfil]     = useState(null);
  const [editNombre, setEditNombre] = useState(false);
  const [nombre, setNombre]     = useState("");
  const [showPassForm, setShowPassForm] = useState(false);
  const [passForm, setPassForm] = useState({ current: "", nueva: "", confirmar: "" });
  const [toast, setToast]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [passErrors, setPassErrors] = useState({});

  useEffect(() => {
    apiFetch("/auth/me").then(r => r?.json()).then(d => {
      if (d) { setPerfil(d); setNombre(d.nombre); }
    });
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Guardar nombre ───────────────────────────────────────────
  const saveName = async (e) => {
    e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed) { showToast("El nombre no puede estar vacío", "error"); return; }
    if (trimmed.length > 128) { showToast("El nombre es demasiado largo", "error"); return; }

    setLoading(true);
    const res = await apiFetch("/auth/me", { method: "PUT", body: JSON.stringify({ nombre: trimmed }) });
    setLoading(false);
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { showToast(data.error, "error"); return; }

    setPerfil({ ...perfil, nombre: data.nombre });
    const token = localStorage.getItem("token");
    const updatedUser = { ...authUser, nombre: data.nombre };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    login(token, updatedUser);
    setEditNombre(false);
    showToast("Nombre actualizado correctamente");
  };

  // ── Cambiar contraseña ───────────────────────────────────────
  const validatePass = () => {
    const errs = {};
    if (!passForm.current)              errs.current    = "Requerida";
    if (!passForm.nueva)                errs.nueva      = "Requerida";
    else if (passForm.nueva.length < 6) errs.nueva      = "Mínimo 6 caracteres";
    else if (passForm.nueva.length > 128) errs.nueva    = "Demasiado larga";
    if (passForm.nueva && passForm.nueva === passForm.current)
                                        errs.nueva      = "Debe ser diferente a la actual";
    if (!passForm.confirmar)            errs.confirmar  = "Requerida";
    else if (passForm.confirmar !== passForm.nueva)
                                        errs.confirmar  = "No coincide con la nueva";
    setPassErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!validatePass()) return;

    setLoading(true);
    const res = await apiFetch("/auth/me", {
      method: "PUT",
      body: JSON.stringify({
        nombre: perfil.nombre,
        currentPassword: passForm.current,
        newPassword: passForm.nueva,
      }),
    });
    setLoading(false);
    if (!res) return;
    const data = await res.json();
    if (!res.ok) {
      if (data.error?.toLowerCase().includes("actual")) {
        setPassErrors({ current: "Contraseña incorrecta" });
      } else {
        showToast(data.error, "error");
      }
      return;
    }
    setPassForm({ current: "", nueva: "", confirmar: "" });
    setPassErrors({});
    setShowPassForm(false);
    showToast("Contraseña actualizada. Vuelve a iniciar sesión si es necesario.");
  };

  const cancelPass = () => {
    setShowPassForm(false);
    setPassForm({ current: "", nueva: "", confirmar: "" });
    setPassErrors({});
  };

  const strength = getStrength(passForm.nueva);
  const getInitials = (n) => n?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "US";
  const rolData = ROL_INFO[perfil?.rol] || ROL_INFO.empleado;

  if (!perfil) return (
    <DasboardLayout>
      <div className="p-8 text-center text-slate-400 text-sm">Cargando perfil...</div>
    </DasboardLayout>
  );

  return (
    <DasboardLayout>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="p-4 max-w-3xl mx-auto">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-700">Mi Perfil</h3>
          <p className="text-xs text-slate-400 mt-0.5">Configura tu cuenta y cambia tu contraseña</p>
        </div>

        {/* Card de identidad */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div className="bg-slate-700 w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {getInitials(perfil.nombre)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-800 truncate">{perfil.nombre}</h2>
              <span className={`border text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${rolData.color}`}>
                {rolData.label}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-mono mt-0.5">@{perfil.username}</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              Miembro desde {new Date(perfil.creado_en).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Información personal */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-400" /> Información personal
              </h4>
              {!editNombre && (
                <button onClick={() => setEditNombre(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
              )}
            </div>

            {editNombre ? (
              <form onSubmit={saveName} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nombre completo</label>
                  <input
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    maxLength={128}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Usuario (no editable)</label>
                  <input
                    className="w-full p-2 border border-slate-100 rounded-md text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                    value={perfil.username}
                    disabled
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => { setEditNombre(false); setNombre(perfil.nombre); }}
                    className="flex-1 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50">
                    {loading ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Nombre completo</p>
                  <p className="text-sm font-medium text-slate-700">{perfil.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Usuario de acceso</p>
                  <p className="text-sm font-mono text-slate-500">@{perfil.username}</p>
                </div>
              </div>
            )}
          </div>

          {/* Rol y permisos */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h4 className="font-semibold text-slate-700 flex items-center gap-2 text-sm mb-4">
              <Shield className="w-4 h-4 text-slate-400" /> Rol y permisos
            </h4>
            <div className={`border rounded-lg px-3 py-1.5 mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${rolData.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${rolData.dot}`}></span>
              {rolData.label}
            </div>
            <ul className="space-y-1.5">
              {rolData.permisos.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Seguridad — Cambiar contraseña */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-slate-400" /> Seguridad
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Actualiza tu contraseña periódicamente para mantener tu cuenta segura.
              </p>
            </div>
            {!showPassForm && (
              <button
                onClick={() => setShowPassForm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all shrink-0"
              >
                <KeyRound className="w-4 h-4" />
                Cambiar contraseña
              </button>
            )}
          </div>

          {showPassForm && (
            <form onSubmit={savePassword} className="mt-5 space-y-4 border-t border-slate-100 pt-5">
              {/* Contraseña actual */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Contraseña actual <span className="text-red-400">*</span>
                </label>
                <PasswordInput
                  id="current"
                  value={passForm.current}
                  onChange={e => { setPassForm({ ...passForm, current: e.target.value }); setPassErrors({ ...passErrors, current: "" }); }}
                  placeholder="Tu contraseña actual"
                />
                {passErrors.current && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {passErrors.current}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nueva contraseña */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Nueva contraseña <span className="text-red-400">*</span>
                  </label>
                  <PasswordInput
                    id="nueva"
                    value={passForm.nueva}
                    onChange={e => { setPassForm({ ...passForm, nueva: e.target.value }); setPassErrors({ ...passErrors, nueva: "" }); }}
                    placeholder="Mín. 6 caracteres"
                  />
                  {/* Indicador de seguridad */}
                  {passForm.nueva && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${STRENGTH[strength].bar} ${STRENGTH[strength].color}`} />
                      </div>
                      <p className={`text-[11px] mt-1 font-medium ${
                        strength === 3 ? "text-emerald-600" : strength === 2 ? "text-amber-600" : "text-red-500"
                      }`}>
                        {STRENGTH[strength].label}
                        {strength < 3 && <span className="text-slate-400 font-normal"> — usa números y símbolos para hacerla más segura</span>}
                      </p>
                    </div>
                  )}
                  {passErrors.nueva && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {passErrors.nueva}
                    </p>
                  )}
                </div>

                {/* Confirmar */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Confirmar nueva contraseña <span className="text-red-400">*</span>
                  </label>
                  <PasswordInput
                    id="confirmar"
                    value={passForm.confirmar}
                    onChange={e => { setPassForm({ ...passForm, confirmar: e.target.value }); setPassErrors({ ...passErrors, confirmar: "" }); }}
                    placeholder="Repite la nueva"
                  />
                  {passForm.confirmar && passForm.nueva && (
                    <p className={`text-[11px] mt-1 flex items-center gap-1 ${
                      passForm.confirmar === passForm.nueva ? "text-emerald-600" : "text-red-500"
                    }`}>
                      {passForm.confirmar === passForm.nueva
                        ? <><CheckCircle className="w-3 h-3" /> Las contraseñas coinciden</>
                        : <><AlertCircle className="w-3 h-3" /> No coinciden</>}
                    </p>
                  )}
                  {passErrors.confirmar && !passForm.confirmar && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {passErrors.confirmar}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={cancelPass}
                  className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="px-5 py-2 text-sm text-white bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-50 active:scale-95 transition-all flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  {loading ? "Actualizando…" : "Actualizar contraseña"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DasboardLayout>
  );
}
