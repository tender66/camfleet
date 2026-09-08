import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/get-profile";
import { LocationsClient } from "./locations-client";

export default async function LocationsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .order("name");

  return (
    <LocationsClient
      locations={locations ?? []}
      isManager={profile?.role === "manager"}
    />
  );
}
