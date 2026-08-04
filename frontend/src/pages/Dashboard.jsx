import { useState, useEffect } from "react";
import DasboardLayout from "../layouts/DashboardLayout";
import { apiFetch } from "../services/api";
import { Link } from "react-router-dom";
import {
  ShoppingCart, Users, AlertTriangle, ArrowRight, Clock,
  TrendingUp, Package, ArrowUpRight, ArrowDownLeft, BarChart3,
  Activity
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const fmt = (v) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 0 }).format(v || 0);

const ESTADO_COLORS = {
  disponible:  "#10b981",
  vendido:     "#6366f1",
  defectuoso:  "#ef4444",
  en_transito: "#3b82f6",
  exhibicion:  "#f59e0b",
  garantia:    "#8b5cf6",
};

const ESTADO_LABEL = {
  disponible:  "Disponible",
  vendido:     "Vendido",
  defectuoso:  "Defectuoso",
  en_transito: "En tránsito",
  exhibicion:  "Exhibición",
  garantia:    "En garantía",
};

function MetricCard({ icon: Icon, color, label, value, sub, subAlert, href }) {
  const colors = {
    emerald: "from-emerald-500 to-emerald-600",
    blue:    "from-blue-500 to-blue-600",
    violet:  "from-violet-500 to-violet-600",
    slate:   "from-slate-600 to-slate-700",
  };
  const content = (
    <div className={`bg-linear-to-br ${colors[color]} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}>
      <div className="flex justify-between items-start mb-4">
        <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {href && <ArrowRight className="w-4 h-4 text-white/50" />}
      </div>
      <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
      <p className={`text-xs ${subAlert ? "text-amber-200 font-semibold" : "text-white/60"}`}>{sub}</p>
    </div>
  );
  return href ? <Link to={href}>{content}</Link> : content;
}

// Tooltip personalizado para el bar chart
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-slate-600 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// Tooltip para el pie chart
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.payload.fill }} />
        <span className="font-semibold text-slate-700">{ESTADO_LABEL[d.name] || d.name}</span>
      </div>
      <p className="text-slate-500 mt-1">{d.value} unidad{d.value !== 1 ? "es" : ""}</p>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [graficos, setGraficos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/dashboard").then(r => r?.json()),
      apiFetch("/dashboard/graficos").then(r => r?.json()),
    ]).then(([d, g]) => {
      if (d && !d.error) setData(d);
      if (g && !g.error) setGraficos(g);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DasboardLayout>
        <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>
      </DasboardLayout>
    );
  }

  const pieData = (graficos?.estados_unidades || []).map(e => ({
    name: e.estado,
    value: e.count,
    fill: ESTADO_COLORS[e.estado] || "#94a3b8",
  }));

  const totalUnidades = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <DasboardLayout>
      {/* Banner superior */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-7 relative overflow-hidden">
        <div className="absolute right-6 top-0 opacity-5">
          <Package className="w-40 h-40 text-white" />
        </div>
        <div className="relative z-10">
          <p className="text-slate-400 text-sm font-medium mb-1">Bienvenido al Panel de Control</p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Mo Group</h1>
          <p className="text-slate-500 text-sm mt-0.5">Sistema de Gestión Comercial — Portal Administrativo</p>
        </div>
      </div>

      <div className="p-5">
        {/* Alerta compras pendientes */}
        {(data?.compras_pendientes ?? 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
            <div className="bg-amber-100 p-1.5 rounded-lg shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                {data.compras_pendientes === 1
                  ? "1 orden de compra pendiente por recibir"
                  : `${data.compras_pendientes} órdenes de compra pendientes por recibir`}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Al recibir, selecciona el almacén correcto e ingresa el código SN de cada unidad.
              </p>
            </div>
            <Link to="/compras"
              className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 shrink-0 bg-amber-100 px-3 py-1.5 rounded-lg">
              Ver compras <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <MetricCard icon={TrendingUp} color="emerald"
            label="Ventas Totales" value={data?.total_ventas ?? "—"}
            sub={fmt(data?.ingresos_totales)} href="/ventas" />
          <MetricCard icon={ShoppingCart} color="blue"
            label="Órdenes de Compra" value={data?.total_compras ?? "—"}
            sub={`${data?.compras_pendientes ?? 0} pendiente${data?.compras_pendientes !== 1 ? "s" : ""}`}
            subAlert={(data?.compras_pendientes ?? 0) > 0} href="/compras" />
          <MetricCard icon={Package} color="violet"
            label="Unidades Disponibles" value={data?.unidades_disponibles ?? "—"}
            sub="En stock listas para vender" href="/unidades" />
          <MetricCard icon={Users} color="slate"
            label="Clientes" value={data?.clientes_activos ?? "—"}
            sub="Clientes registrados" href="/clientes" />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          {/* Bar chart — Ventas vs Compras por mes */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-slate-100 p-1.5 rounded-lg">
                <Activity className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 text-sm">Ventas y Compras</h3>
                <p className="text-[11px] text-slate-400">Últimos 6 meses — cantidad de operaciones</p>
              </div>
            </div>
            {graficos?.meses?.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={graficos.meses} barCategoryGap="30%" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mes_label" tick={{ fontSize: 10.5, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10.5, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="ventas_count" name="Ventas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="compras_count" name="Compras" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52.5 flex items-center justify-center">
                <p className="text-slate-300 text-sm">Sin datos de movimientos aún</p>
              </div>
            )}
            <div className="flex items-center gap-5 mt-2 justify-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Ventas
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Compras
              </div>
            </div>
          </div>

          {/* Donut — Estado de unidades */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-slate-100 p-1.5 rounded-lg">
                <Package className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 text-sm">Estado del Inventario</h3>
                <p className="text-[11px] text-slate-400">{totalUnidades} unidades registradas</p>
              </div>
            </div>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                      strokeWidth={2} stroke="#fff">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-1">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
                      <span className="truncate">{ESTADO_LABEL[d.name] || d.name}</span>
                      <span className="font-semibold text-slate-800 ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-300 text-sm">Sin unidades registradas</p>
              </div>
            )}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="bg-slate-100 p-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 text-sm">Actividad Reciente</h3>
                <p className="text-[11px] text-slate-400">Últimas compras y ventas</p>
              </div>
            </div>
            <Link to="/movimientos"
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
              <BarChart3 className="w-3.5 h-3.5" /> Ver historial
            </Link>
          </div>

          {data?.actividad_reciente?.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {data.actividad_reciente.map((a, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    a.tipo === "venta" ? "bg-emerald-100" : "bg-blue-100"
                  }`}>
                    {a.tipo === "venta"
                      ? <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                      : <ArrowDownLeft className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                        a.tipo === "venta"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                      }`}>{a.tipo}</span>
                      <p className="text-sm font-semibold text-slate-700 truncate">{a.contraparte || "—"}</p>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{a.recibo || "Sin N° recibo"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${a.tipo === "venta" ? "text-emerald-600" : "text-blue-600"}`}>
                      {fmt(a.total)}
                    </p>
                    <p className="text-[11px] text-slate-400">{new Date(a.fecha).toLocaleDateString("es-PE")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <Package className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Sin actividad registrada aún</p>
            </div>
          )}
        </div>
      </div>
    </DasboardLayout>
  );
}
