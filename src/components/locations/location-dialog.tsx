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
import type { Location } from "@/types/database";

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Location;
}

export function LocationDialog({ open, onOpenChange, location }: LocationDialogProps) {
  const router = useRouter();
  const isEdit = !!location;
  const db = createClient() as any;

  const [name, setName] = useState(location?.name ?? "");
  const [description, setDescription] = useState(location?.description ?? "");
  const [type, setType] = useState(location?.type ?? "storage");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    const payload = { name: name.trim(), description: description.trim() || null, type };
    const { error: err } = isEdit
      ? await db.from("locations").update(payload).eq("id", location.id)
      : await db.from("locations").insert(payload);
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
            {isEdit ? "Modifier le lieu" : "Ajouter un lieu"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nom <span className="text-red-500">*</span>
            </Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Studio A, Entrepôt MRC" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</Label>
            <Select value={type} onValueChange={v => setType(v ?? "storage")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="storage">Entrepôt</SelectItem>
                <SelectItem value="shooting">Lieu de tournage</SelectItem>
                <SelectItem value="both">Mixte</SelectItem>
              </SelectContent>
            </Select>
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
