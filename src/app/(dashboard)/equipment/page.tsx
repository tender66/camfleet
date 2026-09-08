import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/get-profile";
import { EquipmentClient } from "./equipment-client";

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; location?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const db = supabase as any;
  const profile = await getCurrentProfile();

  let query = db
    .from("equipment")
    .select("*, equipment_categories(id, name), locations(id, name)")
    .order("name");

  if (params.category) query = query.eq("category_id", params.category);
  if (params.status) query = query.eq("status", params.status);
  if (params.location) query = query.eq("current_location_id", params.location);
  if (params.q) query = query.ilike("name", `%${params.q}%`);

  const [
    { data: equipment },
    { data: categories },
    { data: locations },
    { data: parentOptions },
  ] = await Promise.all([
    query,
    db.from("equipment_categories").select("*").order("name"),
    db.from("locations").select("id, name, is_active").order("name"),
    db.from("equipment").select("id, name, asset_number").is("parent_id", null).order("name"),
  ]);

  return (
    <EquipmentClient
      equipment={(equipment as any[]) ?? []}
      categories={(categories as any[]) ?? []}
      locations={(locations as any[]) ?? []}
      parentOptions={(parentOptions as any[]) ?? []}
      isManager={profile?.role === "manager"}
      filters={params}
    />
  );
}
