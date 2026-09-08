"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProductionDialog } from "@/components/productions/production-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clapperboard, Pencil, MapPin, Calendar } from "lucide-react";
import type { Location } from "@/types/database";

interface Production {
  id: string; name: string; description: string | null;
  location_id: string | null; start_date: string | null; end_date: string | null;
  is_active: boolean; created_at: string; updated_at: string;
  locations: { id: string; name: string } | null;
}

interface ProductionsClientProps {
  productions: Production[];
  locations: Location[];
  isManager: boolean;
}

export function ProductionsClient({ productions, locations, isManager }: ProductionsClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<any>(undefined);

  function openAdd() { setSelected(undefined); setDialogOpen(true); }
  function openEdit(p: Production) { setSelected(p); setDialogOpen(true); }

  async function toggleActive(p: Production) {
    const supabase = createClient() as any;
    await supabase.from("productions").update({ is_active: !p.is_active }).eq("id", p.id);
    router.refresh();
  }

  function formatDate(d: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Gestion</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Productions</h1>
        </div>
        {isManager && (
          <Button onClick={openAdd} size="sm" className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        )}
      </div>

      {productions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Clapperboard className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">Aucune production enregistrée</p>
          <p className="text-xs text-slate-400 mt-1">Ajoutez vos productions actives.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Production</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden md:table-cell">Lieu</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden lg:table-cell">Période</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Statut</th>
                {isManager && <th className="px-5 py-3.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {productions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Clapperboard className="h-4 w-4 text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        {p.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {p.locations ? (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="text-xs">{p.locations.name}</span>
                      </div>
                    ) : <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    {(p.start_date || p.end_date) ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(p.start_date)} {p.end_date ? `→ ${formatDate(p.end_date)}` : ""}
                      </div>
                    ) : <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold ${
                        p.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  {isManager && (
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(p)}>
                          <Pencil className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-slate-400 hover:text-slate-700"
                          onClick={() => toggleActive(p)}
                        >
                          {p.is_active ? "Désactiver" : "Activer"}
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        production={selected}
        locations={locations}
      />
    </div>
  );
}
