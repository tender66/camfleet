import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/get-profile";
import { ProductionsClient } from "./productions-client";

export default async function ProductionsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [{ data: productions }, { data: locations }] = await Promise.all([
    supabase.from("productions").select("*, locations(id, name)").order("name"),
    supabase.from("locations").select("id, name, is_active").order("name"),
  ]);

  return (
    <ProductionsClient
      productions={(productions as any[]) ?? []}
      locations={(locations as any[]) ?? []}
      isManager={profile?.role === "manager"}
    />
  );
}
