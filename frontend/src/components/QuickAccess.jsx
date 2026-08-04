import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box, Smartphone, Tag, Warehouse,
  ShoppingCart, Receipt, Handshake, UserRound,
  Users, User, Settings, X
} from "lucide-react";

const APPS = [
  { label: "Productos",   icon: Box,          to: "/",            color: "bg-blue-100 text-blue-700" },
  { label: "Unidades",    icon: Smartphone,   to: "/unidades",    color: "bg-indigo-100 text-indigo-700" },
  { label: "Categorías",  icon: Tag,          to: "/categorias",  color: "bg-violet-100 text-violet-700" },
  { label: "Almacenes",   icon: Warehouse,    to: "/almacenes",   color: "bg-cyan-100 text-cyan-700" },
  { label: "Compras",     icon: ShoppingCart, to: "/compras",     color: "bg-amber-100 text-amber-700" },
  { label: "Ventas",      icon: Receipt,      to: "/ventas",      color: "bg-emerald-100 text-emerald-700" },
  { label: "Proveedores", icon: Handshake,    to: "/proveedores", color: "bg-orange-100 text-orange-700" },
  { label: "Clientes",    icon: UserRound,    to: "/clientes",    color: "bg-pink-100 text-pink-700" },
  { label: "Mi Perfil",   icon: User,         to: "/perfil",      color: "bg-slate-100 text-slate-700" },
];

const ADMIN_APPS = [
  { label: "Usuarios",    icon: Users,        to: "/usuarios",    color: "bg-red-100 text-red-700" },
];

export default function QuickAccess({ onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const ref = useRef();

  const apps = user?.rol === "admin" ? [...APPS, ...ADMIN_APPS] : APPS;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const go = (to) => { navigate(to); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4 pointer-events-none">
      <div ref={ref} className="pointer-events-auto w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-700">Acceso rápido</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 grid grid-cols-3 gap-1">
          {apps.map(({ label, icon: Icon, to, color }) => (
            <button key={to} onClick={() => go(to)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-slate-600 font-medium leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
        <div className="border-t border-slate-100 px-4 py-2.5">
          <p className="text-[11px] text-slate-400 text-center">Mo Group — Portal Administrativo</p>
        </div>
      </div>
    </div>
  );
}
