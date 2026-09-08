"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoanDialog } from "@/components/loans/loan-dialog";
import { LoanStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeftRight, Check, RotateCcw, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "active", label: "Actifs" },
  { value: "overdue", label: "En retard" },
  { value: "returned", label: "Retournés" },
  { value: "cancelled", label: "Annulés" },
];

interface Loan {
  id: string; status: string; expected_return_date: string | null;
  actual_return_date: string | null; notes: string | null; created_at: string;
  borrower_id: string;
  equipment: { id: string; name: string; asset_number: string } | null;
  borrower: { id: string; full_name: string | null; email: string } | null;
  from_loc: { id: string; name: string } | null;
  to_loc: { id: string; name: string } | null;
  productions: { id: string; name: string } | null;
}

interface LoansClientProps {
  loans: Loan[];
  availableEquipment: { id: string; name: string; asset_number: string; current_location_id: string | null }[];
  locations: { id: string; name: string }[];
  productions: { id: string; name: string }[];
  isManager: boolean;
  userId: string;
  currentStatus: string;
}

export function LoansClient({ loans, availableEquipment, locations, productions, isManager, userId, currentStatus }: LoansClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = useState(false);

  function setFilter(status: string) {
    router.push(status === "all" ? pathname : `${pathname}?status=${status}`);
  }

  async function approveLoan(loan: Loan) {
    const supabase = createClient() as any;
    await supabase.from("loans").update({ status: "active" }).eq("id", loan.id);
    if (loan.equipment?.id) {
      await supabase.from("equipment").update({ status: "on_loan" }).eq("id", loan.equipment.id);
    }
    router.refresh();
  }

  async function returnLoan(loan: Loan) {
    const supabase = createClient() as any;
    await supabase.from("loans").update({
      status: "returned",
      actual_return_date: new Date().toISOString(),
    }).eq("id", loan.id);
    if (loan.equipment?.id) {
      await supabase.from("equipment").update({ status: "available", current_location_id: loan.to_loc?.id ?? null }).eq("id", loan.equipment.id);
    }
    router.refresh();
  }

  async function cancelLoan(loan: Loan) {
    const supabase = createClient() as any;
    await supabase.from("loans").update({ status: "cancelled" }).eq("id", loan.id);
    router.refresh();
  }

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="p-5 md:p-8 space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Gestion</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Emprunts</h1>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Nouvelle demande
        </Button>
      </div>

      {/* Status filters */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              currentStatus === f.value
                ? "bg-indigo-500 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <ArrowLeftRight className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">Aucun emprunt trouvé</p>
          <p className="text-xs text-slate-400 mt-1">Créez une nouvelle demande d&apos;emprunt.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Équipement</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden md:table-cell">Emprunteur</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden lg:table-cell">Trajet</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Retour prévu</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Statut</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loans.map((loan) => {
                const isOwnLoan = loan.borrower_id === userId;
                const canCancel = isOwnLoan && loan.status === "pending";
                const canApprove = isManager && loan.status === "pending";
                const canReturn = isManager && (loan.status === "active" || loan.status === "overdue");

                return (
                  <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{loan.equipment?.name ?? "—"}</p>
                      <span className="font-mono text-[10px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {loan.equipment?.asset_number}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-slate-700">{loan.borrower?.full_name ?? loan.borrower?.email ?? "—"}</p>
                      {loan.productions && <p className="text-xs text-slate-400">{loan.productions.name}</p>}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span>{loan.from_loc?.name ?? "—"}</span>
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        <span>{loan.to_loc?.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-slate-600">{formatDate(loan.expected_return_date)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <LoanStatusBadge status={loan.status as any} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {canApprove && (
                          <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => approveLoan(loan)}>
                            <Check className="h-3.5 w-3.5" /> Approuver
                          </Button>
                        )}
                        {canReturn && (
                          <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => returnLoan(loan)}>
                            <RotateCcw className="h-3.5 w-3.5" /> Retour
                          </Button>
                        )}
                        {canCancel && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-slate-400 hover:text-red-600" onClick={() => cancelLoan(loan)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <LoanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userId={userId}
        availableEquipment={availableEquipment}
        locations={locations}
        productions={productions}
      />
    </div>
  );
}
