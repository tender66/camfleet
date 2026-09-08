import { createClient } from "@/lib/supabase/server";
import { Camera, ArrowLeftRight, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const stats = [
  {
    key: "total",
    title: "Inventaire",
    label: "équipements actifs",
    icon: Camera,
    bg: "linear-gradient(135deg, #475569 0%, #1e293b 100%)",
  },
  {
    key: "available",
    title: "Disponibles",
    label: "prêts à l'emprunt",
    icon: CheckCircle2,
    bg: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
  },
  {
    key: "loans",
    title: "Emprunts actifs",
    label: "actuellement sortis",
    icon: ArrowLeftRight,
    bg: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
  },
  {
    key: "pending",
    title: "En attente",
    label: "demandes à approuver",
    icon: Clock,
    bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
] as const;

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalEquipment },
    { count: availableEquipment },
    { count: activeLoans },
    { count: overdueLoans },
    { count: pendingLoans },
  ] = await Promise.all([
    supabase.from("equipment").select("*", { count: "exact", head: true }).neq("status", "retired"),
    supabase.from("equipment").select("*", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("loans").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("loans").select("*", { count: "exact", head: true }).eq("status", "overdue"),
    supabase.from("loans").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const values = {
    total: totalEquipment ?? 0,
    available: availableEquipment ?? 0,
    loans: activeLoans ?? 0,
    pending: pendingLoans ?? 0,
  };

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-6xl">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Vue d&apos;ensemble
          </p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Tableau de bord
          </h1>
        </div>

        {!!overdueLoans && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs font-semibold text-red-600">
              {overdueLoans} retard{overdueLoans > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Mobile overdue */}
      {!!overdueLoans && (
        <div className="md:hidden flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-600">
            {overdueLoans} emprunt{overdueLoans > 1 ? "s" : ""} en retard de retour
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const value = values[stat.key];
          return (
            <div
              key={stat.key}
              className="relative overflow-hidden rounded-2xl p-5 text-white shadow-xl"
              style={{ background: stat.bg }}
            >
              <div className="absolute -right-5 -bottom-5 w-24 h-24 rounded-full bg-white/5" />
              <div className="absolute right-4 top-4 w-12 h-12 rounded-full bg-white/5" />
              <div className="relative z-10">
                <Icon className="h-5 w-5 text-white/70 mb-3" />
                <div className="text-3xl font-bold tracking-tight mb-0.5">{value}</div>
                <div className="text-[11px] font-medium text-white/60 uppercase tracking-wider">
                  {stat.title}
                </div>
                <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress bars */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-5">
            Répartition de l&apos;inventaire
          </h2>
          <div className="space-y-4">
            {[
              { label: "Disponibles", value: availableEquipment ?? 0, color: "bg-indigo-500" },
              { label: "En emprunt", value: activeLoans ?? 0, color: "bg-teal-500" },
              { label: "En retard", value: overdueLoans ?? 0, color: "bg-red-400" },
            ].map((row) => {
              const pct = totalEquipment ? Math.min(100, Math.round((row.value / totalEquipment) * 100)) : 0;
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-600">{row.label}</span>
                    <span className="text-sm font-bold text-slate-800">{row.value}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`${row.color} h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{pct}% du total</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-5">
            Statut
          </h2>
          <div className="space-y-3.5">
            {[
              { label: "Total équipements", value: totalEquipment ?? 0, dot: "bg-slate-400" },
              { label: "Disponibles", value: availableEquipment ?? 0, dot: "bg-indigo-500" },
              { label: "Sortis", value: activeLoans ?? 0, dot: "bg-teal-500" },
              { label: "En retard", value: overdueLoans ?? 0, dot: "bg-red-400" },
              { label: "En attente", value: pendingLoans ?? 0, dot: "bg-amber-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${item.dot} shrink-0`} />
                  <span className="text-sm text-slate-500">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-800 tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
