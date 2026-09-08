"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LocationDialog } from "@/components/locations/location-dialog";
import { LocationTypeBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import type { Location } from "@/types/database";

interface LocationsClientProps {
  locations: Location[];
  isManager: boolean;
}

export function LocationsClient({ locations, isManager }: LocationsClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Location | undefined>();

  function openAdd() { setSelected(undefined); setDialogOpen(true); }
  function openEdit(loc: Location) { setSelected(loc); setDialogOpen(true); }

  async function toggleActive(loc: Location) {
    const supabase = createClient() as any;
    await supabase.from("locations").update({ is_active: !loc.is_active }).eq("id", loc.id);
    router.refresh();
  }

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Gestion</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lieux</h1>
        </div>
        {isManager && (
          <Button onClick={openAdd} size="sm" className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Ajouter un lieu
          </Button>
        )}
      </div>

      {/* Grid */}
      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <MapPin className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">Aucun lieu enregistré</p>
          <p className="text-xs text-slate-400 mt-1">Ajoutez vos entrepôts et lieux de tournage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                loc.is_active ? "border-slate-100" : "border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                  </div>
                  <p className="font-semibold text-slate-800 text-sm truncate">{loc.name}</p>
                </div>
                <LocationTypeBadge type={loc.type} />
              </div>

              {loc.description && (
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{loc.description}</p>
              )}

              {isManager && (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 text-xs gap-1.5 text-slate-500 hover:text-slate-800"
                    onClick={() => openEdit(loc)}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 text-xs gap-1.5 text-slate-500 hover:text-slate-800 ml-auto"
                    onClick={() => toggleActive(loc)}
                  >
                    {loc.is_active
                      ? <><ToggleRight className="h-3.5 w-3.5 text-emerald-500" /> Actif</>
                      : <><ToggleLeft className="h-3.5 w-3.5" /> Inactif</>}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <LocationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        location={selected}
      />
    </div>
  );
}
