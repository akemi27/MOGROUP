import { Box, Handshake, Cog, SquareArrowRightExit, Bell, Grip, Menu, X,
         Users, Tag, Warehouse, ShoppingCart, Receipt, UserRound,
         Package, LayoutDashboard, Activity } from "lucide-react"
import { useState, useCallback } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import QuickAccess from "../components/QuickAccess"
import { useNotifications } from "../contexts/NotificationContext"
import { useInactivityLogout } from "../hooks/useInactivityLogout"

const NAV = [
    {
        section: "General",
        items: [
            { to: "/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
            { to: "/movimientos", icon: Activity,         label: "Movimientos" },
        ]
    },
    {
        section: "Inventario",
        items: [
            { to: "/productos",  icon: Box,       label: "Productos" },
            { to: "/unidades",   icon: Package,   label: "Unidades" },
            { to: "/categorias", icon: Tag,       label: "Categorías" },
            { to: "/almacenes",  icon: Warehouse, label: "Almacenes" },
        ]
    },
    {
        section: "Comercial",
        items: [
            { to: "/compras", icon: ShoppingCart, label: "Compras" },
            { to: "/ventas",  icon: Receipt,      label: "Ventas" },
        ]
    },
    {
        section: "Directorio",
        items: [
            { to: "/proveedores", icon: Handshake, label: "Proveedores" },
            { to: "/clientes",    icon: UserRound, label: "Clientes" },
        ]
    },
]

const ADMIN_NAV = {
    section: "Administración",
    items: [
        { to: "/usuarios", icon: Users, label: "Usuarios" },
    ]
}

export default function DasboardLayout({ children }) {
    const [sidebar, setSidebar]   = useState(false)
    const [showQA, setShowQA]     = useState(false)
    const [showBell, setShowBell] = useState(false)
    const { user, logout }        = useAuth()
    const { unread, notifications, markAllRead } = useNotifications()
    const location                = useLocation()
    const navigate                = useNavigate()

    const handleLogout = useCallback(() => { logout(); navigate("/login") }, [logout, navigate])
    useInactivityLogout(handleLogout)

    const getInitials = (nombre) => {
        if (!nombre) return "US"
        return nombre.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    const linkClass = (to) => {
        const active = location.pathname === to ||
            (to === "/dashboard" && location.pathname === "/")
        return `flex gap-2 items-center px-3 py-2 rounded-md transition-colors text-sm ${
            active
                ? "bg-white/15 text-white font-medium"
                : "text-slate-300 hover:bg-white/8 hover:text-white"
        }`
    }

    const sections = user?.rol === "admin" ? [...NAV, ADMIN_NAV] : NAV

    const handleBell = () => {
        setShowBell(v => !v)
        if (unread > 0) markAllRead()
    }

    return (
        <div className="h-screen w-full overflow-hidden flex bg-slate-50">
            {showQA && <QuickAccess onClose={() => setShowQA(false)} />}

            {sidebar && (
                <div className="fixed inset-0 h-screen z-40 w-full bg-black/70 md:hidden"
                    onClick={() => setSidebar(false)}></div>
            )}

            <aside className={`fixed inset-y-0 left-0 w-64 md:relative h-full z-50 bg-linear-to-t from-slate-900 to-slate-800 flex flex-col shadow-[2px_0_5px_rgba(0,0,0,0.25)] transition-all ease-in-out md:translate-x-0 duration-300 ${sidebar ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex justify-between items-center py-5 px-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                            <img src="/chine.png" alt="Mo Group" className="w-8 h-8 object-contain" onError={e => { e.currentTarget.style.display='none'; }} />
                            <Package className="w-5 h-5 text-white hidden" />
                        </div>
                        <div>
                            <h3 className="text-white font-extrabold text-xl tracking-tight">MO GROUP</h3>
                            <span className="text-slate-500 text-[11px] font-medium">Sistema de Gestión Comercial</span>
                        </div>
                    </div>
                    <button className="md:hidden text-slate-300 hover:text-white" onClick={() => setSidebar(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                    {sections.map(({ section, items }) => (
                        <div key={section}>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-1">{section}</p>
                            {items.map(({ to, icon: Icon, label }) => (
                                <Link key={to} to={to} className={linkClass(to)} onClick={() => setSidebar(false)}>
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="border-t border-white/10 py-4 px-3 space-y-1">
                    <Link to="/perfil" onClick={() => setSidebar(false)}
                        className="flex gap-2 items-center px-3 py-2 rounded-md text-slate-300 hover:bg-white/8 hover:text-white transition-colors text-sm">
                        <Cog className="w-4 h-4 shrink-0" /><span>Mi Perfil</span>
                    </Link>
                    <button onClick={handleLogout}
                        className="flex gap-2 items-center px-3 py-2 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm w-full">
                        <SquareArrowRightExit className="w-4 h-4 shrink-0" /><span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 flex items-center bg-white px-4 shadow-sm w-full">
                    <div className="flex flex-1 justify-between items-center">
                        <button className="cursor-pointer md:hidden" onClick={() => setSidebar(true)}>
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="md:block hidden">
                            <input type="text" placeholder="Buscar..."
                                className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-md text-sm xl:w-72 w-48 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="flex items-center gap-1 border-r border-gray-200 pr-4 mr-2">
                            {/* Bell con dropdown de notificaciones */}
                            <div className="relative">
                                <button onClick={handleBell}
                                    className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                                    <Bell className="w-5 h-5" />
                                    {unread > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                                            {unread > 9 ? "9+" : unread}
                                        </span>
                                    )}
                                </button>
                                {showBell && (
                                    <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                                        <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                                            <span className="text-sm font-semibold text-slate-700">Notificaciones</span>
                                            <button onClick={() => setShowBell(false)}
                                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-sm text-slate-400">Sin notificaciones</div>
                                        ) : (
                                            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                                                {notifications.slice(0, 10).map(n => (
                                                    <div key={n.id} className="px-4 py-3 hover:bg-slate-50">
                                                        <div className="flex items-start gap-2">
                                                            <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${n.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                            <div>
                                                                <p className="text-sm text-slate-700">{n.msg}</p>
                                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                                    {n.ts.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Grip — Quick Access */}
                            <button onClick={() => setShowQA(v => !v)}
                                className={`p-2 rounded-md transition-colors ${showQA ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}>
                                <Grip className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <Link to="/perfil" className="pl-2 flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-sm leading-tight font-semibold">{user?.nombre || "Usuario"}</span>
                            <span className="text-[11px] text-slate-400 capitalize">{user?.rol || ""}</span>
                        </div>
                        <div className="bg-slate-700 w-9 h-9 flex items-center justify-center rounded-full text-white text-xs font-bold">
                            {getInitials(user?.nombre)}
                        </div>
                    </Link>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
