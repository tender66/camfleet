"use client";

import { useRouter } from "next/navigation";
import { LogOut, Users, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import Link from "next/link";

export function MobileHeader({ profile }: { profile: Profile }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile.email[0].toUpperCase();

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500 shadow-sm shadow-indigo-500/30">
          <Video className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-slate-800 tracking-tight">CamFleet</span>
      </div>

      <Sheet>
        <SheetTrigger className="rounded-full focus:outline-none">
          <Avatar className="h-8 w-8 ring-2 ring-slate-200">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </SheetTrigger>

        <SheetContent side="right" className="w-72">
          <SheetHeader className="text-left pb-2">
            <SheetTitle className="text-base font-bold">Mon profil</SheetTitle>
          </SheetHeader>

          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
              <Avatar className="h-11 w-11">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-indigo-500 text-white text-sm font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{profile.full_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                <Badge variant="secondary" className="mt-1.5 text-[10px] h-4 px-1.5">
                  {profile.role === "manager" ? "Gestionnaire" : "Personnel"}
                </Badge>
              </div>
            </div>

            {profile.role === "manager" && (
              <>
                <Separator />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">
                    Administration
                  </p>
                  <Link
                    href="/users"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Utilisateurs
                  </Link>
                </div>
              </>
            )}

            <Separator />

            <Button variant="destructive" className="w-full gap-2 rounded-xl h-10" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
