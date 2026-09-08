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
import type { Production, Location } from "@/types/database";

interface ProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  production?: Production;
  locations: Location[];
}

export function ProductionDialog({ open, onOpenChange, production, locations }: ProductionDialogProps) {
  const router = useRouter();
  const isEdit = !!production;
  const db = createClient() as any;

  const [name, setName] = useState(production?.name ?? "");
  const [description, setDescription] = useState(production?.description ?? "");
  const [locationId, setLocationId] = useState(production?.location_id ?? "none");
  const [startDate, setStartDate] = useState(production?.start_date ?? "");
  const [endDate, setEndDate] = useState(production?.end_date ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      location_id: locationId === "none" ? null : locationId,
      start_date: startDate || null,
      end_date: endDate || null,
    };
    const { error: err } = isEdit
      ? await db.from("productions").update(payload).eq("id", production.id)
      : await db.from("productions").insert(payload);
    setLoading(false);
    if (err) { setError(err.message); return; }
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isEdit ? "Modifier la production" : "Ajouter une production"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nom <span className="text-red-500">*</span>
            </Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Téléjournal 18h" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lieu principal</Label>
            <Select value={locationId} onValueChange={v => setLocationId(v ?? "none")}>
              <SelectTrigger><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun</SelectItem>
                {locations.filter(l => l.is_active).map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date début</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date fin</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Notes optionnelles…" />
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
