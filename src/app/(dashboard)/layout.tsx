import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import type { Profile } from "@/types/database";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = data as Profile | null;

  if (!profile?.is_active) redirect("/login?error=inactive");

  return (
    <div className="flex h-full min-h-screen bg-slate-100">
      <AppSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader profile={profile} />
        <main className="flex-1 flex flex-col pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
