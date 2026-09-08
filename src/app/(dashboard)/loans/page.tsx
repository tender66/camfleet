import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/get-profile";
import { LoansClient } from "./loans-client";

export default async function LoansPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  let query = supabase
    .from("loans")
    .select(`
      *,
      equipment(id, name, asset_number),
      borrower:profiles!borrower_id(id, full_name, email),
      from_loc:locations!from_location_id(id, name),
      to_loc:locations!to_location_id(id, name),
      productions(id, name)
    `)
    .order("created_at", { ascending: false });

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const [
    { data: loans },
    { data: availableEquipment },
    { data: locations },
    { data: productions },
  ] = await Promise.all([
    query,
    supabase.from("equipment").select("id, name, asset_number, current_location_id").eq("status", "available").order("name"),
    supabase.from("locations").select("id, name").order("name"),
    supabase.from("productions").select("id, name").eq("is_active", true).order("name"),
  ]);

  return (
    <LoansClient
      loans={(loans as any[]) ?? []}
      availableEquipment={(availableEquipment as any[]) ?? []}
      locations={(locations as any[]) ?? []}
      productions={(productions as any[]) ?? []}
      isManager={profile?.role === "manager"}
      userId={profile?.id ?? ""}
      currentStatus={params.status ?? "all"}
    />
  );
}
