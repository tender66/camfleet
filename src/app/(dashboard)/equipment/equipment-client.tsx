"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { EquipmentDialog } from "@/components/equipment/equipment-dialog";
import { EquipmentStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronRight, ChevronDown, Package2, Box, AlertCircle, CheckCircle2, Pencil, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EquipmentCategory, Location } from "@/types/database";

interface EquipmentItem {
  id: string; asset_number: string; name: string; brand: string | null;
  model: string | null; serial_number: string | null; category_id: string | null;
  parent_id: string | null; current_location_id: string | null;
  status: string; notes: string | null;
  equipment_categories: { id: string; name: string } | null;
  locations: { id: string; name: string } | null;
}

interface EquipmentClientProps {
  equipment: EquipmentItem[];
  categories: EquipmentCategory[];
  locations: Location[];
  parentOptions: { id: string; name: string; asset_number: string }[];
  isManager: boolean;
  filters: { category?: string; status?: string; location?: string; q?: string };
}

export function EquipmentClient({ equipment, categories, locations, parentOptions, isManager, filters }: EquipmentClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentItem | undefined>();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState(filters.q ?? "");

  // Build parent → children map
  const childrenByParent = new Map<string, EquipmentItem[]>();
  for (const item of equipment) {
    if (item.parent_id) {
      if (!childrenByParent.has(item.parent_id)) childrenByParent.set(item.parent_id, []);
      childrenByParent.get(item.parent_id)!.push(item);
    }
  }

  const rootItems = equipment.filter(e => !e.parent_id);
  const kits = rootItems.filter(e => childrenByParent.has(e.id));
  const spare = rootItems.filter(e => !childrenByParent.has(e.id));

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openAdd() { setEditing(undefined); setDialogOpen(true); }
  function openEdit(item: EquipmentItem) { setEditing(item); setDialogOpen(true); }

  function applyFilter(key: string, value: string | null) {
    const sp = new URLSearchParams();
    if (filters.category && key !== "category") sp.set("category", filters.category);
    if (filters.status && key !== "status") sp.set("status", filters.status);
    if (filters.location && key !== "location") sp.set("location", filters.location);
    if (filters.q && key !== "q") sp.set("q", filters.q);
    if (value) sp.set(key, value);
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilter("q", search || null);
  }

  function clearFilters() { router.push(pathname); setSearch(""); }
  const hasFilters = filters.category || filters.status || filters.location || filters.q;

  function getCompleteness(kit: EquipmentItem) {
    const children = childrenByParent.get(kit.id) ?? [];
    const present = children.filter(c => c.status !== "on_loan" && c.status !== "retired").length;
    return { total: children.length, present };
  }

  const EditBtn = ({ item }: { item: EquipmentItem }) => (
    <button
      className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-300 hover:text-slate-600 transition-colors"
      onClick={e => { e.stopPropagation(); openEdit(item); }}
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Inventaire</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Équipements</h1>
        </div>
        {isManager && (
          <Button onClick={openAdd} size="sm" className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <form onSubmit={handleSearch} className="flex gap-1.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nom ou asset#…"
              className="pl-8 h-8 w-44 text-xs"
            />
          </div>
          <Button type="submit" size="sm" className="h-8 px-3 text-xs">Chercher</Button>
        </form>
        <Select value={filters.category ?? "all"} onValueChange={v => applyFilter("category", v === "all" ? null : v)}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.status ?? "all"} onValueChange={v => applyFilter("status", v === "all" ? null : v)}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="available">Disponible</SelectItem>
            <SelectItem value="on_loan">En emprunt</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="retired">Retiré</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.location ?? "all"} onValueChange={v => applyFilter("location", v === "all" ? null : v)}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Lieu" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les lieux</SelectItem>
            {locations.filter(l => l.is_active).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs gap-1 text-slate-500">
            <X className="h-3.5 w-3.5" /> Effacer
          </Button>
        )}
        <span className="ml-auto text-xs text-slate-400 hidden sm:block">
          {equipment.length} équipement{equipment.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty state */}
      {equipment.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Package2 className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">Aucun équipement trouvé</p>
          <p className="text-xs text-slate-400 mt-1">Ajoutez des équipements ou modifiez les filtres.</p>
        </div>
      )}

      {/* Kits / Ensembles */}
      {kits.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Package2 className="h-4 w-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Ensembles · Kits ({kits.length})
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
            {kits.map(kit => {
              const isExpanded = expanded.has(kit.id);
              const { total, present } = getCompleteness(kit);
              const isComplete = present === total;
              const children = childrenByParent.get(kit.id) ?? [];

              return (
                <div key={kit.id}>
                  {/* Kit header row */}
                  <div
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer select-none transition-colors"
                    onClick={() => toggleExpand(kit.id)}
                  >
                    <span className={cn("shrink-0 transition-colors", isExpanded ? "text-indigo-400" : "text-slate-300")}>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>

                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <Package2 className="h-4 w-4 text-indigo-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">{kit.name}</span>
                        <span className="font-mono text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded">
                          {kit.asset_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {kit.equipment_categories && (
                          <span className="text-xs text-slate-400">{kit.equipment_categories.name}</span>
                        )}
                        {kit.locations && (
                          <span className="text-xs text-slate-300">· {kit.locations.name}</span>
                        )}
                      </div>
                    </div>

                    {/* Completeness badge */}
                    <div className={cn(
                      "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0",
                      isComplete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    )}>
                      {isComplete
                        ? <><CheckCircle2 className="h-3.5 w-3.5" /> Complet</>
                        : <><AlertCircle className="h-3.5 w-3.5" /> {present}/{total} pièces</>
                      }
                    </div>

                    <EquipmentStatusBadge status={kit.status as any} />
                    {isManager && <EditBtn item={kit} />}
                  </div>

                  {/* Component rows */}
                  {isExpanded && (
                    <div className="bg-slate-50/60 divide-y divide-slate-100/80">
                      {children.map(child => {
                        const movedAway = child.current_location_id && child.current_location_id !== kit.current_location_id;
                        return (
                          <div key={child.id} className="flex items-center gap-3 pl-14 pr-4 py-3 hover:bg-slate-100/50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-slate-700">{child.name}</span>
                                <span className="font-mono text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                                  {child.asset_number}
                                </span>
                                {movedAway && child.locations && (
                                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                                    → {child.locations.name}
                                  </span>
                                )}
                              </div>
                              {child.equipment_categories && (
                                <span className="text-[11px] text-slate-400">{child.equipment_categories.name}</span>
                              )}
                            </div>
                            <EquipmentStatusBadge status={child.status as any} />
                            {isManager && <EditBtn item={child} />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Spare / standalone */}
      {spare.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Équipements spare · autonomes ({spare.length})
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Nom</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden md:table-cell">Catégorie</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden lg:table-cell">Lieu</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Statut</th>
                  {isManager && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {spare.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <span className="font-mono text-[10px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">{item.asset_number}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-xs text-slate-500">{item.equipment_categories?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-slate-500">{item.locations?.name ?? "—"}</td>
                    <td className="px-5 py-3.5"><EquipmentStatusBadge status={item.status as any} /></td>
                    {isManager && (
                      <td className="px-5 py-3.5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <EquipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        equipment={editing}
        categories={categories}
        locations={locations}
        parentOptions={parentOptions}
      />
    </div>
  );
}
