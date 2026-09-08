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

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  availableEquipment: { id: string; name: string; asset_number: string; current_location_id: string | null }[];
  locations: { id: string; name: string }[];
  productions: { id: string; name: string }[];
}

export function LoanDialog({ open, onOpenChange, userId, availableEquipment, locations, productions }: LoanDialogProps) {
  const router = useRouter();
  const [equipmentId, setEquipmentId] = useState("none");
  const [toLocationId, setToLocationId] = useState("none");
  const [productionId, setProductionId] = useState("none");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedEquipment = availableEquipment.find(e => e.id === equipmentId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (equipmentId === "none" || toLocationId === "none" || !expectedReturn) return;
    setLoading(true);
    setError("");

    const supabase = createClient() as any;
    const { error: err } = await supabase.from("loans").insert({
      equipment_id: equipmentId,
      borrower_id: userId,
      from_location_id: selectedEquipment?.current_location_id ?? null,
      to_location_id: toLocationId,
      production_id: productionId === "none" ? null : productionId,
      expected_return_date: expectedReturn,
      status: "pending",
      notes: notes.trim() || null,
    });

    setLoading(false);
    if (err) { setError(err.message); return; }
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Nouvelle demande d&apos;emprunt</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Équipement <span className="text-red-500">*</span>
            </Label>
            <Select value={equipmentId} onValueChange={v => setEquipmentId(v ?? "none")}>
              <SelectTrigger><SelectValue placeholder="Choisir un équipement…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sélectionner…</SelectItem>
                {availableEquipment.map(eq => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.name} · <span className="font-mono text-xs">{eq.asset_number}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEquipment?.current_location_id && (
              <p className="text-xs text-slate-400">
                Lieu actuel : {locations.find(l => l.id === selectedEquipment.current_location_id)?.name ?? "—"}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Destination <span className="text-red-500">*</span>
            </Label>
            <Select value={toLocationId} onValueChange={v => setToLocationId(v ?? "none")}>
              <SelectTrigger><SelectValue placeholder="Lieu de destination…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sélectionner…</SelectItem>
                {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Production</Label>
            <Select value={productionId} onValueChange={v => setProductionId(v ?? "none")}>
              <SelectTrigger><SelectValue placeholder="Aucune production…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                {productions.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Retour prévu <span className="text-red-500">*</span>
            </Label>
            <Input type="datetime-local" value={expectedReturn} onChange={e => setExpectedReturn(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Raison, détails…" />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loading || equipmentId === "none" || toLocationId === "none" || !expectedReturn}>
              {loading ? "Envoi…" : "Soumettre la demande"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
