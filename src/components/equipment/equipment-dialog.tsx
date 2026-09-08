"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EquipmentCategory, Location } from "@/types/database";

interface EquipmentItem {
  id: string; asset_number: string; name: string; brand: string | null;
  model: string | null; serial_number: string | null; category_id: string | null;
  parent_id: string | null; current_location_id: string | null;
  status: string; notes: string | null;
}

interface EquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: EquipmentItem;
  categories: EquipmentCategory[];
  locations: Location[];
  parentOptions: { id: string; name: string; asset_number: string }[];
}

export function EquipmentDialog({ open, onOpenChange, equipment, categories, locations, parentOptions }: EquipmentDialogProps) {
  const router = useRouter();
  const isEdit = !!equipment;
  const db = createClient() as any;

  const [assetNumber, setAssetNumber] = useState(equipment?.asset_number ?? "");
  const [name, setName] = useState(equipment?.name ?? "");
  const [brand, setBrand] = useState(equipment?.brand ?? "");
  const [model, setModel] = useState(equipment?.model ?? "");
  const [serial, setSerial] = useState(equipment?.serial_number ?? "");
  const [categoryId, setCategoryId] = useState(equipment?.category_id ?? "none");
  const [parentId, setParentId] = useState(equipment?.parent_id ?? "none");
  const [locationId, setLocationId] = useState(equipment?.current_location_id ?? "none");
  const [status, setStatus] = useState(equipment?.status ?? "available");
  const [notes, setNotes] = useState(equipment?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assetNumber.trim() || !name.trim()) return;
    setLoading(true);
    setError("");
    const payload = {
      asset_number: assetNumber.trim().toUpperCase(),
      name: name.trim(),
      brand: brand.trim() || null,
      model: model.trim() || null,
      serial_number: serial.trim() || null,
      category_id: categoryId === "none" ? null : categoryId,
      parent_id: parentId === "none" ? null : parentId,
      current_location_id: locationId === "none" ? null : locationId,
      status,
      notes: notes.trim() || null,
    };
    const { error: err } = isEdit
      ? await db.from("equipment").update(payload).eq("id", equipment.id)
      : await db.from("equipment").insert(payload);
    setLoading(false);
    if (err) { setError(err.message); return; }
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isEdit ? "Modifier l'équipement" : "Ajouter un équipement"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Asset # <span className="text-red-500">*</span></Label>
              <Input value={assetNumber} onChange={e => setAssetNumber(e.target.value)} placeholder="RC-12345" required className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</Label>
              <Select value={status} onValueChange={v => setStatus(v ?? "available")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="on_loan">En emprunt</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nom <span className="text-red-500">*</span></Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Caméra HDC-3500 #3" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Marque</Label>
              <Input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Sony, Canon…" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modèle</Label>
              <Input value={model} onChange={e => setModel(e.target.value)} placeholder="HDC-3500…" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">N° de série</Label>
              <Input value={serial} onChange={e => setSerial(e.target.value)} className="font-mono text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catégorie</Label>
              <Select value={categoryId} onValueChange={v => setCategoryId(v ?? "none")}>
                <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lieu actuel</Label>
            <Select value={locationId} onValueChange={v => setLocationId(v ?? "none")}>
              <SelectTrigger><SelectValue placeholder="Choisir un lieu…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Non défini</SelectItem>
                {locations.filter(l => l.is_active).map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Appartient au kit / ensemble</Label>
            <Select value={parentId} onValueChange={v => setParentId(v ?? "none")}>
              <SelectTrigger><SelectValue placeholder="Équipement autonome (spare)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Autonome (spare)</SelectItem>
                {parentOptions
                  .filter(p => p.id !== equipment?.id)
                  .map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} · {p.asset_number}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes optionnelles…" />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? "Enregistrement…" : isEdit ? "Modifier" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
