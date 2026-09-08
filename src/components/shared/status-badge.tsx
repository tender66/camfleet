import { Badge } from "@/components/ui/badge";
import type { EquipmentStatus, LoanStatus, LocationType } from "@/types/database";

const equipmentStatusMap: Record<EquipmentStatus, { label: string; className: string }> = {
  available:   { label: "Disponible",   className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  on_loan:     { label: "En emprunt",   className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  maintenance: { label: "Maintenance",  className: "bg-amber-50 text-amber-700 border-amber-200" },
  retired:     { label: "Retiré",       className: "bg-slate-100 text-slate-500 border-slate-200" },
};

const loanStatusMap: Record<LoanStatus, { label: string; className: string }> = {
  pending:   { label: "En attente", className: "bg-amber-50 text-amber-700 border-amber-200" },
  approved:  { label: "Approuvé",   className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  active:    { label: "Actif",      className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  returned:  { label: "Retourné",   className: "bg-slate-100 text-slate-500 border-slate-200" },
  overdue:   { label: "En retard",  className: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "Annulé",     className: "bg-slate-100 text-slate-400 border-slate-200" },
};

const locationTypeMap: Record<LocationType, { label: string; className: string }> = {
  storage:  { label: "Entrepôt",  className: "bg-slate-100 text-slate-600 border-slate-200" },
  shooting: { label: "Tournage",  className: "bg-teal-50 text-teal-700 border-teal-200" },
  both:     { label: "Mixte",     className: "bg-violet-50 text-violet-700 border-violet-200" },
};

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  const cfg = equipmentStatusMap[status];
  return <Badge variant="outline" className={`text-[11px] font-semibold ${cfg.className}`}>{cfg.label}</Badge>;
}

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const cfg = loanStatusMap[status];
  return <Badge variant="outline" className={`text-[11px] font-semibold ${cfg.className}`}>{cfg.label}</Badge>;
}

export function LocationTypeBadge({ type }: { type: LocationType }) {
  const cfg = locationTypeMap[type];
  return <Badge variant="outline" className={`text-[11px] font-semibold ${cfg.className}`}>{cfg.label}</Badge>;
}
